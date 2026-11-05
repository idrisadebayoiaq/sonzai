"""
Voice conversion backends.

1) RVC_URL / RVC_CMD — dedicated singing conversion (best)
2) If AceMusic key is set and voice sample exists — already passed as reference
   in ace_step; this module then becomes a no-op passthrough.
3) Otherwise passthrough (copy song wav/mp3 as-is)
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import httpx

RVC_URL = os.getenv("RVC_URL", "").rstrip("/")
RVC_CMD = os.getenv("RVC_CMD", "")


def is_configured() -> bool:
    return bool(RVC_URL or RVC_CMD)


def convert_song_with_voice(
    *,
    song_wav: Path,
    voice_sample: Path,
    out_wav: Path,
) -> None:
    if RVC_CMD:
        cmd = RVC_CMD.format(song=str(song_wav), voice=str(voice_sample), out=str(out_wav))
        subprocess.run(cmd, shell=True, check=True)
        if not out_wav.exists():
            raise RuntimeError("RVC_CMD finished but output missing")
        return

    if RVC_URL:
        with httpx.Client(timeout=600.0) as client:
            with open(song_wav, "rb") as sf, open(voice_sample, "rb") as vf:
                resp = client.post(
                    f"{RVC_URL}/convert",
                    files={
                        "song": ("song.wav", sf, "audio/wav"),
                        "voice": ("voice.wav", vf, "audio/wav"),
                    },
                    headers={"User-Agent": "curl/8.4.0"},
                )
            resp.raise_for_status()
            out_wav.write_bytes(resp.content)
        return

    shutil.copyfile(song_wav, out_wav)
