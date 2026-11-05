from __future__ import annotations

from typing import Any

DURATION = {
    "hook": 40,
    "freestyle": 75,
    "dance_track": 150,
    "full_song": 180,
    "ballad": 210,
    "gospel": 210,
}

MOOD_TAGS = {
    "party": ["energetic", "celebratory", "dancefloor"],
    "romantic": ["intimate", "smooth", "soft pads"],
    "street": ["raw", "confident", "sparse ad-libs"],
    "spiritual": ["uplifting", "reverent", "choir-friendly"],
    "chill": ["laid-back", "warm", "minimal percussion"],
    "patriotic": ["anthemic", "proud", "wide drums"],
}

VOCAL_TAGS = {
    "soft": ["gentle vocal", "close mic"],
    "energetic": ["strong projection", "bright"],
    "raspy": ["light rasp", "textured"],
    "choir": ["stacked harmonies", "gospel lifts"],
}

LANGUAGE_CUES = {
    "nigerian_english": "Clear Nigerian English, minimal Pidgin",
    "nigerian_english_pidgin": "Nigerian English with natural Pidgin ad-libs",
    "yoruba_english": "Light Yoruba phrases mixed with English verses when lyrics include them",
    "igbo_english": "Light Igbo phrases mixed with English verses when lyrics include them",
    "hausa_english": "Light Hausa phrases mixed with English verses when lyrics include them",
}


def build_generation_input(job: dict[str, Any], country: dict[str, Any], genre: dict[str, Any]) -> dict[str, Any]:
    pos: list[str] = []
    pos.append(country.get("prompt_prefix", ""))
    pos.extend(country.get("accent", {}).get("positive", []))
    pos.extend(genre.get("positive", []))
    for key in ("drums", "bass", "harmony", "arrangement"):
        if genre.get(key):
            pos.append(str(genre[key]))
    pos.extend(country.get("cultural_instruments_hint", []))

    mood = (job.get("mood") or "").lower()
    pos.extend(MOOD_TAGS.get(mood, []))

    vocal = (job.get("vocal_style") or "").lower()
    pos.extend(VOCAL_TAGS.get(vocal, []))

    lang = job.get("language_mix") or country.get("default_language_mix")
    if lang and lang in LANGUAGE_CUES:
        pos.append(LANGUAGE_CUES[lang])

    bpm = job.get("bpm") or genre.get("default_bpm") or 110
    bpm_range = genre.get("bpm_range") or [60, 200]
    bpm = max(bpm_range[0], min(bpm_range[1], int(bpm)))

    song_type = job.get("song_type") or "full_song"
    pos.append(f"BPM {bpm}")
    pos.append(f"song type: {song_type}")

    energy = job.get("energy")
    if energy is not None:
        try:
            e = int(energy)
            if e <= 2:
                pos.append("sparse arrangement, restrained dynamics")
            elif e >= 4:
                pos.append("dense instrumentation, high energy, punchy mix")
            else:
                pos.append("balanced energy and instrumentation")
        except (TypeError, ValueError):
            pass

    neg = list(country.get("accent", {}).get("negative", []))
    neg.extend(genre.get("negative", []))
    neg.extend(["low quality", "distorted mush"])

    return {
        "prompt": ", ".join([p for p in pos if p]),
        "negative_prompt": ", ".join([n for n in neg if n]),
        "lyrics": (job.get("lyrics") or "").strip(),
        "bpm": bpm,
        "duration_sec": DURATION.get(song_type, 180),
        "tags": [job.get("country"), job.get("genre"), song_type, mood, f"energy:{energy}"],
    }
