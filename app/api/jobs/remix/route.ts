import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { jobRemixSchema } from '../../../../lib/validators/jobs';
import { applyRemix } from '../../../../lib/render/remixPlan';
import { renderTimelinePlan } from '../../../../lib/render/ffmpegRender';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `jobs-remix:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = jobRemixSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const requesterKey = getRequestIp(request);
  const { count: activeCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('requester_key', requesterKey)
    .in('status', ['queued', 'planning', 'rendering', 'uploading']);

  if ((activeCount ?? 0) >= 2) {
    return NextResponse.json({ error: 'Too many active jobs' }, { status: 429 });
  }

  const { data: parentJob, error: parentError } = await supabase
    .from('jobs')
    .select('id, inputs_json, outputs_json')
    .eq('id', parsed.data.parent_job_id)
    .single();

  if (parentError || !parentJob) {
    return NextResponse.json({ error: 'Parent job not found' }, { status: 404 });
  }

  const timelinePlan = parentJob.outputs_json?.timeline_plan;
  if (!timelinePlan) {
    return NextResponse.json({ error: 'Parent job missing timeline plan' }, { status: 400 });
  }

  const remixSettings = {
    beatId: parsed.data.beat_id,
    fasterCuts: parsed.data.fasterCuts,
    moreText: parsed.data.moreText,
    characterFocus: parsed.data.characterFocus,
  };

  const remixedPlan = applyRemix(timelinePlan, remixSettings);

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      status: 'queued',
      progress: 0,
      requester_key: requesterKey,
      parent_job_id: parsed.data.parent_job_id,
      inputs_json: {
        ...parentJob.inputs_json,
        remix: remixSettings,
      },
      outputs_json: {
        timeline_plan: remixedPlan,
      },
    })
    .select('id')
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: jobError?.message ?? 'Failed to create remix job' }, { status: 500 });
  }

  try {
    await supabase
      .from('jobs')
      .update({ status: 'rendering', progress: 40 })
      .eq('id', job.id);

    const { buffer } = await renderTimelinePlan(remixedPlan);
    const storagePath = `jobs/${job.id}-remix.mp4`;

    await supabase
      .from('jobs')
      .update({ status: 'uploading', progress: 80 })
      .eq('id', job.id);

    const { error: uploadError } = await supabase.storage
      .from('renders')
      .upload(storagePath, buffer, { contentType: 'video/mp4', upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        progress: 100,
        outputs_json: {
          timeline_plan: remixedPlan,
          video_path: storagePath,
        },
      })
      .eq('id', job.id);
  } catch (error) {
    await supabase
      .from('jobs')
      .update({ status: 'failed', progress: 100 })
      .eq('id', job.id);
  }

  return NextResponse.json({ jobId: job.id });
}
