import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getFalGenerationQuote,
  getGenerationAdminClient,
  submitFalRequest,
  type GenerationQuote,
} from '@/lib/generation/server';
import { quoteIsWithinLimit } from '@/lib/generation/pricing';
import { creditsForQuote } from '@/lib/generation/credits';
import { paidGenerationRolloutEnabled } from '@/lib/generation/access';
import {
  ensureGenerationCreditBalance,
  releaseGenerationCredits,
  reserveGenerationCredits,
} from '@/lib/generation/credit-server';
import {
  createQuickGenerationProjectSettings,
  normalizeQuickGenerationPrompt,
  quickGenerationImageLimit,
  quickGenerationInputBucket,
  quickGenerationShotId,
  readQuickGenerationImageType,
} from '@/lib/generation/quick-input';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// fal may queue a request before it downloads the reference image.
const signedInputSeconds = 6 * 60 * 60;
let inputBucketReady = false;

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

async function ensureInputBucket(admin: SupabaseClient) {
  if (inputBucketReady) return;
  const { error: readError } = await admin.storage.getBucket(
    quickGenerationInputBucket,
  );
  if (readError) {
    const { error: createError } = await admin.storage.createBucket(
      quickGenerationInputBucket,
      {
        public: false,
        fileSizeLimit: quickGenerationImageLimit,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
    );
    if (createError && !/already exists/i.test(createError.message)) {
      throw createError;
    }
  }
  inputBucketReady = true;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return error(401, 'unauthorized', 'Sign in is required.');

  if (!paidGenerationRolloutEnabled(user.email)) {
    return error(
      403,
      'generation_not_enabled',
      'Paid generation is temporarily paused.',
    );
  }

  const creditState = await ensureGenerationCreditBalance(user.id).catch(
    () => null,
  );
  if (!creditState) {
    return error(
      503,
      'credits_unavailable',
      'Generation credits are temporarily unavailable.',
    );
  }
  if (creditState.entitlement.tier !== 'pro') {
    return error(
      402,
      'subscription_required',
      'A Studio Pro subscription is required for paid generation.',
    );
  }

  const declaredSize = Number(request.headers.get('content-length') || 0);
  if (declaredSize > quickGenerationImageLimit + 64 * 1024) {
    return error(413, 'image_too_large', 'Images must be 3 MB or smaller.');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error(400, 'invalid_form', 'A prompt and image are required.');
  }

  const prompt = normalizeQuickGenerationPrompt(form.get('prompt'));
  if (!prompt) {
    return error(
      400,
      'invalid_prompt',
      'Describe the motion in 10 to 2,000 characters.',
    );
  }

  const image = form.get('image');
  if (!(image instanceof File)) {
    return error(400, 'image_required', 'Upload a reference image.');
  }
  const bytes = new Uint8Array(await image.arrayBuffer());
  const extension = readQuickGenerationImageType(image.type, bytes);
  if (!extension) {
    return error(
      400,
      'invalid_image',
      'Upload a JPEG, PNG, or WebP image up to 3 MB.',
    );
  }

  let quote: GenerationQuote;
  try {
    quote = await getFalGenerationQuote('video', { fresh: true });
  } catch {
    return error(
      503,
      'pricing_unavailable',
      'Live provider pricing is unavailable, so no paid request was submitted.',
    );
  }
  if (!quoteIsWithinLimit(quote)) {
    return error(
      409,
      'cost_limit_exceeded',
      `Quoted cost $${quote.estimatedCostUsd.toFixed(4)} exceeds the $${quote.hardLimitUsd.toFixed(2)} task limit.`,
    );
  }

  const requiredCredits = creditsForQuote(quote);
  if (!creditState.balance || creditState.balance.available < requiredCredits) {
    return error(
      402,
      'insufficient_credits',
      `This request needs ${requiredCredits} credits.`,
    );
  }

  const admin = getGenerationAdminClient();
  const taskId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const imagePath = `${user.id}/${taskId}.${extension}`;

  let imageUrl: string;
  try {
    await ensureInputBucket(admin);
    const { error: uploadError } = await admin.storage
      .from(quickGenerationInputBucket)
      .upload(imagePath, bytes, { contentType: image.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: signed, error: signError } = await admin.storage
      .from(quickGenerationInputBucket)
      .createSignedUrl(imagePath, signedInputSeconds);
    if (signError || !signed?.signedUrl) throw signError;
    imageUrl = signed.signedUrl;
  } catch {
    return error(
      503,
      'upload_unavailable',
      'The reference image could not be stored. No credits were used.',
    );
  }

  const project = createQuickGenerationProjectSettings(prompt);
  const { error: projectError } = await supabase
    .from('anisora_projects')
    .insert({
      id: projectId,
      user_id: user.id,
      name: project.name,
      active_tool: 'anisora',
      settings: project.settings,
    });
  if (projectError) {
    await admin.storage.from(quickGenerationInputBucket).remove([imagePath]);
    return error(500, 'project_create_failed', 'Could not create the project.');
  }

  const billing = {
    mode: 'quoted',
    ...quote,
    requiredCredits,
    quotedAt: new Date().toISOString(),
  };
  const taskInput = {
    source: 'home-quick-generation',
    kind: 'video',
    shotId: quickGenerationShotId,
    model: quote.model,
    prompt,
    referenceTaskId: null,
    imageStoragePath: imagePath,
    billing,
  };

  const { error: taskError } = await supabase.from('anisora_tasks').insert({
    id: taskId,
    project_id: projectId,
    user_id: user.id,
    title: `5s video: ${quickGenerationShotId}`,
    status: 'todo',
    provider: 'fal',
    input: taskInput,
    output: {},
  });
  if (taskError)
    return error(
      500,
      'task_create_failed',
      'Could not create the generation task.',
    );

  const markFailed = (message: string, output?: Record<string, unknown>) =>
    supabase
      .from('anisora_tasks')
      .update({ status: 'failed', error_message: message, ...(output ? { output } : {}) })
      .eq('id', taskId)
      .eq('user_id', user.id);

  let reservation;
  try {
    reservation = await reserveGenerationCredits(
      user.id,
      taskId,
      requiredCredits,
    );
  } catch {
    await markFailed('Generation credits are temporarily unavailable.');
    return error(
      503,
      'credits_unavailable',
      'Generation credits are temporarily unavailable.',
    );
  }
  if (!reservation.reserved) {
    await markFailed('Insufficient generation credits.');
    return error(
      402,
      'insufficient_credits',
      `This request needs ${requiredCredits} credits.`,
    );
  }

  const appUrl = process.env.APP_URL?.trim() || request.nextUrl.origin;
  const webhookUrl = new URL('/api/webhooks/fal', appUrl);
  webhookUrl.searchParams.set('task_id', taskId);

  let submitted;
  try {
    submitted = await submitFalRequest({
      kind: 'video',
      input: {
        prompt,
        image_url: imageUrl,
        duration: '5',
        negative_prompt:
          'blur, distort, low quality, inconsistent character, text, watermark',
        cfg_scale: 0.5,
      },
      webhookUrl: webhookUrl.toString(),
    });
  } catch (submissionError) {
    await releaseGenerationCredits(user.id, taskId).catch(() => undefined);
    await markFailed(
      submissionError instanceof Error
        ? submissionError.message.slice(0, 500)
        : 'fal request submission failed.',
      {
        billing: { ...billing, mode: 'submission_failed', actualCostUsd: null },
      },
    );
    return error(
      502,
      'provider_rejected',
      'The generation provider rejected the request. Reserved credits were returned.',
    );
  }

  const submittedUpdate = {
    provider_job_id: submitted.requestId,
    status: 'running',
    input: {
      ...taskInput,
      model: submitted.model,
      billing: {
        ...billing,
        mode: 'submitted',
        submittedAt: new Date().toISOString(),
      },
    },
  };
  let { error: updateError } = await supabase
    .from('anisora_tasks')
    .update(submittedUpdate)
    .eq('id', taskId)
    .eq('user_id', user.id);
  if (updateError) {
    const fallback = await admin
      .from('anisora_tasks')
      .update(submittedUpdate)
      .eq('id', taskId)
      .eq('user_id', user.id);
    updateError = fallback.error;
  }
  if (updateError) {
    return error(
      503,
      'task_tracking_failed',
      'The provider accepted the request, but task tracking is delayed. Reserved credits remain protected.',
    );
  }

  return NextResponse.json(
    {
      taskId,
      projectId,
      status: 'running',
      quote: { ...quote, requiredCredits },
    },
    { status: 202 },
  );
}
