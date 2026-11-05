# Phase 0 results (locked — free option)

**Date:** 2026-11-05

## Hardware / tooling

| Check | Result |
|---|---|
| Python | 3.12.10 ✅ |
| Node / npm | v24.15.0 / 11.12.1 ✅ |
| Git | 2.54.0 ✅ |
| FFmpeg | 8.1.1 ✅ |
| NVIDIA GPU (`nvidia-smi`) | **Not found** ❌ |
| Docker / Redis | **Not found** — skipping Redis ✅ (free path) |

## Free-option decisions (locked)

| Decision | Choice |
|---|---|
| Cost target | $0 software; no paid music API |
| Queue | **Supabase `jobs` table** (no Redis, no Docker) |
| GPU | **No local NVIDIA** → Phase 1 worker runs in **DEMO_MODE** (pipeline works). Real ACE-Step later via **Google Colab free** or cheap RunPod when ready |
| Auth / DB / Storage | Existing Supabase project `nwkurqepqhbyislxgito` |
| Countries (Phase 1) | NG, GH, KE, ZA, US, GB |
| App name | Sonzai |

## What this means

- Website + API + job queue work **without your PC GPU**.
- Until a free Colab/cloud worker runs ACE-Step, generated files are **demo audio** so you can finish UI/auth/library.
- Your PC does **not** need to be a GPU host for Phase 1 scaffolding; for real songs later, either leave a Colab/RunPod worker on or generate only while that free GPU session is active.
