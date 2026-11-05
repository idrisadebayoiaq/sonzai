# ACE-Step on Google Colab (free GPU)

Use this when you want **real** music instead of DEMO_MODE tones.

## 1. Open Colab

Create a GPU runtime notebook and install ACE-Step per the upstream README:

- https://github.com/ace-step/ACE-Step-1.5

## 2. Minimal FastAPI shim (run in Colab)

```python
# After ACE-Step is installed and weights downloaded in the notebook:
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class GenReq(BaseModel):
    lyrics: str
    prompt: str
    negative_prompt: str = ""
    bpm: int = 110
    duration_sec: int = 120

@app.post("/generate")
def generate(req: GenReq):
    # Call your ACE-Step generate function here → bytes of WAV
    wav_bytes = b""  # replace with model output
    return Response(content=wav_bytes, media_type="audio/wav")

# Expose with ngrok / cloudflared, then set on the worker:
# ACE_STEP_URL=https://xxxx.ngrok-free.app
# DEMO_MODE=false
uvicorn.run(app, host="0.0.0.0", port=7860)
```

## 3. Point the Sonzai worker at it

In `services/worker/.env`:

```env
DEMO_MODE=false
ACE_STEP_URL=https://YOUR-TUNNEL-URL
```

Restart the worker. New jobs will call Colab instead of writing demo tones.

## Notes

- Free Colab sessions disconnect — fine for demos, not 24/7.
- Keep Style Pack prompts (already stored on each job) — they improve accent/genre.
- Stop the tunnel when idle.
