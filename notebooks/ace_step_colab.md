# Real music generation (no local GPU needed)

Sonzai prefers the **free AceMusic cloud API** (official ACE-Step hosted). Colab is optional fallback.

## Option A — AceMusic free API (recommended)

1. Open https://acemusic.ai/api-key and sign in / create a free account.  
2. Copy the API key.  
3. Put it in `services/worker/.env` (and optionally root `.env`):

```env
DEMO_MODE=false
ACEMUSIC_API_KEY=your_key_here
```

4. Restart the worker:

```powershell
cd d:\sonzai
.\.venv-worker\Scripts\python.exe services\worker\worker.py
```

New jobs generate **real ACE-Step songs** (not demo tones).  
If you also upload a voice sample, it is sent as reference audio to AceMusic.

### Optional AceMusic tweaks

```env
ACEMUSIC_BASE_URL=https://api.acemusic.ai
ACEMUSIC_MODEL=acemusic/acestep-v1.5-turbo
ACEMUSIC_MAX_DURATION=90
```

## Option B — Google Colab GPU + tunnel

Use when you want self-hosted ACE-Step.

1. Open Colab with a GPU runtime.  
2. Install ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5  
3. Run `uv run acestep-api` or the OpenRouter-compatible server.  
4. Expose with ngrok/cloudflared.  
5. Worker `.env`:

```env
DEMO_MODE=false
ACE_STEP_URL=https://YOUR-TUNNEL
```

## Voice cloning (RVC) — optional

AceMusic reference audio helps style/timbre but is **not** full RVC cloning.

For true singing voice conversion later:

```env
RVC_URL=https://your-rvc-server
# or
RVC_CMD=python path/to/rvc_cli.py --song {song} --voice {voice} --out {out}
```

Until RVC is set, Sonzai still generates the full song; uploaded voice is used as AceMusic reference when possible.
