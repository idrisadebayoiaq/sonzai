# Prompt builder

Turns form fields + Style Packs into one generation prompt (and negative prompt) for ACE-Step.

---

## Input object (from `jobs` row)

```json
{
  "lyrics": "...",
  "country": "nigeria",
  "genre": "afrobeats",
  "song_type": "full_song",
  "mood": "party",
  "language_mix": "english_pidgin",
  "bpm": null,
  "energy": 4,
  "duration_sec": 75,
  "instruments_bias": ["shakers", "guitar chops"]
}
```

---

## Algorithm (pseudocode)

```python
def build_prompt(job, packs):
    country = packs.country(job.country)
    genre = packs.genre(job.genre or country.default_genre)
    lang = find(country.language_mixes, job.language_mix) or country.language_mixes[0]

    bpm = job.bpm or genre.bpm.default
    structure = genre.structure_hints[job.song_type]

    positive = []
    positive += country.accent.labels
    positive += [lang.prompt]
    positive += country.cultural_positive
    positive += [f"{genre.display_name} song"]
    positive += [genre.drum_language]
    positive += genre.instruments
    positive += job.instruments_bias or []
    positive += [f"{bpm} BPM", f"mood: {job.mood}", f"energy {job.energy}/5"]
    positive += [structure, genre.mix_notes]
    positive += [f"duration about {job.duration_sec} seconds"]

    negative = []
    negative += country.accent.avoid
    negative += GLOBAL_AVOID

    return {
      "prompt": ", ".join(positive),
      "negative_prompt": ", ".join(negative),
      "lyrics": job.lyrics,
      "bpm": bpm,
      "duration_sec": job.duration_sec,
    }
```

---

## Example output (Nigeria / Afrobeats / party)

**prompt**

```text
Nigerian English accent, natural West African cadence, warm conversational delivery,
Nigerian Pidgin flavored phrasing mixed with English, call and response ad-libs,
groovy syncopated percussion, Afrobeats song, danceable mid-tempo groove with offbeat emphasis,
syncopated percussion, shakers, crisp snare, melodic synth hooks, electric guitar chops,
warm bassline, 108 BPM, mood: party, energy 4/5,
intro, verse, chorus, verse, chorus, bridge, final chorus,
punchy percussion, clear vocal center, club-ready low end, duration about 75 seconds
```

**negative_prompt**

```text
American General accent, British RP, robotic text-to-speech, over-enunciated AI voice,
robotic vocals, metallic artifacts, generic American radio pop, spoken Wikipedia tone
```

Feed `lyrics` separately to the model’s lyrics channel if ACE-Step supports it; don’t only dump lyrics into the style prompt.

---

## Song-type overrides

```python
if job.song_type == "hook":
    duration_sec = min(job.duration_sec, 40)
    positive.append("chorus-first catchy hook, memorable topline")
elif job.song_type == "jingle":
    duration_sec = min(job.duration_sec, 20)
elif job.song_type == "ballad":
    positive.append("emotional intimate vocal, sparse arrangement")
```

---

## Tests to write

1. Missing genre → uses country default.  
2. User BPM overrides genre default.  
3. `english_pidgin` injects Pidgin line.  
4. Negative always includes country’s `accent.avoid`.  
5. Snapshot test for Nigeria Afrobeats party prompt string.
