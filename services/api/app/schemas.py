from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

SongType = Literal["full_song", "hook", "dance_track", "ballad", "freestyle", "gospel"]
JobStatus = Literal["pending", "processing", "done", "failed"]


class CreateJobRequest(BaseModel):
    lyrics: str = Field(min_length=8, max_length=4000)
    country: str = Field(min_length=2, max_length=8)
    genre: str = Field(min_length=2, max_length=40)
    song_type: SongType = "full_song"
    mood: str | None = None
    bpm: int | None = Field(default=None, ge=60, le=200)
    language_mix: str | None = None
    vocal_style: str | None = None
    title: str | None = Field(default=None, max_length=120)
    voice_sample_path: str | None = None


class SongOut(BaseModel):
    id: UUID
    title: str
    storage_path: str
    duration_sec: float | None = None
    signed_url: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class JobOut(BaseModel):
    id: UUID
    status: JobStatus
    progress: int
    error: str | None = None
    title: str | None = None
    country: str
    genre: str
    song_type: str
    mood: str | None = None
    created_at: datetime | None = None
    song: SongOut | None = None


class CreateJobResponse(BaseModel):
    job_id: UUID
    status: JobStatus
