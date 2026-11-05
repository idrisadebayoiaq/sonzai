export const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
];

export const GENRES = [
  "afrobeats",
  "amapiano",
  "highlife",
  "afrosoul",
  "hiphop",
  "rnb",
  "pop",
  "gospel",
];

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
};

export const VOCAL_STYLES = ["soft", "energetic", "raspy", "choir"];
