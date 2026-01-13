import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../lib/rate-limit';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const rate = checkRateLimit({
    key: `study-id-get:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data: run, error } = await supabase
    .from('study_runs')
    .select('id, status, reference_storage_path, dna_json, created_at')
    .eq('id', params.id)
    .single();

  if (error || !run) {
    return NextResponse.json({ error: 'Study run not found' }, { status: 404 });
  }

  return NextResponse.json({ studyRun: run });
}
