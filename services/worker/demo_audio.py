"""Free DEMO_MODE generator: writes a short WAV so the full pipeline works without a GPU."""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path


def write_demo_wav(path: Path, *, duration_sec: float = 8.0, bpm: int = 108, title: str = "demo") -> float:
    """Create a simple two-tone pulse bed (not music AI — placeholder only)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    sample_rate = 22050
    n_samples = int(duration_sec * sample_rate)
    beat = max(0.25, 60.0 / max(bpm, 1))

    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        frames = bytearray()
        for i in range(n_samples):
            t = i / sample_rate
            # Kick-ish pulse on beats + soft drone
            on_beat = (t % beat) < 0.06
            freq = 110.0 if on_beat else 220.0
            amp = 0.35 if on_beat else 0.08
            # Slight melody drift from title hash so files aren't identical
            drift = (sum(ord(c) for c in title) % 40) / 10.0
            sample = amp * math.sin(2 * math.pi * (freq + drift) * t)
            # Fade edges
            if t < 0.05:
                sample *= t / 0.05
            if t > duration_sec - 0.1:
                sample *= max(0.0, (duration_sec - t) / 0.1)
            frames += struct.pack("<h", int(max(-1.0, min(1.0, sample)) * 32767))
        wf.writeframes(frames)

    return duration_sec
