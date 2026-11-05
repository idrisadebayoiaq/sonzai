from datetime import datetime, timezone
from typing import Annotated, Any
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_user_id
from .config import Settings, get_settings
from .db import get_service_client
from .schemas import CreateJobRequest, CreateJobResponse, JobOut, SongOut

app = FastAPI(title="Sonzai API", version="0.1.0")

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "sonzai-api"}


@app.post("/jobs", response_model=CreateJobResponse)
def create_job(
    body: CreateJobRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CreateJobResponse:
    _ = settings
    client = get_service_client()
    row = {
        "user_id": user_id,
        "status": "pending",
        "lyrics": body.lyrics.strip(),
        "country": body.country.upper(),
        "genre": body.genre.lower(),
        "song_type": body.song_type,
        "mood": body.mood,
        "bpm": body.bpm,
        "language_mix": body.language_mix,
        "vocal_style": body.vocal_style,
        "title": body.title or "Untitled",
        "voice_sample_path": body.voice_sample_path,
        "progress": 0,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("jobs").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create job")
    job = result.data[0]
    return CreateJobResponse(job_id=job["id"], status=job["status"])


def _sign_song(storage_path: str) -> str | None:
    client = get_service_client()
    try:
        signed = client.storage.from_("generated-songs").create_signed_url(storage_path, 60 * 60)
        return signed.get("signedURL") or signed.get("signedUrl")
    except Exception:
        return None


def _job_to_out(job: dict[str, Any], song: dict[str, Any] | None = None) -> JobOut:
    song_out = None
    if song:
        song_out = SongOut(
            id=song["id"],
            title=song["title"],
            storage_path=song["storage_path"],
            duration_sec=song.get("duration_sec"),
            signed_url=_sign_song(song["storage_path"]),
            meta=song.get("meta") or {},
            created_at=song.get("created_at"),
        )
    return JobOut(
        id=job["id"],
        status=job["status"],
        progress=job.get("progress") or 0,
        error=job.get("error"),
        title=job.get("title"),
        country=job["country"],
        genre=job["genre"],
        song_type=job["song_type"],
        mood=job.get("mood"),
        created_at=job.get("created_at"),
        song=song_out,
    )


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(
    job_id: UUID,
    user_id: Annotated[str, Depends(get_current_user_id)],
) -> JobOut:
    client = get_service_client()
    result = client.table("jobs").select("*").eq("id", str(job_id)).eq("user_id", user_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    job = result.data[0]
    song = None
    if job.get("result_song_id"):
        song_res = (
            client.table("songs")
            .select("*")
            .eq("id", job["result_song_id"])
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if song_res.data:
            song = song_res.data[0]
    return _job_to_out(job, song)


@app.get("/songs", response_model=list[SongOut])
def list_songs(user_id: Annotated[str, Depends(get_current_user_id)]) -> list[SongOut]:
    client = get_service_client()
    result = (
        client.table("songs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    out: list[SongOut] = []
    for song in result.data or []:
        out.append(
            SongOut(
                id=song["id"],
                title=song["title"],
                storage_path=song["storage_path"],
                duration_sec=song.get("duration_sec"),
                signed_url=_sign_song(song["storage_path"]),
                meta=song.get("meta") or {},
                created_at=song.get("created_at"),
            )
        )
    return out
