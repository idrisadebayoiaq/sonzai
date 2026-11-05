# Phase 4 — Polish, safety, and “still free” ops

## Step 4.1 — Product polish

- [ ] Progress % from worker (`jobs.progress`)  
- [ ] Cancel job (set status failed/cancelled if still pending)  
- [ ] Download button (signed URL)  
- [ ] Basic title auto from first lyric line  
- [ ] Mobile-friendly Create Song form  
- [ ] Empty states and error toasts  

## Step 4.2 — Safety & consent

- [ ] Voice upload consent required  
- [ ] Block obvious celebrity-name cloning attempts in UI copy + moderation list  
- [ ] Rate limit: e.g. 5 jobs / user / day on free tier (Supabase RPC or API)  
- [ ] Label downloads “AI generated” in metadata/UI  
- [ ] Allow user to delete songs + voice samples  

## Step 4.3 — Cost control (keep it free-ish)

| Lever | Action |
|---|---|
| Preview first | Generate 15–20s preview before full song |
| Queue fairness | One active job per user |
| Sleep cloud GPU | Stop RunPod when idle |
| Stub in CI | Never call GPU in automated tests |
| Storage lifecycle | Delete failed temp files daily |

## Step 4.4 — Optional Redis + Docker Compose

`docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

Document start/stop in root README when added.

## Step 4.5 — Deployment map (still free-first)

| Piece | Free host |
|---|---|
| `apps/web` | Vercel hobby |
| `services/api` | Same PC, or free Render/Fly.io tiny instance |
| `services/worker` | Your GPU PC or Colab/RunPod |
| Supabase | Existing free project |

When traffic grows: paid GPU worker only — keep models open-source.

## Exit criteria

App is demoable end-to-end with Nigeria accent path, voice upload, genre controls, and clear limits so free tier doesn’t melt.
