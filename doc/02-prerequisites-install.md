# 02 — Prerequisites & install

What must exist on your machine (or cloud GPU) before Phase 1.

## Already present on this PC (checked)

- Python **3.12.10**  
- Node **v24.15.0** / npm **11.12.1**  
- Supabase project connected via MCP  

## You still need

| Tool | Required for | Free? | Install |
|---|---|---|---|
| Git | cloning model repos | Yes | [git-scm.com](https://git-scm.com/) if missing |
| Docker Desktop | easiest Redis | Yes (Personal) | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| NVIDIA GPU + drivers | fast local generation | Hardware | GeForce drivers + CUDA if local |
| OR cloud GPU account | if no local GPU | Free credits / cheap | Colab / RunPod (see doc 03) |
| FFmpeg | audio convert/export | Yes | `winget install FFmpeg` or chocolatey |

Redis itself is free; Docker is the easiest way to run it on Windows.

---

## Step A — Verify basics

Open PowerShell in `d:\sonzai`:

```powershell
python --version
node --version
npm --version
git --version
```

If `git` missing: install Git for Windows, restart terminal.

---

## Step B — Python virtual environments (we create these in phases)

We will **not** pollute global Python. Two venvs:

```powershell
# API
cd d:\sonzai
python -m venv .venv-api
.\.venv-api\Scripts\Activate.ps1
pip install -U pip

# Worker (often separate; may live on GPU machine)
python -m venv .venv-worker
```

When the agent builds Phase 1, it will `pip install` from `requirements.txt` files:

- `services/api/requirements.txt` → fastapi, uvicorn, supabase, pydantic, httpx  
- `services/worker/requirements.txt` → redis or supabase client, torch (CUDA), ace-step deps, rvc deps later  

**You do not buy anything.** Packages come from PyPI / Hugging Face (free).

---

## Step C — Redis (optional for Phase 1)

### Option 1 — Docker (recommended)

1. Install Docker Desktop for Windows.  
2. Start Docker.  
3. Run:

```powershell
docker run -d --name sonzai-redis -p 6379:6379 redis:7-alpine
docker ps
```

4. Test from Python later with `redis://localhost:6379`.

### Option 2 — No Redis (Phase 1 default in this guide)

Use Supabase table:

```sql
-- jobs.status: pending | processing | done | failed
```

Worker every N seconds:

```sql
select * from jobs where status = 'pending' order by created_at limit 1;
```

**Fully free. Fully works.** Redis is an optimization, not a dependency of “good Nigerian accent.”

### Option 3 — WSL2 Redis

```bash
sudo apt update && sudo apt install redis-server -y
sudo service redis-server start
```

---

## Step D — FFmpeg

```powershell
winget install --id Gyan.FFmpeg -e
ffmpeg -version
```

Needed to convert WAV → MP3 and normalize loudness.

---

## Step E — Node app tooling

```powershell
cd d:\sonzai
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

(We run this in Phase 1; listed here so you know what’s coming.)

---

## Step F — GPU check (local)

```powershell
nvidia-smi
```

- If you see a table with GPU name and VRAM → local worker is viable.  
- If command missing → use **[03 — Self-hosting models & free GPU](./03-self-hosting-models.md)** cloud path.

Rough VRAM guide:

| VRAM | Expectation |
|---|---|
| &lt; 4 GB | Struggle; use cloud |
| 4–8 GB | ACE-Step smaller configs possible |
| 8–12 GB+ | Comfortable MVP |
| 12 GB+ | Better quality + voice convert together |

---

## Step G — Environment files (created in Phase 1)

`apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://nwkurqepqhbyislxgito.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`services/api/.env`

```env
SUPABASE_URL=https://nwkurqepqhbyislxgito.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# QUEUE_URL=redis://localhost:6379   # only if using Redis
```

`services/worker/.env`

```env
SUPABASE_URL=https://nwkurqepqhbyislxgito.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Same queue setting as API
HUGGINGFACE_TOKEN=optional
```

Get anon + service role keys from Supabase Dashboard → Project Settings → API  
(or ask the agent to fetch publishable keys via MCP; **service role stays secret**, never in the browser).

---

## Install ownership summary

| Who installs what | Notes |
|---|---|
| **You** | Docker Desktop (once), GPU drivers / Colab account, approve installs |
| **Agent (in chat)** | venv, pip packages, npm packages, docker run Redis, project files, migrations via Supabase MCP |
| **Nobody buys** | Python, Redis software, ACE-Step, RVC, Supabase free tier |

Next: **[03 — Self-hosting models & free GPU](./03-self-hosting-models.md)**.
