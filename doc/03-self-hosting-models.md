# 03 — Self-hosting models & free GPU credits

How the open-source music + voice stack actually runs.

---

## Models we use (all free/open)

| Role | Model | License | Runs where |
|---|---|---|---|
| Full song (vocals + beat) | **ACE-Step 1.5** | MIT | GPU worker |
| User voice onto singing | **RVC** | MIT / open | GPU worker |
| Optional speech helpers | F5-TTS / GPT-SoVITS | Open | Only if needed |

We **do not** call paid Suno/Udio APIs in this plan.

---

## What “self-host” means day-to-day

1. Clone model repo (or pip-installable package).  
2. Download weights once (Hugging Face).  
3. Start worker process on a GPU machine.  
4. Worker stays warm (model loaded) and processes jobs.  
5. Your laptop’s Next.js + API can stay local; only the worker needs the GPU.

```text
Dev machine (Windows)          GPU box (same PC or cloud)
─────────────────────          ─────────────────────────
Next.js :3000         ──API──► FastAPI :8000
                               worker polls jobs
                               ACE-Step + RVC in VRAM
                                      │
                                      ▼
                               Supabase Storage (audio out)
```

If GPU is the same PC, API + worker both run locally.

---

## Path A — Local NVIDIA GPU (best for building)

### 1. Drivers

- Install latest Game Ready / Studio driver.  
- Confirm: `nvidia-smi`.

### 2. PyTorch with CUDA (inside `.venv-worker`)

Use the official selector: [pytorch.org/get-started](https://pytorch.org/get-started/locally/). Example pattern:

```powershell
.\.venv-worker\Scripts\Activate.ps1
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
```

Must print `True` and your GPU name.

### 3. ACE-Step

Follow the upstream repo (Phase 1 pins exact commit/version in `services/worker`):

- Repo: [ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5)  
- Install its requirements in `.venv-worker`  
- First run downloads weights (several GB) — one-time  

Worker pseudocode:

```python
prompt = build_prompt(style_pack, user_options, lyrics)
audio_path = ace_step.generate(prompt=prompt, lyrics=lyrics, duration=user_duration)
# upload audio_path to Supabase
```

### 4. RVC (Phase 2)

- Train or create a voice model from user’s 30–60s clean sample (or instant convert pipelines).  
- Convert ACE-Step vocal stem → user timbre.  
- Remux with instrumental.

---

## Path B — Free GPU credits (no / weak local GPU)

### Google Colab (free)

1. Create Google account → [colab.research.google.com](https://colab.research.google.com/).  
2. Runtime → Change runtime type → **GPU** (T4 when available).  
3. Run a notebook that:
   - installs ACE-Step  
   - authenticates to Supabase with **service role** (store in Colab Secrets, never share)  
   - polls `jobs` where `status=pending`  
   - generates + uploads  

**Limits:** sessions disconnect, GPU not always free, not for production traffic. **Perfect for proving the pipeline.**

### Kaggle Notebooks

Similar free weekly GPU quota. Same worker notebook idea.

### RunPod / Vast.ai (cheap, sometimes free credits)

1. Sign up; use any welcome credit.  
2. Rent a cheap GPU pod (RTX 3090/4090 class when affordable).  
3. SSH in, clone `services/worker`, run worker 24/7 while developing.  
4. Stop the pod when idle so you don’t burn credit.

**Still “free software”; compute may cost cents/hour.**

---

## Path C — Hybrid (recommended for Sonzai)

| Component | Where |
|---|---|
| Next.js + FastAPI | Your Windows PC |
| Supabase | Cloud (already) |
| Worker | Local GPU if `nvidia-smi` works; else Colab notebook worker |

UI and DB stay the same. Only the worker’s location changes.

---

## Disk & download expectations

| Item | Approx size |
|---|---|
| ACE-Step weights | Several GB (plan 10–20 GB free disk) |
| RVC + voice models | 1–5 GB+ |
| Generated songs | Grow over time — use Supabase Storage |

First download needs good internet. After that, offline generation works on local GPU.

---

## Security notes when using Colab / cloud GPU

- Put `SUPABASE_SERVICE_ROLE_KEY` in secrets, not in shared notebooks.  
- Prefer signed upload URLs from the API when possible.  
- Delete voice samples user asks to remove (GDPR-ish hygiene).  
- Never commit `.env` with service role keys.

---

## Quality tip for accents (Nigeria etc.)

Self-hosting alone does **not** create a Nigerian accent. You must:

1. Use Style Packs ([reference/style-packs.md](./reference/style-packs.md)).  
2. Prefer voice conversion with a Nigerian-accent reference **or** the user’s own Nigerian voice upload.  
3. Set language mix (Pidgin / Yoruba / Igbo / Hausa / English).  
4. Bias genre to Afrobeats / Highlife / etc. so the *beat* matches culture, not just the vowel sounds.

---

## Success criteria for this doc

You can say “models are hosted” when:

- [ ] `torch.cuda.is_available()` is True **or** Colab GPU runtime is active  
- [ ] ACE-Step generates one sample WAV from a test prompt  
- [ ] That WAV uploads to Supabase Storage and plays in the browser  

Next: **[04 — Supabase setup](./04-supabase-setup.md)**.
