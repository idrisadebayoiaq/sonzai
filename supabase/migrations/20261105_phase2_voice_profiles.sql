-- Applied via MCP: phase2_voice_profiles_and_job_extras

create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My voice',
  sample_path text not null,
  model_path text,
  consent_accepted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.voice_profiles enable row level security;
