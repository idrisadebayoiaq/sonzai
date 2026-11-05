# Phase 1 progress (free option)

Updated as scaffolding landed.

## Done

- [x] Phase 0 locked: no local GPU, no Docker/Redis → Supabase job queue + `DEMO_MODE` worker  
- [x] Supabase migration: `profiles`, `jobs`, `songs`, RLS, signup trigger  
- [x] Storage buckets: `voice-samples`, `generated-songs` (private) + policies  
- [x] Style packs: NG/GH/KE/ZA/US/GB + 8 genres  
- [x] FastAPI: `/health`, `POST /jobs`, `GET /jobs/{id}`, `GET /songs`  
- [x] Worker: polls jobs, builds Style Pack prompt, writes demo WAV→MP3, uploads  
- [x] Next.js: home, login (magic link), create form, job progress, library  
- [x] Python venv API deps installed  

## You must do once (secrets)

1. Open Supabase Dashboard → Project Settings → API  
2. Copy **service_role** key (secret)  
3. Create:
   - `d:\sonzai\services\api\.env`
   - `d:\sonzai\services\worker\.env`  
4. Paste values from the `.env.example` files (URL + anon + **service_role**)  
5. Keep `DEMO_MODE=true` in worker  

Without the service role key, API/worker cannot insert jobs or upload audio.

## Run (3 terminals)

```powershell
# Terminal A — API
cd d:\sonzai
.\.venv-api\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir services\api --port 8000

# Terminal B — Worker
.\.venv-worker\Scripts\python.exe services\worker\worker.py

# Terminal C — Web
cd d:\sonzai\apps\web
npm run dev
```

## Not in Phase 1 yet (by design on free path)

- Real ACE-Step music (needs free Colab / cloud GPU session)  
- Voice upload / RVC (Phase 2)  
- Redis  

## Note on demo audio

Generated MP3s are **placeholder tones** so the full product loop works for free on this PC (no NVIDIA GPU detected). The **prompt stored in `songs.meta`** is the real Style Pack output you’ll feed ACE-Step later.
