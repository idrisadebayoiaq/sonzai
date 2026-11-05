# Phase 1 — MVP: lyrics → song (no voice clone yet)

**Goal:** User logs in, picks Nigeria + Afrobeats + song type, pastes lyrics, gets a playable song.  
**Queue:** Supabase `jobs` table (no Redis required).  
**Model:** ACE-Step on GPU worker.

Estimated time: 2–3 weeks part-time.

---

## Step 1.1 — Create repo folders

```text
apps/web
services/api
services/worker
packages/style-packs
supabase/migrations
```

Ask the agent: “Scaffold Phase 1 folders and Next.js app.”

---

## Step 1.2 — Apply Supabase schema

Apply SQL from [../04-supabase-setup.md](../04-supabase-setup.md):

- tables: `profiles`, `jobs`, `songs` (voice_profiles can wait for Phase 2)  
- storage buckets: `generated-songs` (and optionally `voice-samples`)  

Verify with MCP `list_tables` — should no longer be empty.

---

## Step 1.3 — Style packs (JSON)

Create `packages/style-packs/nigeria.json` and a few others using [../reference/style-packs.md](../reference/style-packs.md).

Create `packages/style-packs/index.ts` (or `.py`) that loads by `country` + `genre`.

---

## Step 1.4 — FastAPI skeleton (`services/api`)

Endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness |
| POST | `/jobs` | create generation job |
| GET | `/jobs/{id}` | status + progress |
| GET | `/songs` | list current user’s songs |

Behavior of `POST /jobs`:

1. Verify Supabase JWT.  
2. Validate body (lyrics length, country, genre enums).  
3. Insert into `jobs` with `status=pending`.  
4. Return `{ job_id }`.

`requirements.txt` (example):

```text
fastapi
uvicorn[standard]
pydantic
python-dotenv
httpx
supabase
```

Run:

```powershell
.\.venv-api\Scripts\Activate.ps1
cd services\api
uvicorn main:app --reload --port 8000
```

---

## Step 1.5 — Worker skeleton (`services/worker`)

Loop:

1. Claim next `pending` job (SQL in doc 04).  
2. Load Style Pack → build prompt ([../reference/prompt-builder.md](../reference/prompt-builder.md)).  
3. Call ACE-Step (or a **stub** that writes a silent/test WAV until GPU is ready).  
4. FFmpeg → MP3.  
5. Upload to `generated-songs/{user_id}/{job_id}.mp3`.  
6. Insert `songs`, set job `done` + `progress=100`.

**Stub mode (important):**  
If GPU isn’t ready, implement `GENERATOR=stub` so the full web→api→db→worker→storage path works with a placeholder audio file. Swap stub for ACE-Step without changing the UI.

---

## Step 1.6 — Next.js UI (`apps/web`)

Screens:

1. Login (Supabase Auth)  
2. **Create Song** form:
   - Lyrics (textarea)  
   - Country (select)  
   - Genre (select; filter by country defaults)  
   - Song type (song / hook / freestyle / ballad / gospel)  
   - Mood  
   - Language mix  
   - Optional BPM  
3. Generating page (poll `/jobs/{id}` every 2s)  
4. Library (list songs + audio player)

Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.

---

## Step 1.7 — Wire ACE-Step (real generation)

On the GPU machine / Colab:

1. Install CUDA PyTorch.  
2. Install ACE-Step per upstream README.  
3. Replace stub `generate()` with real call.  
4. Test prompt: Nigeria Afrobeats, short English+Pidgin chorus.  
5. Listen — iterate Style Pack tags until it stops sounding “generic US AI.”

---

## Step 1.8 — Acceptance tests

- [ ] Anonymous user cannot create jobs  
- [ ] Create job → status pending → processing → done  
- [ ] Song appears in library and plays  
- [ ] Failed GPU run marks job `failed` with error text  
- [ ] Nigeria + Afrobeats prompt includes Style Pack instruments/BPM cues  
- [ ] Stub→real generator switch is one env var  

## Exit criteria

A logged-in user can generate at least one real (or stub) track end-to-end.

→ **[Phase 2](./phase-2.md)**
