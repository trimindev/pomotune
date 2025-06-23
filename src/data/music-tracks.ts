// src/data/music-tracks.ts

import type { MusicTrack } from "@/lib/types";

// Predefined ambient tracks for focus sessions
// Using royalty-free placeholder sources - replace with actual track URLs
export const MUSIC_TRACKS: MusicTrack[] = [
  // Nature Sounds
  {
    id: "nature-rain",
    title: "Gentle Rain",
    artist: "Nature Audio",
    src: "https://www.soundjay.com/misc/sounds/rain-01.mp3", // Replace with actual URL
    category: "nature",
    duration: 600, // 10 minutes
    type: "audio",
  },
  {
    id: "nature-forest",
    title: "Forest Ambience",
    artist: "Nature Audio",
    src: "https://www.soundjay.com/nature/sounds/forest-01.mp3", // Replace with actual URL
    category: "nature",
    duration: 720, // 12 minutes
    type: "audio",
  },
  {
    id: "nature-ocean",
    title: "Ocean Waves",
    artist: "Nature Audio",
    src: "https://www.soundjay.com/nature/sounds/ocean-01.mp3", // Replace with actual URL
    category: "nature",
    duration: 900, // 15 minutes
    type: "audio",
  },

  // Lo-Fi Hip Hop
  {
    id: "lofi-coffee",
    title: "Coffee Shop",
    artist: "Lo-Fi Collective",
    src: "https://example.com/lofi-coffee.mp3", // Replace with actual URL
    category: "lofi",
    duration: 480, // 8 minutes
    type: "audio",
  },
  {
    id: "lofi-study",
    title: "Study Session",
    artist: "Chill Beats",
    src: "https://example.com/lofi-study.mp3", // Replace with actual URL
    category: "lofi",
    duration: 600, // 10 minutes
    type: "audio",
  },
  {
    id: "lofi-midnight",
    title: "Midnight Vibes",
    artist: "Lo-Fi Collective",
    src: "https://example.com/lofi-midnight.mp3", // Replace with actual URL
    category: "lofi",
    duration: 540, // 9 minutes
    type: "audio",
  },

  // White Noise
  {
    id: "whitenoise-brown",
    title: "Brown Noise",
    artist: "Focus Sounds",
    src: "https://example.com/brown-noise.mp3", // Replace with actual URL
    category: "whitenoise",
    duration: 1800, // 30 minutes
    type: "audio",
  },
  {
    id: "whitenoise-pink",
    title: "Pink Noise",
    artist: "Focus Sounds",
    src: "https://example.com/pink-noise.mp3", // Replace with actual URL
    category: "whitenoise",
    duration: 1800, // 30 minutes
    type: "audio",
  },
  {
    id: "whitenoise-fan",
    title: "Fan Sound",
    artist: "Ambient Noise",
    src: "https://example.com/fan-sound.mp3", // Replace with actual URL
    category: "whitenoise",
    duration: 1200, // 20 minutes
    type: "audio",
  },

  // Instrumental
  {
    id: "instrumental-piano",
    title: "Peaceful Piano",
    artist: "Classical Focus",
    src: "https://example.com/peaceful-piano.mp3", // Replace with actual URL
    category: "instrumental",
    duration: 420, // 7 minutes
    type: "audio",
  },
  {
    id: "instrumental-guitar",
    title: "Acoustic Guitar",
    artist: "Instrumental Vibes",
    src: "https://example.com/acoustic-guitar.mp3", // Replace with actual URL
    category: "instrumental",
    duration: 360, // 6 minutes
    type: "audio",
  },
  {
    id: "instrumental-strings",
    title: "String Quartet",
    artist: "Chamber Music",
    src: "https://example.com/string-quartet.mp3", // Replace with actual URL
    category: "instrumental",
    duration: 480, // 8 minutes
    type: "audio",
  },
];

// Helper functions for track management
export const getTracksByCategory = (category: string): MusicTrack[] => {
  return MUSIC_TRACKS.filter((track) => track.category === category);
};

export const getTrackById = (id: string): MusicTrack | undefined => {
  return MUSIC_TRACKS.find((track) => track.id === id);
};

export const getAllCategories = (): string[] => {
  const categories = MUSIC_TRACKS.map((track) => track.category);
  return [...new Set(categories)];
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Category display names
export const CATEGORY_LABELS = {
  nature: "Nature Sounds",
  lofi: "Lo-Fi Hip Hop",
  whitenoise: "White Noise",
  instrumental: "Instrumental",
} as const;
