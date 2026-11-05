"""
Sonzai free-path worker.

- Polls Supabase `jobs` where status=pending (no Redis).
- DEMO_MODE=true (default): writes placeholder WAV so UI/API work without GPU.
- DEMO_MODE=false: reserved for ACE-Step on Colab / cloud GPU (Phase 1 later hook).
"""

from __future__ import annotations

import os
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from demo_audio import write_demo_wav
from prompt_builder import build_generation_input
from style_packs import load_country, load_genre

_WORKER_DIR = Path(__file__).resolve().parent
load_dotenv(_WORKER_DIR / ".env")
load_dotenv()  # also allow root .env

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nwkurqepqhbyislxgito.supabase.co")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() in {"1", "true", "yes"}
POLL_SECONDS = float(os.getenv("POLL_SECONDS", "2"))


def client():
    if not SERVICE_KEY:
        raise RuntimeError("Set SUPABASE_SERVICE_ROLE_KEY in services/worker/.env")
    return create_client(SUPABASE_URL, SERVICE_KEY)


def claim_job(sb):
    pending = (
        sb.table("jobs")
        .select("*")
        .eq("status", "pending")
        .order("created_at")
        .limit(1)
        .execute()
    )
    if not pending.data:
        return None
    job = pending.data[0]
    updated = (
        sb.table("jobs")
        .update(
            {
                "status": "processing",
                "progress": 5,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", job["id"])
        .eq("status", "pending")
        .execute()
    )
    if not updated.data:
        return None
    return updated.data[0]


def set_progress(sb, job_id: str, progress: int):
    sb.table("jobs").update(
        {"progress": progress, "updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", job_id).execute()


def fail_job(sb, job_id: str, error: str):
    sb.table("jobs").update(
        {
            "status": "failed",
            "error": error[:1000],
            "progress": 100,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", job_id).execute()


def wav_to_mp3(wav_path: Path, mp3_path: Path) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(wav_path),
        "-codec:a",
        "libmp3lame",
        "-qscale:a",
        "4",
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def process_job(sb, job: dict) -> None:
    job_id = job["id"]
    user_id = job["user_id"]
    try:
        set_progress(sb, job_id, 15)
        country = load_country(job["country"])
        genre = load_genre(job["genre"])
        gen = build_generation_input(job, country, genre)
        set_progress(sb, job_id, 35)

        with tempfile.TemporaryDirectory(prefix="sonzai_") as tmp:
            tmp_path = Path(tmp)
            wav_path = tmp_path / "out.wav"
            mp3_path = tmp_path / "out.mp3"

            if DEMO_MODE:
                # Cap demo length so free pipeline stays fast
                demo_dur = min(12.0, float(gen["duration_sec"]))
                duration = write_demo_wav(
                    wav_path,
                    duration_sec=demo_dur,
                    bpm=int(gen["bpm"]),
                    title=job.get("title") or "demo",
                )
                meta_engine = "demo_wav"
            else:
                # Hook for ACE-Step self-host / Colab worker later
                raise RuntimeError(
                    "DEMO_MODE=false but ACE-Step is not wired yet. "
                    "Keep DEMO_MODE=true on the free path, or add ACE-Step in Phase 1 week 3."
                )

            set_progress(sb, job_id, 70)
            wav_to_mp3(wav_path, mp3_path)

            storage_path = f"{user_id}/{job_id}.mp3"
            set_progress(sb, job_id, 85)
            with open(mp3_path, "rb") as f:
                sb.storage.from_("generated-songs").upload(
                    path=storage_path,
                    file=f,
                    file_options={"content-type": "audio/mpeg", "upsert": "true"},
                )

            song_row = {
                "user_id": user_id,
                "job_id": job_id,
                "title": job.get("title") or "Untitled",
                "storage_path": storage_path,
                "duration_sec": duration,
                "meta": {
                    "engine": meta_engine,
                    "prompt": gen["prompt"],
                    "negative_prompt": gen["negative_prompt"],
                    "bpm": gen["bpm"],
                    "tags": gen["tags"],
                    "demo_mode": DEMO_MODE,
                },
            }
            song_res = sb.table("songs").insert(song_row).execute()
            song_id = song_res.data[0]["id"]

            sb.table("jobs").update(
                {
                    "status": "done",
                    "progress": 100,
                    "result_song_id": song_id,
                    "error": None,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", job_id).execute()
            print(f"[ok] job {job_id} -> {storage_path}")
    except Exception as exc:
        print(f"[fail] job {job_id}: {exc}")
        fail_job(sb, job_id, str(exc))


def main():
    print(f"Sonzai worker starting (DEMO_MODE={DEMO_MODE})", flush=True)
    sb = client()
    while True:
        try:
            job = claim_job(sb)
            if job:
                print(f"[claim] {job['id']} {job.get('country')} / {job.get('genre')}", flush=True)
                process_job(sb, job)
            else:
                time.sleep(POLL_SECONDS)
        except Exception as exc:
            print(f"[poll-error] {exc}", flush=True)
            time.sleep(max(POLL_SECONDS, 3))


if __name__ == "__main__":
    main()
