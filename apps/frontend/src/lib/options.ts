export const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
];

export const GENRE_CATEGORIES: { id: string; label: string; genres: string[] }[] = [
  {
    id: "african",
    label: "African",
    genres: ["afrobeats", "amapiano", "highlife", "afro house", "fuji", "gqom", "afrosoul", "bongo flava"],
  },
  {
    id: "hiphop",
    label: "Hip-Hop & Rap",
    genres: ["hiphop", "rap", "trap", "drill", "boom bap", "afro trap"],
  },
  {
    id: "country",
    label: "Country & Folk",
    genres: ["country", "country pop", "americana", "folk", "bluegrass"],
  },
  {
    id: "electronic",
    label: "Electronic",
    genres: ["edm", "house", "techno", "drum and bass", "dubstep", "synthwave", "lofi"],
  },
  {
    id: "rnb",
    label: "R&B, Soul & Blues",
    genres: ["rnb", "soul", "neo soul", "blues", "jazz"],
  },
  {
    id: "pop",
    label: "Pop & Dance",
    genres: ["pop", "dance pop", "kpop", "latin pop", "reggaeton", "dancehall", "reggae"],
  },
  {
    id: "rock",
    label: "Rock & Alternative",
    genres: ["rock", "indie", "alternative", "metal", "punk"],
  },
  {
    id: "gospel",
    label: "Gospel & Other",
    genres: ["gospel", "worship", "classical", "soundtrack"],
  },
];

export const GENRES = GENRE_CATEGORIES.flatMap((category) => category.genres);

export const SONG_TYPES = [
  { id: "full_song", label: "Full song" },
  { id: "hook", label: "Hook / jingle" },
  { id: "dance_track", label: "Dance track" },
  { id: "ballad", label: "Ballad" },
  { id: "freestyle", label: "Freestyle" },
  { id: "gospel", label: "Gospel" },
];

export const MOODS = ["party", "romantic", "street", "spiritual", "chill", "patriotic"];

export const LANGUAGE_MIXES: Record<string, { id: string; label: string }[]> = {
  NG: [
    { id: "nigerian_english", label: "Nigerian English" },
    { id: "nigerian_english_pidgin", label: "Nigerian English + Pidgin" },
    { id: "yoruba_english", label: "Yoruba + English" },
    { id: "igbo_english", label: "Igbo + English" },
    { id: "hausa_english", label: "Hausa + English" },
  ],
  GH: [{ id: "nigerian_english", label: "Ghanaian English" }],
  KE: [{ id: "nigerian_english", label: "Kenyan English" }],
  ZA: [{ id: "nigerian_english", label: "South African English" }],
};

export const VOCAL_STYLES = ["soft", "energetic", "raspy", "choir"];

export const VOCAL_GENDERS = [
  { id: "auto", label: "Auto" },
  { id: "female", label: "Female lead" },
  { id: "male", label: "Male lead" },
  { id: "duet", label: "Duet" },
];

export const KEYS = ["", "C major", "G major", "D major", "A major", "F major", "A minor", "E minor", "D minor"];

export const TIME_SIGNATURES = ["", "4/4", "3/4", "6/8", "2/4"];

export const LYRIC_SECTIONS = ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Bridge", "Outro", "Instrumental"];

export const STRUCTURE_PRESETS = [
  {
    id: "pop",
    label: "Pop",
    text: "[Intro]\n\n[Verse 1]\n\n[Pre-Chorus]\n\n[Chorus]\n\n[Verse 2]\n\n[Chorus]\n\n[Bridge]\n\n[Chorus]\n\n[Outro]\n",
  },
  {
    id: "rap",
    label: "Rap",
    text: "[Intro]\n\n[Verse 1]\n\n[Hook]\n\n[Verse 2]\n\n[Hook]\n\n[Verse 3]\n\n[Hook]\n\n[Outro]\n",
  },
  {
    id: "ballad",
    label: "Ballad",
    text: "[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Verse 2]\n\n[Chorus]\n\n[Bridge]\n\n[Chorus]\n\n[Outro]\n",
  },
  {
    id: "dance",
    label: "Dance",
    text: "[Intro]\n\n[Verse]\n\n[Build]\n\n[Drop]\n\n[Verse]\n\n[Drop]\n\n[Outro]\n",
  },
];

export const STAGE_LABELS: Record<string, string> = {
  queued: "Queued",
  composing: "Building style",
  generating: "Generating music",
  vocals: "Vocals",
  mixing: "Mixing",
  uploading: "Uploading",
  done: "Done",
  failed: "Failed",
  cancelled: "Cancelled",
};
