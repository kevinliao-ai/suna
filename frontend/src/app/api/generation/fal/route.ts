import { NextResponse, type NextRequest } from 'next/server';

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  falModels,
  submitFalRequest,
  type FalGenerationKind,
} from '@/lib/generation/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function isAllowedTester(email: string | null | undefined) {
  if (process.env.ENABLE_PAID_GENERATION?.trim() !== 'true') return false;
  const allowed = (process.env.GENERATION_TEST_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return error(401, 'unauthorized', 'Sign in is required.');
  if (!isAllowedTester(user.email)) {
    return error(
      403,
      'generation_not_enabled',
      'Paid generation is currently limited to approved production testers.',
    );
  }

  let body: {
    projectId?: unknown;
    shotId?: unknown;
    kind?: unknown;
    prompt?: unknown;
    imageUrl?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return error(400, 'invalid_json', 'A valid JSON body is required.');
  }

  const kind: FalGenerationKind | null =
    body.kind === 'reference' || body.kind === 'video' ? body.kind : null;
  const projectId = typeof body.projectId === 'string' ? body.projectId : '';
  const shotId = typeof body.shotId === 'string' ? body.shotId : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (
    !kind
    || !/^[0-9a-f-]{36}$/i.test(projectId)
    || !/^shot-[1-8]$/.test(shotId)
    || prompt.length < 10
    || prompt.length > 2000
  ) {
    return error(400, 'invalid_request', 'Project, shot, kind, or prompt is invalid.');
  }

  if (kind === 'video' && !isHttpsUrl(body.imageUrl)) {
    return error(400, 'reference_required', 'A secure reference image URL is required.');
  }

  const { data: project, error: projectError } = await supabase
    .from('anisora_projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (projectError) return error(500, 'project_lookup_failed', 'Could not verify the project.');
  if (!project) return error(404, 'project_not_found', 'Save this Director project first.');

  const taskId = crypto.randomUUID();
  const model = falModels[kind];
  const falInput =
    kind === 'reference'
      ? {
          prompt,
          image_size: 'landscape_16_9',
          num_images: 1,
          output_format: 'jpeg',
          enable_safety_checker: true,
        }
      : {
          prompt,
          image_url: body.imageUrl,
          duration: '5',
          negative_prompt: 'blur, distort, low quality, inconsistent character, text, watermark',
          cfg_scale: 0.5,
        };

  const { error: taskError } = await supabase.from('anisora_tasks').insert({
    id: taskId,
    project_id: projectId,
    user_id: user.id,
    title: `${kind === 'reference' ? 'Reference frame' : '5s video'}: ${shotId}`,
    status: 'running',
    provider: 'fal',
    input: {
      source: 'anime-director-generation',
      kind,
      shotId,
      model,
      prompt,
      imageUrl: kind === 'video' ? body.imageUrl : null,
    },
    output: {},
  });

  if (taskError) return error(500, 'task_create_failed', 'Could not create the generation task.');

  try {
    const appUrl = process.env.APP_URL?.trim() || request.nextUrl.origin;
    const webhookUrl = new URL('/api/webhooks/fal', appUrl);
    webhookUrl.searchParams.set('task_id', taskId);

    const submitted = await submitFalRequest({
      kind,
      input: falInput,
      webhookUrl: webhookUrl.toString(),
    });

    const { error: updateError } = await supabase
      .from('anisora_tasks')
      .update({
        provider_job_id: submitted.requestId,
        input: {
          source: 'anime-director-generation',
          kind,
          shotId,
          model: submitted.model,
          prompt,
          imageUrl: kind === 'video' ? body.imageUrl : null,
        },
      })
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json(
      { taskId, requestId: submitted.requestId, status: 'running' },
      { status: 202 },
    );
  } catch (submissionError) {
    await supabase
      .from('anisora_tasks')
      .update({
        status: 'failed',
        error_message:
          submissionError instanceof Error
            ? submissionError.message.slice(0, 500)
            : 'fal request submission failed.',
      })
      .eq('id', taskId)
      .eq('user_id', user.id);

    return error(502, 'provider_rejected', 'The generation provider rejected the request.');
  }
}
