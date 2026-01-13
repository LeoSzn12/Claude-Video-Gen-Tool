import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../lib/rate-limit';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  const rate = checkRateLimit({
    key: `jobs-id-get:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, status, progress, outputs_json, error, created_at, parent_job_id')
    .eq('id', params.jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.outputs_json?.video_path) {
    const { data: signedUrlData } = await supabase.storage
      .from('renders')
      .createSignedUrl(job.outputs_json.video_path, 60 * 60 * 24);

    return NextResponse.json({
      job: {
        ...job,
        outputs_json: {
          ...job.outputs_json,
          video_url: signedUrlData?.signedUrl ?? null,
        },
      },
    });
  }

  return NextResponse.json({ job });
}
