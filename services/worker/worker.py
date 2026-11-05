"""
Sonzai free-path worker.

Polls Supabase jobs (no Redis).
DEMO_MODE=true → placeholder WAV (works without GPU).
ACE_STEP_URL set + DEMO_MODE=false → real generation via ACE-Step server.
Optional voice sample → RVC hook when configured; otherwise noted in meta.
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
from engines import ace_step, voice_convert
from prompt_builder import build_generation_input
from style_packs import load_country, load_genre

_WORKER_DIR = Path(__file__).resolve().parent
load_dotenv(_WORKER_DIR / ".env")
load_dotenv()

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
                "stage": "queued",
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


def set_progress(sb, job_id: str, progress: int, stage: str | None = None):
    payload = {"progress": progress, "updated_at": datetime.now(timezone.utc).isoformat()}
    if stage:
        payload["stage"] = stage
    sb.table("jobs").update(payload).eq("id", job_id).execute()


def fail_job(sb, job_id: str, error: str):
    sb.table("jobs").update(
        {
            "status": "failed",
            "error": error[:1000],
            "stage": "failed",
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


def download_voice_sample(sb, storage_path: str, dest: Path) -> bool:
    if not storage_path:
        return False
    try:
        data = sb.storage.from_("voice-samples").download(storage_path)
        dest.write_bytes(data)
        return dest.exists() and dest.stat().st_size > 0
    except Exception as exc:
        print(f"[voice] download failed: {exc}", flush=True)
        return False


def process_job(sb, job: dict) -> None:
    job_id = job["id"]
    user_id = job["user_id"]
    try:
        # Cancelled while waiting?
        fresh = sb.table("jobs").select("status").eq("id", job_id).single().execute()
        if fresh.data and fresh.data.get("status") == "cancelled":
            print(f"[skip] cancelled {job_id}", flush=True)
            return

        set_progress(sb, job_id, 15, "composing")
        country = load_country(job["country"])
        genre = load_genre(job["genre"])
        gen = build_generation_input(job, country, genre)
        set_progress(sb, job_id, 35, "generating")

        with tempfile.TemporaryDirectory(prefix="sonzai_") as tmp:
            tmp_path = Path(tmp)
            wav_path = tmp_path / "out.wav"
            voice_path = tmp_path / "voice_sample"
            converted_path = tmp_path / "converted.wav"
            mp3_path = tmp_path / "out.mp3"

            voice_used = False
            voice_converted = False
            sample_path = job.get("voice_sample_path")
            if sample_path:
                # keep original extension if present
                ext = Path(sample_path).suffix or ".wav"
                voice_path = tmp_path / f"voice{ext}"
                voice_used = download_voice_sample(sb, sample_path, voice_path)

            if DEMO_MODE or not ace_step.is_configured():
                demo_dur = min(12.0, float(gen["duration_sec"]))
                duration = write_demo_wav(
                    wav_path,
                    duration_sec=demo_dur,
                    bpm=int(gen["bpm"]),
                    title=job.get("title") or "demo",
                )
                meta_engine = "demo_wav"
            else:
                duration = ace_step.generate_to_wav(
                    lyrics=gen["lyrics"],
                    prompt=gen["prompt"],
                    negative_prompt=gen["negative_prompt"],
                    bpm=int(gen["bpm"]),
                    duration_sec=int(gen["duration_sec"]),
                    out_path=wav_path,
                )
                meta_engine = "ace_step"

            set_progress(sb, job_id, 55, "vocals")
            final_wav = wav_path
            if voice_used and voice_convert.is_configured():
                voice_convert.convert_song_with_voice(
                    song_wav=wav_path,
                    voice_sample=voice_path,
                    out_wav=converted_path,
                )
                final_wav = converted_path
                voice_converted = True
            elif voice_used:
                # No RVC on free/demo path — keep song, flag for UI
                voice_converted = False

            set_progress(sb, job_id, 75, "mixing")
            wav_to_mp3(final_wav, mp3_path)

            storage_path = f"{user_id}/{job_id}.mp3"
            set_progress(sb, job_id, 88, "uploading")
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
                    "demo_mode": meta_engine == "demo_wav",
                    "voice_sample_provided": voice_used,
                    "voice_converted": voice_converted,
                    "energy": job.get("energy"),
                },
            }
            song_res = sb.table("songs").insert(song_row).execute()
            song_id = song_res.data[0]["id"]

            sb.table("jobs").update(
                {
                    "status": "done",
                    "stage": "done",
                    "progress": 100,
                    "result_song_id": song_id,
                    "error": None,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", job_id).execute()
            print(f"[ok] job {job_id} -> {storage_path} engine={meta_engine}", flush=True)
    except Exception as exc:
        print(f"[fail] job {job_id}: {exc}", flush=True)
        fail_job(sb, job_id, str(exc))


def main():
    print(
        f"Sonzai worker starting (DEMO_MODE={DEMO_MODE}, ACE_STEP={ace_step.is_configured()}, RVC={voice_convert.is_configured()})",
        flush=True,
    )
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
