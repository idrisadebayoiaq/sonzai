"""
ACE-Step integration hook.

Free path:
  DEMO_MODE / missing ACE_STEP_URL → caller uses demo_audio instead.

Real path:
  Set ACE_STEP_URL to a self-hosted or Colab-tunneled inference server that accepts:

  POST {ACE_STEP_URL}/generate
  {
    "lyrics": "...",
    "prompt": "...",
    "negative_prompt": "...",
    "bpm": 108,
    "duration_sec": 180
  }

  Response: audio/wav bytes OR JSON { "audio_base64": "..." }
"""

from __future__ import annotations

import base64
import os
from pathlib import Path

import httpx

ACE_STEP_URL = os.getenv("ACE_STEP_URL", "").rstrip("/")
ACE_STEP_TIMEOUT = float(os.getenv("ACE_STEP_TIMEOUT", "600"))


def is_configured() -> bool:
    return bool(ACE_STEP_URL)


def generate_to_wav(
    *,
    lyrics: str,
    prompt: str,
    negative_prompt: str,
    bpm: int,
    duration_sec: int,
    out_path: Path,
) -> float:
    if not ACE_STEP_URL:
        raise RuntimeError("ACE_STEP_URL is not set")

    payload = {
        "lyrics": lyrics,
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "bpm": bpm,
        "duration_sec": duration_sec,
    }
    with httpx.Client(timeout=ACE_STEP_TIMEOUT) as client:
        resp = client.post(f"{ACE_STEP_URL}/generate", json=payload)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            data = resp.json()
            raw = base64.b64decode(data["audio_base64"])
            out_path.write_bytes(raw)
        else:
            out_path.write_bytes(resp.content)

    # Duration is requested length; real models may vary slightly
    return float(duration_sec)
