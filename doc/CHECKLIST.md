# Master checklist

Track progress as you build. Details live in the linked docs.

## Understanding

- [x] Read [README](./README.md)
- [x] Read [00 — Free stack Q&A](./00-answers-free-stack.md)
- [x] Decide: local GPU vs Colab/RunPod — **no local NVIDIA; free DEMO_MODE + Colab later**
- [x] Decide: Phase 1 without Redis (recommended)

## Phase 0

- [x] `nvidia-smi` checked or cloud GPU chosen — no local GPU
- [ ] ≥ 25 GB free disk (confirm on your machine)
- [x] Python venv smoke test (API imports OK)
- [ ] Hugging Face account ready (for ACE-Step later)
- See [phases/phase-0-results.md](./phases/phase-0-results.md)

## Phase 1 — MVP

- [x] Folders scaffolded
- [x] Supabase tables + buckets
- [x] Style packs for Nigeria (+ other countries)
- [x] FastAPI `/jobs` code ready
- [x] Worker DEMO_MODE end-to-end code ready
- [x] Next.js Create Song + player pages
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to API/worker `.env`
- [ ] Run API + worker + web and complete one demo song
- [ ] ACE-Step real generation wired (after free Colab)
- See [phases/phase-1-progress.md](./phases/phase-1-progress.md)

## Phase 2 — Voice

- [ ] `voice_profiles` + `voice-samples`
- [ ] Consent checkbox
- [ ] RVC (or chosen) conversion in worker
- [ ] Country default reference voices
- See [phases/phase-2.md](./phases/phase-2.md)

## Phase 3 — Style intelligence

- [ ] Full controls on form (partially in Create UI already)
- [ ] Prompt builder v2 + tests
- [ ] Genre FX presets
- [ ] 10-prompt evaluation scored
- See [phases/phase-3.md](./phases/phase-3.md)

## Phase 4 — Polish

- [ ] Rate limits + delete flows
- [ ] Progress UI
- [ ] Cost controls (preview, one job at a time)
- [ ] Optional Redis via Docker
- See [phases/phase-4.md](./phases/phase-4.md)

## Free-stack health

- [x] No paid music API required
- [x] Service role key never in frontend
- [ ] Cloud GPU stopped when idle (N/A until Colab/RunPod)
