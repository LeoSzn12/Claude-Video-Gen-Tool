import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { jobCreateSchema } from '../../../lib/validators/jobs';
import { buildTimelinePlan } from '../../../lib/render/timelinePlan';
import { renderTimelinePlan } from '../../../lib/render/ffmpegRender';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `jobs-post:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = jobCreateSchema.safeParse(payload);

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

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      status: 'queued',
      progress: 0,
      requester_key: requesterKey,
      inputs_json: parsed.data,
      outputs_json: {},
    })
    .select('id, status, progress, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const templateId = parsed.data.templateId;
  let templateName = 'Starter Template';
  let templateConfig = undefined;

  if (templateId) {
    const { data: template } = await supabase
      .from('templates')
      .select('name, template_json')
      .eq('id', templateId)
      .single();
    if (template?.name) {
      templateName = template.name;
    }
    if (template?.template_json) {
      templateConfig = template.template_json;
    }
  }

  try {
    await supabase
      .from('jobs')
      .update({ status: 'planning', progress: 10 })
      .eq('id', data.id);

    const timelinePlan = buildTimelinePlan({
      templateName,
      templateConfig,
      book: {
        title: parsed.data.book.title,
        author: parsed.data.book.author,
        synopsis: parsed.data.book.synopsis,
        quote: parsed.data.book.quote,
      },
    });

    await supabase
      .from('jobs')
      .update({
        status: 'rendering',
        progress: 40,
        outputs_json: { timeline_plan: timelinePlan },
      })
      .eq('id', data.id);

    await supabase
      .from('jobs')
      .update({ status: 'uploading', progress: 70 })
      .eq('id', data.id);

    const { buffer } = await renderTimelinePlan(timelinePlan);
    const storagePath = `jobs/${data.id}.mp4`;

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
          timeline_plan: timelinePlan,
          video_path: storagePath,
        },
      })
      .eq('id', data.id);
  } catch (jobError) {
    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        progress: 100,
        error: jobError instanceof Error ? jobError.message : 'Job failed',
      })
      .eq('id', data.id);
  }

  const { data: finalJob } = await supabase
    .from('jobs')
    .select('id, status, progress')
    .eq('id', data.id)
    .single();

  return NextResponse.json({
    jobId: data.id,
    status: finalJob?.status ?? 'processing',
    progress: finalJob?.progress ?? 0,
  });
}

export async function GET(request: Request) {
  const rate = checkRateLimit({
    key: `jobs-get:${getRequestIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Number(limitParam), 50) : 20;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('id, status, progress, outputs_json, created_at, parent_job_id')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const jobs = await Promise.all(
    (data ?? []).map(async (job) => {
      if (job.outputs_json?.video_path && !job.outputs_json?.video_url) {
        const { data: signedUrlData } = await supabase.storage
          .from('renders')
          .createSignedUrl(job.outputs_json.video_path, 60 * 60 * 24);

        if (signedUrlData?.signedUrl) {
          return {
            ...job,
            outputs_json: {
              ...job.outputs_json,
              video_url: signedUrlData.signedUrl,
            },
          };
        }
      }

      return job;
    })
  );

  return NextResponse.json({ jobs });
}
