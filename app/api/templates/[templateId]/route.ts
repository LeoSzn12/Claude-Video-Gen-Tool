import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { templateUpdateSchema } from '../../../../lib/validators/templates';

const fallbackTemplate = {
  id: 'starter',
  template_group_id: 'starter',
  name: 'Cinematic Starter',
  description: 'A cinematic, high-contrast trailer DNA preset for book trailers.',
  status: 'published',
  version: 1,
  template_json: {
    beats: [
      { role: 'hook', minDuration: 3, maxDuration: 4 },
      { role: 'stakes', minDuration: 3, maxDuration: 4 },
      { role: 'montage', minDuration: 4, maxDuration: 5 },
      { role: 'title', minDuration: 3, maxDuration: 4 },
    ],
    pacingCurve: 'balanced',
    cutDensityBand: 'medium',
    transitions: { hard_cut: 40, dip: 25, zoom: 20, blur: 15 },
    textRules: { maxCards: 4, maxWordsPerCard: 14, minDuration: 2.5 },
    defaults: { runtime: 12, aspectRatio: '16:9' },
  },
};

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function GET(request: Request, { params }: { params: { templateId: string } }) {
  const rate = checkRateLimit({
    key: `templates-id-get:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  if (params.templateId === 'starter') {
    return NextResponse.json({ template: fallbackTemplate });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description, status, version, template_group_id, template_json, created_at')
    .eq('id', params.templateId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ template: data });
}

export async function PATCH(request: Request, { params }: { params: { templateId: string } }) {
  const rate = checkRateLimit({
    key: `templates-id-patch:${getRequestIp(request)}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = templateUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('id, status')
    .eq('id', params.templateId)
    .single();

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  if (template.status === 'published') {
    const { data: current } = await supabase
      .from('templates')
      .select('template_group_id, name, description, template_json')
      .eq('id', params.templateId)
      .single();

    const groupId = current?.template_group_id ?? crypto.randomUUID();
    const { data: latestVersion } = await supabase
      .from('templates')
      .select('version')
      .eq('template_group_id', groupId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const { data: created, error: createError } = await supabase
      .from('templates')
      .insert({
        name: parsed.data.name ?? current?.name ?? 'Template Draft',
        description: parsed.data.description ?? current?.description,
        status: 'draft',
        version: nextVersion,
        template_group_id: groupId,
        template_json: parsed.data.templateJson ?? current?.template_json ?? {},
      })
      .select('id, name, description, status, version, template_group_id, template_json, created_at')
      .single();

    if (createError || !created) {
      return NextResponse.json({ error: createError?.message ?? 'Failed to create draft version' }, { status: 500 });
    }

    return NextResponse.json({ template: created });
  }

  const { data, error } = await supabase
    .from('templates')
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      template_json: parsed.data.templateJson,
    })
    .eq('id', params.templateId)
    .select('id, name, description, status, version, template_group_id, template_json, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}
