# Phase 0 — Reality check (1–2 days)

Do this before writing app code. Goal: know *where* songs will generate.

## Checklist

### 0.1 Hardware / cloud decision

Run on Windows PowerShell:

```powershell
nvidia-smi
```

| Result | Decision |
|---|---|
| GPU shown with ≥ 8 GB | **Path Local** — worker on this PC |
| GPU 4–8 GB | Local for small ACE-Step; cloud for voice+music together |
| No GPU / command fails | **Path Cloud** — Colab or RunPod for worker |

Write your choice here when done:

- [ ] Local GPU  
- [ ] Colab  
- [ ] RunPod / Vast  
- [ ] Hybrid (UI local, worker cloud)

### 0.2 Disk space

- [ ] At least **25 GB** free for models + audio cache

### 0.3 Accounts

- [ ] Supabase project access (you have MCP: `nwkurqepqhbyislxgito`)  
- [ ] Hugging Face account (for model downloads; free)  
- [ ] Google account if using Colab  

### 0.4 Docker decision

- [ ] Install Docker Desktop **or**  
- [ ] Skip Redis and use Supabase `jobs` table (recommended for first week)

### 0.5 Smoke: Python venv

```powershell
cd d:\sonzai
python -m venv .venv-api
.\.venv-api\Scripts\Activate.ps1
python -c "print('venv ok')"
```

- [ ] Prints `venv ok`

### 0.6 Smoke: Node

```powershell
node -e "console.log('node ok')"
```

- [ ] Prints `node ok`

### 0.7 Read Style Packs once

Skim [../reference/style-packs.md](../reference/style-packs.md) so you know how Nigeria accent steering works.

## Exit criteria

Phase 0 is done when you can say:

1. Where the GPU worker will run.  
2. Whether Redis is in or out for MVP.  
3. Python venv works.

→ Continue to **[Phase 1](./phase-1.md)**.
