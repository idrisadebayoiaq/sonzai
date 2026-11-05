"""
ACE-Step generation backends (no local GPU required for AceMusic cloud).

Priority:
  1. ACEMUSIC_API_KEY / ACE_MUSIC_API_KEY → https://api.acemusic.ai (free cloud)
  2. ACE_STEP_URL → self-hosted / Colab REST
"""

from __future__ import annotations

import base64
import os
from pathlib import Path

import httpx


def _key() -> str:
    return (
        os.getenv("ACEMUSIC_API_KEY")
        or os.getenv("ACE_MUSIC_API_KEY")
        or os.getenv("ACE_MUSIC_KEY")
        or ""
    ).strip()


def _base_url() -> str:
    return os.getenv("ACEMUSIC_BASE_URL", "https://api.acemusic.ai").rstrip("/")


def _model() -> str:
    return os.getenv("ACEMUSIC_MODEL", "acemusic/acestep-v1.5-turbo")


def _step_url() -> str:
    return os.getenv("ACE_STEP_URL", "").rstrip("/")


def _timeout() -> float:
    return float(os.getenv("ACE_STEP_TIMEOUT", "600"))


def _max_duration() -> int:
    return max(240, int(os.getenv("ACEMUSIC_MAX_DURATION", "240")))


def is_configured() -> bool:
    return bool(_key() or _step_url())


def provider_name() -> str:
    if _key():
        return "acemusic"
    if _step_url():
        return "ace_step_url"
    return "none"


def _decode_data_url(url: str) -> bytes:
    if "," not in url:
        return base64.b64decode(url)
    return base64.b64decode(url.split(",", 1)[1])


def _extract_audio_bytes(payload: dict) -> bytes:
    msg = payload["choices"][0]["message"]
    audio_items = msg.get("audio") or []
    if not audio_items:
        raise RuntimeError(f"No audio in AceMusic response: keys={list(msg.keys())}")
    item = audio_items[0]
    if isinstance(item, dict) and "audio_url" in item:
        return _decode_data_url(item["audio_url"]["url"])
    if isinstance(item, dict) and "url" in item:
        return _decode_data_url(item["url"])
    raise RuntimeError(f"Unexpected audio payload shape: {item!r}")


def _generate_acemusic(
    *,
    lyrics: str,
    prompt: str,
    bpm: int,
    duration_sec: int,
    out_path: Path,
    voice_sample: Path | None = None,
) -> float:
    duration = max(10, min(int(duration_sec), _max_duration()))
    content = f"<prompt>{prompt}</prompt>\n<lyrics>{lyrics}</lyrics>"

    user_content: str | list
    if voice_sample and voice_sample.exists():
        raw = voice_sample.read_bytes()
        b64 = base64.b64encode(raw).decode("ascii")
        fmt = voice_sample.suffix.lstrip(".").lower() or "wav"
        if fmt == "m4a":
            fmt = "mp4"
        user_content = [
            {"type": "text", "text": content},
            {"type": "input_audio", "input_audio": {"data": b64, "format": fmt}},
        ]
    else:
        user_content = content

    body = {
        "model": _model(),
        "messages": [{"role": "user", "content": user_content}],
        "lyrics": lyrics,
        "use_cot_caption": False,
        "use_cot_language": True,
        "audio_config": {
            "duration": duration,
            "bpm": bpm,
            "vocal_language": "en",
            "instrumental": False,
            "format": "mp3",
        },
    }

    headers = {
        "Authorization": f"Bearer {_key()}",
        "Content-Type": "application/json",
        "User-Agent": "curl/8.4.0",
    }

    with httpx.Client(timeout=_timeout()) as client:
        resp = client.post(f"{_base_url()}/v1/chat/completions", json=body, headers=headers)
        if resp.status_code >= 400:
            raise RuntimeError(f"AceMusic HTTP {resp.status_code}: {resp.text[:800]}")
        audio_bytes = _extract_audio_bytes(resp.json())

    out_path.write_bytes(audio_bytes)
    return float(duration)


def _generate_local_url(
    *,
    lyrics: str,
    prompt: str,
    negative_prompt: str,
    bpm: int,
    duration_sec: int,
    out_path: Path,
) -> float:
    duration = max(10, min(int(duration_sec), _max_duration()))
    headers = {"Content-Type": "application/json", "User-Agent": "curl/8.4.0"}
    step = _step_url()

    with httpx.Client(timeout=_timeout()) as client:
        try:
            body = {
                "model": _model(),
                "messages": [
                    {
                        "role": "user",
                        "content": f"<prompt>{prompt}</prompt>\n<lyrics>{lyrics}</lyrics>",
                    }
                ],
                "lyrics": lyrics,
                "audio_config": {
                    "duration": duration,
                    "bpm": bpm,
                    "vocal_language": "en",
                    "format": "mp3",
                },
            }
            resp = client.post(f"{step}/v1/chat/completions", json=body, headers=headers)
            if resp.status_code < 400:
                out_path.write_bytes(_extract_audio_bytes(resp.json()))
                return float(duration)
        except Exception:
            pass

        payload = {
            "lyrics": lyrics,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "bpm": bpm,
            "duration_sec": duration,
        }
        resp = client.post(f"{step}/generate", json=payload, headers=headers)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            data = resp.json()
            raw = base64.b64decode(data["audio_base64"])
            out_path.write_bytes(raw)
        else:
            out_path.write_bytes(resp.content)
        return float(duration)


def generate_to_wav(
    *,
    lyrics: str,
    prompt: str,
    negative_prompt: str,
    bpm: int,
    duration_sec: int,
    out_path: Path,
    voice_sample: Path | None = None,
) -> float:
    if _key():
        return _generate_acemusic(
            lyrics=lyrics,
            prompt=prompt,
            bpm=bpm,
            duration_sec=duration_sec,
            out_path=out_path,
            voice_sample=voice_sample,
        )
    if _step_url():
        return _generate_local_url(
            lyrics=lyrics,
            prompt=prompt,
            negative_prompt=negative_prompt,
            bpm=bpm,
            duration_sec=duration_sec,
            out_path=out_path,
        )
    raise RuntimeError("No ACEMUSIC_API_KEY or ACE_STEP_URL configured")
