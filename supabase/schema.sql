create extension if not exists "pgcrypto";

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  template_group_id uuid,
  name text not null,
  description text,
  status text not null default 'draft',
  version integer not null default 1,
  template_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  parent_job_id uuid,
  requester_key text,
  status text not null default 'queued',
  progress integer not null default 0,
  inputs_json jsonb not null default '{}'::jsonb,
  outputs_json jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists study_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued',
  reference_url text,
  reference_storage_path text,
  source_type text not null default 'upload',
  dna_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists templates_status_idx on templates (status);
create index if not exists templates_group_idx on templates (template_group_id);
create index if not exists jobs_created_at_idx on jobs (created_at desc);
create index if not exists jobs_status_idx on jobs (status);
create index if not exists study_runs_created_at_idx on study_runs (created_at desc);
