from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKS = ROOT / "packages" / "style-packs"


@lru_cache
def _load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_country(code: str) -> dict:
    path = PACKS / "countries" / f"{code.upper()}.json"
    if not path.exists():
        # Fallback keeps pipeline free/working even for unknown codes
        return {
            "code": code.upper(),
            "name": code.upper(),
            "prompt_prefix": f"{code.upper()} contemporary song performance",
            "accent": {"positive": [], "negative": ["robotic TTS"]},
            "cultural_instruments_hint": [],
            "default_language_mix": None,
        }
    return _load_json(str(path))


def load_genre(genre_id: str) -> dict:
    path = PACKS / "genres" / f"{genre_id.lower()}.json"
    if not path.exists():
        return {
            "id": genre_id,
            "bpm_range": [90, 120],
            "default_bpm": 110,
            "positive": [f"{genre_id} style"],
            "negative": ["low quality"],
            "drums": "tight drums",
            "bass": "supportive bass",
            "harmony": "catchy harmony",
            "arrangement": "verse and chorus",
        }
    return _load_json(str(path))
