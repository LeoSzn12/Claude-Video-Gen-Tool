import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../../lib/rate-limit';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function GET(request: Request, { params }: { params: { templateId: string } }) {
  const rate = checkRateLimit({
    key: `templates-id-version-check:${getRequestIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data: template, error } = await supabase
    .from('templates')
    .select('id, template_group_id')
    .eq('id', params.templateId)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const { data: versions } = await supabase
    .from('templates')
    .select('id, status, version, created_at')
    .eq('template_group_id', template.template_group_id)
    .order('version', { ascending: false });

  return NextResponse.json({ versions: versions ?? [] });
}
