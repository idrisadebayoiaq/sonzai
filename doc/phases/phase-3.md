# Phase 3 — Style intelligence (AI “understands” the sound)

**Goal:** Genre, song type, mood, BPM, language, and optional reference audio reliably steer beats, arrangement, and energy — not just the lyrics.

---

## Step 3.1 — Expand Create Song controls

| Control | Values (start) |
|---|---|
| Song type | full_song, hook, freestyle, ballad, gospel, dance_track, jingle |
| Genre | afrobeats, amapiano, highlife, afro_soul, hiphop, rnb, fuji, drill, pop |
| Mood | romantic, street, party, spiritual, patriotic, chill, hype |
| Energy | 1–5 slider |
| BPM | auto or 80–140 |
| Language mix | english, english_pidgin, yoruba, igbo, hausa, bilingual |
| Instruments bias | multi-select: log drum, guitar, sax, choir, 808, live drums… |
| Reference audio | optional short clip “make it feel like this” |

Store all fields on `jobs` (add columns via migration if missing).

---

## Step 3.2 — Prompt builder v2

Implement the full algorithm in [../reference/prompt-builder.md](../reference/prompt-builder.md):

1. Merge country Style Pack defaults.  
2. Override with user genre/BPM/mood.  
3. Add song-type structure (hook vs full song).  
4. Add negative prompts (no US radio pop vocal, no robotic TTS…).  
5. Attach reference-audio embedding/conditioning if ACE-Step supports it.

Unit-test: given `nigeria + afrobeats + party`, prompt must contain percussion/BPM/accent tags from the pack.

---

## Step 3.3 — Genre FX presets (post-process)

After generation, apply light FFmpeg/SoX chains:

| Genre | Preset idea |
|---|---|
| Afrobeats | punchy short sidechain feel via compression, bright percussion EQ |
| Amapiano | warmer low-mids, spacious reverb on pads |
| Gospel | wider stereo, vocal lift |
| Drill | darker low end, less reverb |

Keep FX subtle — don’t destroy the model output.

---

## Step 3.4 — Optional Redis upgrade

If jobs pile up or you run multiple workers:

1. Docker Redis.  
2. API `LPUSH` job id.  
3. Workers `BRPOP`.  
4. Keep Supabase `jobs` as source of truth for UI status.

---

## Step 3.5 — Evaluation set (quality gate)

Create 10 fixed test prompts, including:

1. Nigeria / Afrobeats / Pidgin party hook  
2. Nigeria / Highlife / romantic  
3. Ghana / Hiplife  
4. Kenya / Gengetone or Afropop  
5. South Africa / Amapiano  
6. USA / R&B ballad (control)  
7. User voice + Afrobeats  
8. Gospel worship  
9. Freestyle street hop  
10. Slow afro-soul

Listen and score 1–5 for: accent authenticity, beat fit, “sounds AI”, lyric clarity.  
Improve Style Packs until Nigeria scores ≥ 4 on accent + beat fit.

---

## Acceptance

- [ ] Changing genre alone changes the beat character  
- [ ] Changing country alone changes vocal/style tags  
- [ ] Song type `hook` produces shorter structure  
- [ ] Evaluation set documented with scores  

→ **[Phase 4](./phase-4.md)**
