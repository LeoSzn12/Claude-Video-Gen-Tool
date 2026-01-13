import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../../lib/rate-limit';
import { buildTimelinePlan } from '../../../../../lib/render/timelinePlan';
import { renderTimelinePlan } from '../../../../../lib/render/ffmpegRender';
import { computeFitScore } from '../../../../../lib/templates/fitScore';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request, { params }: { params: { templateId: string } }) {
  const rate = checkRateLimit({
    key: `templates-id-test:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data: template, error } = await supabase
    .from('templates')
    .select('id, name, template_json, status')
    .eq('id', params.templateId)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const placeholderBook = {
    title: 'The Midnight Archive',
    author: 'A. Writer',
    synopsis: 'An archivist discovers a secret that reshapes her world.',
    quote: 'Some stories rewrite the future.',
  };

  const timelinePlan = buildTimelinePlan({
    templateName: template.name,
    templateConfig: template.template_json,
    book: placeholderBook,
  });

  const { buffer } = await renderTimelinePlan(timelinePlan);
  const storagePath = `templates/${template.id}/preview-${Date.now()}.mp4`;

  const { error: uploadError } = await supabase.storage
    .from('renders')
    .upload(storagePath, buffer, { contentType: 'video/mp4', upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedUrlData } = await supabase.storage
    .from('renders')
    .createSignedUrl(storagePath, 60 * 60);

  const fitScore = computeFitScore(template.template_json ?? {});

  return NextResponse.json({
    preview_path: storagePath,
    preview_url: signedUrlData?.signedUrl ?? null,
    fit_score: fitScore.score,
    breakdown: fitScore.breakdown,
    alerts: fitScore.alerts,
    recommendations: fitScore.recommendations,
  });
}
