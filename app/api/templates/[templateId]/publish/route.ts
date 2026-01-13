import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../../lib/rate-limit';

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function POST(request: Request, { params }: { params: { templateId: string } }) {
  const rate = checkRateLimit({
    key: `templates-id-publish:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data: template, error } = await supabase
    .from('templates')
    .select('id, status')
    .eq('id', params.templateId)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  if (template.status === 'published') {
    return NextResponse.json({ template });
  }

  const { data: updated, error: updateError } = await supabase
    .from('templates')
    .update({ status: 'published' })
    .eq('id', params.templateId)
    .select('id, name, description, status, version, template_group_id, template_json, created_at')
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? 'Failed to publish template' }, { status: 500 });
  }

  return NextResponse.json({ template: updated });
}
