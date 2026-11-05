# Phase 2 — Voice + lyrics

**Goal:** User uploads their voice, pastes lyrics, and the finished song uses their voice (or a strong accent reference) with the chosen genre/beats.

Depends on Phase 1 working end-to-end.

---

## Step 2.1 — Schema & storage

- Apply `voice_profiles` table from [../04-supabase-setup.md](../04-supabase-setup.md).  
- Ensure bucket `voice-samples` exists (private).  
- Add UI consent checkbox: “I own this voice / have permission to use it.”

---

## Step 2.2 — Upload flow

1. User records or uploads 30–60s clean speech/singing (WAV/MP3).  
2. Browser uploads to `voice-samples/{user_id}/{uuid}.wav` via Supabase client.  
3. `POST /voice-profiles` saves row with `consent_accepted=true`.  
4. Create Song form includes “Use voice: [select profile]”.

Quality tips for users (show in UI):

- Quiet room, no music in background  
- Same language they will sing  
- 30s+ continuous speech  

---

## Step 2.3 — RVC (or GPT-SoVITS) in worker

Pipeline after ACE-Step:

```text
ACE-Step full mix
    → separate vocals / instrumental (Demucs or ACE-Step stems if available)
    → RVC convert vocals with user voice model
    → remix vocals + instrumental
    → loudness normalize
    → export MP3
```

If stem separation is too heavy for VRAM, start with:

- Generate with ACE-Step  
- Apply voice conversion on the full mix carefully (lower quality)  
- Or generate instrumental-focused + singing TTS converted with RVC (iterate)

Pin exact tools in `services/worker/README.md` when implementing.

---

## Step 2.4 — Accent without user upload

For “Nigeria song” when user has **no** voice:

1. Ship curated **reference voice packs** (licensed/open, or your own recorded consent voices).  
2. Map `country=nigeria` → default reference voice id.  
3. Run same RVC path so vocals aren’t generic US English.

**Do not** scrape celebrity voices.

---

## Step 2.5 — API changes

`POST /jobs` body adds:

```json
{
  "voice_profile_id": "uuid-or-null",
  "use_country_default_voice": true
}
```

Worker reads voice sample path from DB before conversion.

---

## Step 2.6 — Acceptance tests

- [ ] Upload rejected without consent checkbox  
- [ ] Job with voice_profile produces different timbre than without  
- [ ] Nigeria default voice path works with no upload  
- [ ] User can delete voice profile + storage object  
- [ ] Long sample (>5 min) rejected with clear error  

## Exit criteria

Voice+lyrics song completes; Nigeria accent path works with either user voice or default reference.

→ **[Phase 3](./phase-3.md)**
