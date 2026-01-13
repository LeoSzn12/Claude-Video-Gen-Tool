import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rate-limit';
import { templateCreateSchema } from '../../../lib/validators/templates';

const fallbackTemplates = [
  {
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
  },
];

function getRequestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

export async function GET(request: Request) {
  const rate = checkRateLimit({
    key: `templates-get:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description, status, version, template_group_id, template_json, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ templates: fallbackTemplates });
  }

  return NextResponse.json({ templates: data });
}

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `templates-post:${getRequestIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = templateCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const groupId = parsed.data.templateGroupId ?? crypto.randomUUID();

  const { data: latestVersion } = await supabase
    .from('templates')
    .select('version')
    .eq('template_group_id', groupId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latestVersion?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status ?? 'draft',
      version: parsed.data.version ?? nextVersion,
      template_group_id: groupId,
      template_json: parsed.data.templateJson ?? {},
    })
    .select('id, name, description, status, version, template_group_id, template_json, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}
