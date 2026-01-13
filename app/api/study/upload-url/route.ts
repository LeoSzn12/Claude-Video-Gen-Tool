import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { studyUploadUrlSchema } from '../../../../lib/validators/study';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `study-upload-url:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = studyUploadUrlSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const timestamp = Date.now();
  const storagePath = `study/${timestamp}-${parsed.data.fileName}`;

  const { data, error } = await supabase.storage
    .from('study')
    .createSignedUploadUrl(storagePath, { contentType: parsed.data.contentType });

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create upload URL' }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    storage_path: storagePath,
  });
}
