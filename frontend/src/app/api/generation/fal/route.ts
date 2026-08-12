import { NextResponse, type NextRequest } from 'next/server';

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  falModels,
  getFalGenerationQuote,
  submitFalRequest,
  type FalGenerationKind,
  type GenerationQuote,
} from '@/lib/generation/server';
import { quoteIsWithinLimit } from '@/lib/generation/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function isAllowlisted(email: string | null | undefined) {
  const allowed = (process.env.GENERATION_TEST_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

function paidGenerationEnabled(email: string | null | undefined) {
  return process.env.ENABLE_PAID_GENERATION?.trim() === 'true' && isAllowlisted(email);
}

function simulationEnabled(email: string | null | undefined) {
  return process.env.ENABLE_GENERATION_SIMULATION?.trim() === 'true' && isAllowlisted(email);
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

async function availableQuotes(enabled: boolean) {
  if (!enabled) return { quotes: null, pricingAvailable: false };
  const settled = await Promise.allSettled([
    getFalGenerationQuote('reference'),
    getFalGenerationQuote('video'),
  ]);
  if (settled.some((result) => result.status === 'rejected')) {
    return { quotes: null, pricingAvailable: false };
  }
  return {
    quotes: {
      reference: (settled[0] as PromiseFulfilledResult<GenerationQuote>).value,
      video: (settled[1] as PromiseFulfilledResult<GenerationQuote>).value,
    },
    pricingAvailable: true,
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const enabled = Boolean(user && paidGenerationEnabled(user.email));

  return NextResponse.json({
    enabled,
    simulationEnabled: Boolean(user && simulationEnabled(user.email)),
    ...(await availableQuotes(enabled)),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return error(401, 'unauthorized', 'Sign in is required.');

  let body: {
    projectId?: unknown;
    shotId?: unknown;
    kind?: unknown;
    prompt?: unknown;
    imageUrl?: unknown;
    mode?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return error(400, 'invalid_json', 'A valid JSON body is required.');
  }

  const mode = body.mode === 'simulation' ? 'simulation' : 'paid';
  if (mode === 'simulation' ? !simulationEnabled(user.email) : !paidGenerationEnabled(user.email)) {
    return error(403, 'generation_not_enabled', `${mode === 'simulation' ? 'Simulation' : 'Paid generation'} is not enabled for this account.`);
  }

  const kind: FalGenerationKind | null = body.kind === 'reference' || body.kind === 'video' ? body.kind : null;
  const projectId = typeof body.projectId === 'string' ? body.projectId : '';
  const shotId = typeof body.shotId === 'string' ? body.shotId : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!kind || !/^[0-9a-f-]{36}$/i.test(projectId) || !/^shot-[1-8]$/.test(shotId) || prompt.length < 10 || prompt.length > 2000) {
    return error(400, 'invalid_request', 'Project, shot, kind, or prompt is invalid.');
  }
  if (kind === 'video' && !isHttpsUrl(body.imageUrl)) {
    return error(400, 'reference_required', 'A secure reference image URL is required.');
  }

  const { data: project, error: projectError } = await supabase
    .from('anisora_projects').select('id').eq('id', projectId).eq('user_id', user.id).maybeSingle();
  if (projectError) return error(500, 'project_lookup_failed', 'Could not verify the project.');
  if (!project) return error(404, 'project_not_found', 'Save this Director project first.');

  const taskId = crypto.randomUUID();
  const model = mode === 'simulation' ? 'anisora/pipeline-simulation' : falModels[kind];

  if (mode === 'simulation') {
    const mediaUrl = new URL('/examples/image_5.jpg', request.nextUrl.origin).toString();
    const billing = { mode: 'simulation', currency: 'USD', estimatedCostUsd: 0, actualCostUsd: 0 };
    const { error: taskError } = await supabase.from('anisora_tasks').insert({
      id: taskId, project_id: projectId, user_id: user.id,
      title: `Pipeline simulation: ${shotId}`, status: 'done', provider: 'simulation',
      input: { source: 'anime-director-generation', kind: 'reference', shotId, model, prompt, billing },
      output: { mediaUrl, contentType: 'image/jpeg', archiveStatus: 'simulation', billing },
    });
    if (taskError) return error(500, 'task_create_failed', 'Could not create the simulation task.');

    const { error: assetError } = await supabase.from('anisora_assets').upsert({
      id: taskId, project_id: projectId, user_id: user.id,
      name: `Simulated reference: ${shotId}`, url: mediaUrl, kind: 'reference',
      metadata: { source: 'generation-simulation', taskId, shotId, billing },
    });
    if (assetError) {
      await supabase.from('anisora_tasks').update({ status: 'failed', error_message: 'Simulation asset persistence failed.' }).eq('id', taskId).eq('user_id', user.id);
      return error(500, 'asset_create_failed', 'Could not persist the simulation asset.');
    }
    return NextResponse.json({ taskId, status: 'done', mode, estimatedCostUsd: 0 }, { status: 201 });
  }

  let quote: GenerationQuote;
  try {
    quote = await getFalGenerationQuote(kind, { fresh: true });
  } catch {
    return error(503, 'pricing_unavailable', 'Live provider pricing is unavailable, so no paid request was submitted.');
  }
  if (!quoteIsWithinLimit(quote)) {
    return error(409, 'cost_limit_exceeded', `Quoted cost $${quote.estimatedCostUsd.toFixed(4)} exceeds the $${quote.hardLimitUsd.toFixed(2)} task limit.`);
  }

  const billing = { mode: 'quoted', ...quote, quotedAt: new Date().toISOString() };
  const falInput = kind === 'reference'
    ? { prompt, image_size: 'landscape_16_9', num_images: 1, output_format: 'jpeg', enable_safety_checker: true }
    : { prompt, image_url: body.imageUrl, duration: '5', negative_prompt: 'blur, distort, low quality, inconsistent character, text, watermark', cfg_scale: 0.5 };
  const taskInput = { source: 'anime-director-generation', kind, shotId, model, prompt, imageUrl: kind === 'video' ? body.imageUrl : null, billing };

  const { error: taskError } = await supabase.from('anisora_tasks').insert({
    id: taskId, project_id: projectId, user_id: user.id,
    title: `${kind === 'reference' ? 'Reference frame' : '5s video'}: ${shotId}`,
    status: 'running', provider: 'fal', input: taskInput, output: {},
  });
  if (taskError) return error(500, 'task_create_failed', 'Could not create the generation task.');

  try {
    const appUrl = process.env.APP_URL?.trim() || request.nextUrl.origin;
    const webhookUrl = new URL('/api/webhooks/fal', appUrl);
    webhookUrl.searchParams.set('task_id', taskId);
    const submitted = await submitFalRequest({ kind, input: falInput, webhookUrl: webhookUrl.toString() });
    const { error: updateError } = await supabase.from('anisora_tasks').update({
      provider_job_id: submitted.requestId,
      input: { ...taskInput, model: submitted.model, billing: { ...billing, mode: 'submitted', submittedAt: new Date().toISOString() } },
    }).eq('id', taskId).eq('user_id', user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ taskId, requestId: submitted.requestId, status: 'running', quote }, { status: 202 });
  } catch (submissionError) {
    await supabase.from('anisora_tasks').update({
      status: 'failed',
      output: { billing: { ...billing, mode: 'submission_failed', actualCostUsd: null } },
      error_message: submissionError instanceof Error ? submissionError.message.slice(0, 500) : 'fal request submission failed.',
    }).eq('id', taskId).eq('user_id', user.id);
    return error(502, 'provider_rejected', 'The generation provider rejected the request.');
  }
}
