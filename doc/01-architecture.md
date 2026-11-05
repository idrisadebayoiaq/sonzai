# 01 — Architecture

## High-level diagram

```text
┌─────────────────────┐
│  apps/web (Next.js) │  lyrics, genre, country, voice upload, player
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│  services/api       │  FastAPI: validate, create job, signed URLs
│  (Python)           │
└──────────┬──────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌──────────┐  ┌─────────────────────┐
│ Supabase │  │ Queue               │
│ Auth/DB/ │  │ jobs table (Phase1) │
│ Storage  │  │ or Redis (Phase2+)  │
└────▲─────┘  └──────────┬──────────┘
     │                   ▼
     │         ┌─────────────────────┐
     │         │ services/worker     │
     │         │ GPU machine         │
     │         │ 1. Style Pack → prompt
     │         │ 2. ACE-Step generate
     │         │ 3. RVC voice convert (optional)
     │         │ 4. loudness / export
     └─────────┤ 5. upload audio + mark job done
               └─────────────────────┘
```

## Responsibilities

### `apps/web`
- Forms: lyrics, country, genre, song type, mood, BPM, language mix  
- Voice file upload (to Supabase Storage)  
- Job status polling / realtime  
- Audio player + download  

### `services/api`
- Auth check (Supabase JWT)  
- Create `jobs` row  
- Never run heavy models here (keeps API light)  

### `services/worker`
- Polls pending jobs  
- Loads Style Pack JSON  
- Calls ACE-Step  
- Optional RVC  
- Writes result to Storage + updates DB  

### Supabase
- `profiles`, `jobs`, `songs`, `voice_profiles`  
- Buckets: `voice-samples`, `generated-songs`  
- RLS: users only access their rows/files  

### Style packs (`packages/style-packs`)
- Country → accent tags, default genres, BPM ranges, instrument palette, negative prompts  
- Genre → drum language, energy, typical structure  

## Request lifecycle (one song)

1. User submits form → web uploads voice (optional) to Storage.  
2. Web calls `POST /jobs` with lyrics + options + voice path.  
3. API inserts `jobs` row `status=pending`.  
4. Worker picks job → `status=processing`.  
5. Worker builds prompt from Style Pack + user options.  
6. ACE-Step generates WAV.  
7. If voice profile exists → RVC converts vocals.  
8. Worker uploads `generated-songs/{user}/{job}.mp3`.  
9. Worker inserts `songs` row, sets job `status=done`, `result_url=...`.  
10. Web plays the file.

## Why not put the model in Supabase Edge Functions?

Edge Functions have short timeouts and no GPU. Music generation needs minutes + CUDA. Always use a separate worker.

## Why a queue?

Generation is slow. Without a queue, the browser request times out. Jobs let the UI show “Generating… 40%” and survive refreshes.

## Phase 1 vs later

| Phase | Queue | Voice | Models |
|---|---|---|---|
| 1 MVP | Supabase `jobs` table | No | ACE-Step only |
| 2 | Same or Redis | Yes | ACE-Step + RVC |
| 3+ | Redis recommended | Yes | + better FX / LoRAs |

Next: **[02 — Prerequisites & install](./02-prerequisites-install.md)**.
