# 04 — Supabase setup

**Project:** `nwkurqepqhbyislxgito`  
**URL:** `https://nwkurqepqhbyislxgito.supabase.co`  
**Status today:** public schema has **no tables yet** — we create them here.  
MCP is connected, so migrations can be applied from Cursor when you start Phase 1.

---

## Buckets (Storage)

Create two **private** buckets:

| Bucket | Purpose |
|---|---|
| `voice-samples` | User uploads for cloning |
| `generated-songs` | Finished MP3/WAV |

Policies: authenticated users can upload/read **only their own folder** `{user_id}/...`. Service role (worker) can write anywhere needed.

---

## Tables

### `profiles`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);
```

### `voice_profiles`

```sql
create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sample_path text not null,          -- storage path in voice-samples
  model_path text,                    -- optional trained RVC model path
  consent_accepted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.voice_profiles enable row level security;

create policy "voice_select_own"
  on public.voice_profiles for select using (auth.uid() = user_id);
create policy "voice_insert_own"
  on public.voice_profiles for insert with check (auth.uid() = user_id);
create policy "voice_delete_own"
  on public.voice_profiles for delete using (auth.uid() = user_id);
```

### `jobs` (queue without Redis)

```sql
create type public.job_status as enum (
  'pending', 'processing', 'done', 'failed'
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.job_status not null default 'pending',
  -- user intent
  lyrics text not null,
  country text not null,              -- e.g. nigeria
  genre text not null,                -- e.g. afrobeats
  song_type text not null,            -- song | hook | freestyle | ...
  mood text,
  language_mix text,                  -- english_pidgin | yoruba | ...
  bpm int,
  duration_sec int default 60,
  voice_profile_id uuid references public.voice_profiles(id),
  -- worker fields
  progress int not null default 0,    -- 0..100
  error text,
  result_song_id uuid,                -- set when done
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index jobs_pending_idx on public.jobs (status, created_at)
  where status = 'pending';

alter table public.jobs enable row level security;

create policy "jobs_select_own"
  on public.jobs for select using (auth.uid() = user_id);
create policy "jobs_insert_own"
  on public.jobs for insert with check (auth.uid() = user_id);
-- updates done by service role (worker); no user update policy required
```

### `songs`

```sql
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  title text,
  storage_path text not null,
  public_url text,                    -- or always use signed URLs
  country text,
  genre text,
  duration_sec int,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;

create policy "songs_select_own"
  on public.songs for select using (auth.uid() = user_id);
create policy "songs_insert_own"
  on public.songs for insert with check (auth.uid() = user_id);
create policy "songs_delete_own"
  on public.songs for delete using (auth.uid() = user_id);
```

Optional FK after both exist:

```sql
alter table public.jobs
  add constraint jobs_result_song_fk
  foreign key (result_song_id) references public.songs(id);
```

---

## Worker access pattern

The GPU worker uses the **service role key** so it can:

1. Claim a pending job (`update ... where status='pending' returning *`).  
2. Update `progress`.  
3. Upload to Storage.  
4. Insert `songs` and mark job `done`.

Browser users never receive the service role key.

### Claim job SQL (safe-ish single worker)

```sql
update public.jobs
set status = 'processing', started_at = now()
where id = (
  select id from public.jobs
  where status = 'pending'
  order by created_at
  for update skip locked
  limit 1
)
returning *;
```

---

## Auth

Enable Email auth in Supabase Dashboard (Magic Link is fine for MVP).  
Frontend uses `@supabase/supabase-js`.  
API verifies `Authorization: Bearer <access_token>`.

---

## When to apply

In **Phase 1**, ask the agent: “Apply the Supabase migration from doc/04.”  
We can use MCP `apply_migration` against this project so you don’t paste SQL by hand.

Next: **[Phase 0](./phases/phase-0.md)**.
