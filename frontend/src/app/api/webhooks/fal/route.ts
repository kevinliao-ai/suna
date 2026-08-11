import { after, NextResponse, type NextRequest } from 'next/server';

import {
  archiveGenerationMedia,
  extractFalMedia,
  getGenerationAdminClient,
  verifyFalWebhook,
} from '@/lib/generation/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FalWebhookPayload {
  request_id?: unknown;
  status?: unknown;
  payload?: unknown;
  error?: unknown;
  payload_error?: unknown;
}

function jsonError(status: number, code: string) {
  return NextResponse.json({ received: false, error: code }, { status });
}

export async function POST(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('task_id');
  if (!taskId || !/^[0-9a-f-]{36}$/i.test(taskId)) {
    return jsonError(400, 'invalid_task');
  }

  const rawBody = await request.text();
  let verified = false;
  try {
    verified = await verifyFalWebhook(request, rawBody);
  } catch {
    return jsonError(503, 'signature_service_unavailable');
  }
  if (!verified) return jsonError(401, 'invalid_signature');

  let event: FalWebhookPayload;
  try {
    event = JSON.parse(rawBody) as FalWebhookPayload;
  } catch {
    return jsonError(400, 'invalid_json');
  }

  if (typeof event.request_id !== 'string') {
    return jsonError(400, 'missing_request_id');
  }

  const admin = getGenerationAdminClient();
  const { data: task, error: readError } = await admin
    .from('anisora_tasks')
    .select('id,project_id,user_id,status,provider_job_id,input,output')
    .eq('id', taskId)
    .maybeSingle();

  if (readError) return jsonError(500, 'task_read_failed');
  if (!task) return jsonError(404, 'task_not_found');
  if (!task.provider_job_id) return jsonError(409, 'task_submission_pending');
  if (task.provider_job_id !== event.request_id) {
    return jsonError(409, 'request_mismatch');
  }
  if (task.status === 'done' || task.status === 'failed') {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const input =
    task.input && typeof task.input === 'object'
      ? (task.input as { kind?: unknown; shotId?: unknown; model?: unknown })
      : {};
  const kind = input.kind === 'video' ? 'video' : 'reference';
  const shotId = typeof input.shotId === 'string' ? input.shotId : 'shot';
  const model = typeof input.model === 'string' ? input.model : 'fal';

  if (event.status !== 'OK') {
    const message =
      typeof event.error === 'string'
        ? event.error
        : typeof event.payload_error === 'string'
          ? event.payload_error
          : 'The generation provider reported an error.';

    const { error: updateError } = await admin
      .from('anisora_tasks')
      .update({
        status: 'failed',
        error_message: message.slice(0, 500),
        output: {
          provider: 'fal',
          requestId: event.request_id,
          status: event.status,
        },
      })
      .eq('id', taskId);

    if (updateError) return jsonError(500, 'task_update_failed');
    return NextResponse.json({ received: true });
  }

  const media = extractFalMedia(event.payload);
  if (!media) {
    const { error: updateError } = await admin
      .from('anisora_tasks')
      .update({
        status: 'failed',
        error_message: 'fal completed without a supported media output.',
        output: {
          provider: 'fal',
          requestId: event.request_id,
          payload: event.payload,
        },
      })
      .eq('id', taskId);

    if (updateError) return jsonError(500, 'task_update_failed');
    return NextResponse.json({ received: true });
  }

  const now = new Date().toISOString();
  const output = {
    provider: 'fal',
    requestId: event.request_id,
    model,
    kind,
    mediaUrl: media.url,
    contentType: media.contentType,
    completedAt: now,
    archiveStatus: process.env.R2_BUCKET ? 'pending' : 'not_configured',
  };

  const { error: updateError } = await admin
    .from('anisora_tasks')
    .update({
      status: 'done',
      output,
      error_message: null,
      updated_at: now,
    })
    .eq('id', taskId);

  if (updateError) return jsonError(500, 'task_update_failed');

  const { error: assetError } = await admin.from('anisora_assets').upsert(
    {
      id: taskId,
      project_id: task.project_id,
      user_id: task.user_id,
      name: `${kind === 'video' ? 'Generated video' : 'Reference frame'} · ${shotId}`,
      url: media.url,
      kind: kind === 'video' ? 'output' : 'reference',
      metadata: output,
      updated_at: now,
    },
    { onConflict: 'id' },
  );

  if (assetError) return jsonError(500, 'asset_update_failed');

  after(async () => {
    try {
      const r2Key = await archiveGenerationMedia({
        taskId,
        projectId: task.project_id,
        userId: task.user_id,
        kind,
        mediaUrl: media.url,
        contentType: media.contentType,
      });
      if (!r2Key) return;

      const archivedOutput = {
        ...output,
        archiveStatus: 'stored',
        r2Key,
      };
      await Promise.all([
        admin
          .from('anisora_tasks')
          .update({ output: archivedOutput })
          .eq('id', taskId),
        admin
          .from('anisora_assets')
          .update({ metadata: archivedOutput })
          .eq('id', taskId),
      ]);
    } catch (archiveError) {
      console.error('R2 archive failed:', {
        taskId,
        message:
          archiveError instanceof Error ? archiveError.message : 'Unknown error',
      });
      await admin
        .from('anisora_tasks')
        .update({ output: { ...output, archiveStatus: 'failed' } })
        .eq('id', taskId);
    }
  });

  return NextResponse.json({ received: true });
}
