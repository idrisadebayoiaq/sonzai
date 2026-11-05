# Sonzai

AI music studio — country accent, genre, lyrics (+ optional voice) → song.

## Deploy website (Vercel)

1. Import https://github.com/idrisadebayoiaq/sonzai  
2. **Root Directory:** `apps/frontend`  
3. Env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
4. In Supabase Auth, add your Vercel URL to redirect allow-list.

## Local worker (processes jobs)

Jobs created in the web UI sit as `pending` until a worker runs:

```powershell
cd d:\sonzai
.\.venv-worker\Scripts\python.exe services\worker\worker.py
```

### Real music (no local GPU)

1. Get a free key at https://acemusic.ai/api-key  
2. Set in `services/worker/.env`:

```env
DEMO_MODE=false
ACEMUSIC_API_KEY=your_key
```

3. Restart the worker.

Details: [`notebooks/ace_step_colab.md`](notebooks/ace_step_colab.md)

## Features now

- Create: country, genre, song type, mood, language mix, vocal style, energy, BPM, lyrics  
- Optional voice upload + consent  
- Job progress stages + cancel  
- Library play/delete  
- Daily free limit (8 jobs / user)  
- Style packs for NG/GH/KE/ZA/US/GB  
- ACE-Step + RVC hooks on the worker  

## Layout

| Path | Role |
|---|---|
| `apps/frontend` | Next.js site (Vercel) |
| `services/worker` | Job processor |
| `services/api` | Optional FastAPI |
| `packages/style-packs` | Accent/genre DNA |
| `notebooks/` | Colab ACE-Step guide |
| `doc/` | Full build docs |
