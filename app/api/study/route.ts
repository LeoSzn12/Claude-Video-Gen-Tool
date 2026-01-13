import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { studyCreateSchema } from '../../../lib/validators/study';
import { extractStudyDna } from '../../../lib/study/ffmpegShots';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `study-post:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = studyCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('study_runs')
    .insert({
      status: 'processing',
      reference_storage_path: parsed.data.storage_path,
      source_type: parsed.data.source_type,
      dna_json: {},
    })
    .select('id, status, reference_storage_path, dna_json, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('study')
    .download(parsed.data.storage_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: downloadError?.message ?? 'Failed to download study asset' }, { status: 500 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'study-'));
  const tempFile = path.join(tempDir, 'reference.mp4');
  await fs.writeFile(tempFile, buffer);

  try {
    const dnaJson = await extractStudyDna(tempFile);
    await fs.rm(tempDir, { recursive: true, force: true });

    const { data: updated, error: updateError } = await supabase
      .from('study_runs')
      .update({
        status: 'done',
        dna_json: dnaJson,
      })
      .eq('id', data.id)
      .select('id, status, reference_storage_path, dna_json, created_at')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update study run' }, { status: 500 });
    }

    return NextResponse.json({ studyRun: updated });
  } catch (studyError) {
    await supabase
      .from('study_runs')
      .update({
        status: 'failed',
      })
      .eq('id', data.id);

    return NextResponse.json({ error: 'Failed to extract DNA' }, { status: 500 });
  }
}
