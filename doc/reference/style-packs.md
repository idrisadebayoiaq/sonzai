# Style packs — country & genre intelligence

A **Style Pack** is JSON the worker merges into every generation. This is how “Nigeria song” gets a Nigerian feel instead of generic AI English pop.

---

## File layout

```text
packages/style-packs/
  countries/
    nigeria.json
    ghana.json
    kenya.json
    south_africa.json
    usa.json
    uk.json
  genres/
    afrobeats.json
    amapiano.json
    highlife.json
    afro_soul.json
    hiphop.json
    rnb.json
    gospel.json
  index.json          # defaults + enums
```

---

## Example: `countries/nigeria.json`

```json
{
  "id": "nigeria",
  "display_name": "Nigeria",
  "default_genres": ["afrobeats", "highlife", "afro_soul", "fuji", "hiphop"],
  "default_genre": "afrobeats",
  "accent": {
    "labels": [
      "Nigerian English accent",
      "natural West African cadence",
      "warm conversational delivery"
    ],
    "avoid": [
      "American General accent",
      "British RP",
      "robotic text-to-speech",
      "over-enunciated AI voice"
    ],
    "default_voice_ref": "refs/nigeria_neutral_f1.wav"
  },
  "language_mixes": [
    { "id": "english", "prompt": "clear Nigerian English vocals" },
    { "id": "english_pidgin", "prompt": "Nigerian Pidgin flavored phrasing mixed with English" },
    { "id": "yoruba", "prompt": "Yoruba language vocals with natural tone" },
    { "id": "igbo", "prompt": "Igbo language vocals with natural tone" },
    { "id": "hausa", "prompt": "Hausa language vocals with natural tone" },
    { "id": "bilingual", "prompt": "bilingual English and local language hooks" }
  ],
  "cultural_positive": [
    "call and response ad-libs",
    "groovy syncopated percussion",
    "Afrobeats-ready drum pocket"
  ],
  "bpm_hint": { "min": 100, "max": 118, "sweet_spot": 108 }
}
```

---

## Example: `genres/afrobeats.json`

```json
{
  "id": "afrobeats",
  "display_name": "Afrobeats",
  "bpm": { "min": 100, "max": 115, "default": 108 },
  "instruments": [
    "syncopated percussion",
    "shakers",
    "crisp snare",
    "melodic synth hooks",
    "electric guitar chops",
    "warm bassline"
  ],
  "drum_language": "danceable mid-tempo groove with offbeat emphasis",
  "energy_default": 4,
  "structure_hints": {
    "full_song": "intro, verse, chorus, verse, chorus, bridge, final chorus",
    "hook": "short catchy chorus loop with ad-libs",
    "freestyle": "beat-forward instrumental pocket under rhythmic vocals"
  },
  "mix_notes": "punchy percussion, clear vocal center, club-ready low end"
}
```

---

## Example: `genres/amapiano.json`

```json
{
  "id": "amapiano",
  "display_name": "Amapiano",
  "bpm": { "min": 110, "max": 115, "default": 112 },
  "instruments": [
    "log drum",
    "wide piano chords",
    "shakers",
    "deep bass",
    "atmospheric pads"
  ],
  "drum_language": "rolling log-drum patterns, spacious groove",
  "energy_default": 3,
  "mix_notes": "warm, spacious, hypnotic"
}
```

---

## Song type modifiers

| `song_type` | Extra prompt rules |
|---|---|
| `full_song` | full structure, 60–180s |
| `hook` | 20–40s, chorus-first, memorable |
| `freestyle` | beat pocket strong, looser vocal timing |
| `ballad` | slower, emotional, less percussion density |
| `gospel` | choir stacks, organ/keys, uplifting |
| `dance_track` | DJ-friendly intro, strong drop |
| `jingle` | 10–20s, brandable hook |

---

## Merge rules (worker)

```text
base = country pack
+ genre pack (user genre or country.default_genre)
+ song_type structure hint
+ mood adjectives
+ language_mix.prompt
+ user BPM if set else genre.default
+ accent.labels
+ negative: accent.avoid + global_ai_avoid
```

Global avoid list:

```text
robotic vocals, metallic artifacts, out-of-tune autotune splat,
generic American radio pop, spoken Wikipedia tone, silence gaps
```

---

## Adding a new country (checklist)

1. Create `countries/{id}.json`.  
2. Add 1 default reference voice (consented).  
3. Map default genres.  
4. Add 2 evaluation prompts in Phase 3 set.  
5. Register id in `index.json` enums for API validation.

---

## Why this beats a single text box

Users think in **country + genre + mood**. Models think in **dense tags**. Style Packs are the translation layer that make “Nigeria song” actually sound Nigerian.
