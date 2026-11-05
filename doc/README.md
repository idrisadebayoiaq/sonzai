# Sonzai — AI Music Generator (Free-First Build Guide)

Step-by-step docs to build an AI music app where users pick **country/accent**, **genre**, **song type**, and optionally upload **voice + lyrics**. Models are **open-source and self-hosted** (or run on free GPU credits). Supabase is already connected for this project.

**Supabase project URL:** `https://nwkurqepqhbyislxgito.supabase.co`  
**Project ref:** `nwkurqepqhbyislxgito`

---

## Read this first (honest free answer)

| Piece | Free? | How we get it |
|---|---|---|
| Next.js frontend | Yes | You install Node (already on this machine: v24) |
| FastAPI Python backend | Yes | You install/use Python (already: 3.12) — we write the code |
| Redis (job queue) | Yes | Install locally via Docker Desktop **or** Memurai / Redis for Windows **or** skip Redis in MVP and use a simple DB queue |
| Supabase (DB, auth, storage) | Yes (free tier) | Already connected via MCP |
| ACE-Step music model | Yes (MIT) | Download weights; run on **your GPU** or free/cheap cloud GPU |
| RVC / voice clone | Yes (open source) | Same — local or cloud GPU |
| GPU compute | **Not free forever** | Local NVIDIA GPU, Google Colab free credits, or cheap RunPod/Vast.ai |

**Will it work the way we want if we stay free?**  
**Yes for a personal/demo MVP** (generate Nigerian-accent Afrobeats-style songs with genre controls + voice upload).  
**Not for a large public product with thousands of users** — inference costs money. Free = free *software*; electricity/GPU time is the bill.

---

## Doc map (follow in order)

1. [00 — Free stack Q&A](./00-answers-free-stack.md) — Redis, Python, hosting, what “free” really means  
2. [01 — Architecture](./01-architecture.md) — how the pieces connect  
3. [02 — Prerequisites & install](./02-prerequisites-install.md) — install Redis, Docker, GPU tools  
4. [03 — Self-hosting models & free GPU](./03-self-hosting-models.md) — ACE-Step, RVC, Colab/RunPod  
5. [04 — Supabase setup](./04-supabase-setup.md) — tables, storage, RLS (empty DB today — we create it)  
6. Phases:
   - [Phase 0 — Reality check](./phases/phase-0.md)
   - [Phase 1 — MVP (lyrics → song)](./phases/phase-1.md)
   - [Phase 2 — Voice + lyrics](./phases/phase-2.md)
   - [Phase 3 — Style intelligence](./phases/phase-3.md)
   - [Phase 4 — Polish & safety](./phases/phase-4.md)
7. Reference:
   - [Style packs (Nigeria & others)](./reference/style-packs.md)
   - [Prompt builder](./reference/prompt-builder.md)
8. [CHECKLIST](./CHECKLIST.md) — tick boxes as you build

---

## Target repo layout (we create this during phases)

```text
sonzai/
  doc/                 ← you are here
  apps/
    web/               ← Next.js UI
  services/
    api/               ← FastAPI (create jobs, auth bridge)
    worker/            ← GPU worker (ACE-Step + RVC)
  packages/
    style-packs/       ← JSON style packs per country/genre
  supabase/
    migrations/        ← SQL schema
  docker-compose.yml   ← Redis (+ optional local services)
```

---

## Recommended path for *you* on this Windows machine

1. Keep **Supabase** for auth, DB, audio storage (already free tier).  
2. Install **Docker Desktop** → run **Redis** in one container (easiest free Redis on Windows).  
3. Use **Python 3.12** for API + worker (already installed).  
4. For music generation:
   - **Best:** local NVIDIA GPU (8GB+ VRAM ideal; ACE-Step claims lower for smaller configs).  
   - **No GPU:** use **Google Colab** or **RunPod** free/trial GPU and point the worker there.  
5. Build Phase 1 first (no voice clone). Prove Nigeria Style Pack quality before Phase 2.

Start next: **[00 — Free stack Q&A](./00-answers-free-stack.md)**.
