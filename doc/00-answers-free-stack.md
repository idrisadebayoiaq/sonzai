# 00 — Free stack Q&A (read before coding)

This answers your questions directly.

---

## 1. “Open-source models you host yourself (or free GPU credits)” — how?

**Hosting yourself** means:

1. Download model code + weights (ACE-Step, RVC) from GitHub / Hugging Face.  
2. Run a Python process on a machine that has a GPU.  
3. Your FastAPI/worker sends it: lyrics + style prompt (+ optional voice).  
4. The process returns an audio file.  
5. You upload that file to Supabase Storage and show it in the UI.

Nobody “gives you Suno for free.” You run the model like you run a local app.

### Options

| Option | Cost | Quality / speed | Best for |
|---|---|---|---|
| **Local PC GPU** (NVIDIA) | Electricity only | Fast if VRAM ≥ 8GB | Daily building & demos |
| **Google Colab free** | Free (limits, queues) | Good when a GPU session is available | Learning / occasional gens |
| **Kaggle notebooks** | Free weekly GPU hours | Similar to Colab | Testing |
| **RunPod / Vast.ai** | ~$0.20–0.50/hr cheap GPUs | Best cloud DX | When local GPU is weak |
| **CPU only** | Free | Too slow / poor for full songs | Not recommended |

### What “host” looks like in practice

```text
Your laptop or cloud GPU box
  └── Python worker process
        ├── loads ACE-Step once into VRAM
        ├── listens for jobs (Redis queue)
        ├── writes song.wav
        └── uploads to Supabase Storage
```

You do **not** pay ACE-Step a monthly fee. You pay (or use free credits) for the **computer that runs it**.

---

## 2. Will I install Redis and Python for you?

### Python

- **Already installed** on this machine: **Python 3.12.10**.  
- We will **create a virtual environment** (`venv`) and `pip install` packages (FastAPI, redis, etc.).  
- I (the agent) can run those install commands in the project when we reach that phase.  
- You do **not** need to buy Python.

### Redis

- **Not installed yet** on this machine.  
- Redis is **free open-source software**. We install it one of these ways:

**Recommended on Windows:** Docker Desktop → one command:

```bash
docker run -d --name sonzai-redis -p 6379:6379 redis:7-alpine
```

**Alternatives:**

- [Memurai](https://www.memurai.com/) (Redis-compatible for Windows)  
- WSL2 Ubuntu → `sudo apt install redis-server`  
- **MVP without Redis:** store jobs in a Supabase `jobs` table and poll with the worker (simpler, slightly less elegant, 100% free and fine for Phase 1)

**Will I install Redis for you?**  
When you say “start Phase 0/1,” I can:

1. Check if Docker is installed.  
2. If yes → start a Redis container.  
3. If no → either guide Docker install, or use the **Supabase job-table queue** so you can proceed without Redis.

Redis is a helper for background jobs. It is **not** required for music quality.

---

## 3. Supabase is connected — what do we use it for?

Your MCP points at project `nwkurqepqhbyislxgito`. Public tables are currently **empty** — we will create them in Phase 1.

**Supabase free tier covers:**

- Auth (email / magic link / OAuth)  
- Postgres (`profiles`, `songs`, `jobs`, `voice_profiles`)  
- Storage buckets (`voice-samples`, `generated-songs`)  
- Row Level Security so users only see their songs  

**Supabase does *not* run ACE-Step or RVC.**  
Heavy AI stays on the GPU worker. Supabase stores results and metadata.

---

## 4. Will everything be free AND still work as we want?

### What works well on free

| Goal | Free path works? |
|---|---|
| Genre / song-type / mood controls | Yes — prompt + style packs |
| Nigeria (and other) accent steering | Yes — Style Packs + voice conversion; quality depends on references |
| Lyrics → full song | Yes — ACE-Step self-hosted |
| Upload voice + lyrics | Yes — RVC / similar on GPU |
| Save songs, login, history | Yes — Supabase free tier |
| Demo to friends / portfolio | Yes |

### What free does **not** guarantee

| Expectation | Reality |
|---|---|
| “Sounds exactly like commercial Suno every time” | Open models are strong but not identical; tune Style Packs |
| Unlimited public users generating all day | Free GPU / free Colab will rate-limit or cost money |
| Zero setup | You must install Docker/Redis (or use DB queue) + GPU runtime |
| Perfect accent with zero reference audio | You need Style Packs + preferably accent/voice references |

### Bottom line

> **Free software + free Supabase + self-hosted models = yes, the product can work.**  
> **Unlimited free cloud GPU for the public = no.**  
> Build for **you / demos** first; add paid GPU later if traffic grows.

---

## 5. Minimal “still free” architecture we will build

```text
[Next.js on Vercel free]  →  [FastAPI on your PC or free VM]
                                    │
                                    ├─ Supabase (DB/Auth/Storage) ← already connected
                                    ├─ Redis in Docker  OR  jobs table in Supabase
                                    └─ GPU Worker (local / Colab / RunPod)
                                           ACE-Step + RVC
```

Nothing in this path requires a paid music API.

---

## 6. Decision for Sonzai (recommended)

| Decision | Choice |
|---|---|
| DB / Auth / Storage | Supabase (existing project) |
| Queue | Phase 1: **Supabase `jobs` table** (zero Redis install friction). Phase 2+: add Redis if you want faster workers |
| Music model | ACE-Step 1.5 |
| Voice | RVC (singing conversion) |
| GPU | Local if available; else Colab/RunPod |
| Cost target | $0 for MVP software; GPU optional paid later |

Next: **[01 — Architecture](./01-architecture.md)**.
