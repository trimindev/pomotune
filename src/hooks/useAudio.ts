// src/hooks/useAudio.ts

import { useState, useRef, useCallback, useEffect } from "react";
import type { MusicTrack, SessionType } from "@/lib/types";
// import { getTrackById } from "@/data/music-tracks";

interface UseAudioReturn {
  // Notification sounds (existing functionality)
  playSessionTransition: (sessionType: SessionType) => void;
  playStartSound: () => void;
  playPauseSound: () => void;

  // Music player functionality
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (track: MusicTrack) => Promise<void>;
  pauseMusic: () => void;
  resumeMusic: () => void;
  stopMusic: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
}

export const useAudio = (
  enableNotifications: boolean = true,
  defaultVolume: number = 50
): UseAudioReturn => {
  // Audio elements
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Music player state
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(defaultVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize audio elements
  useEffect(() => {
    // Create music audio element
    const musicAudio = new Audio();
    musicAudio.preload = "metadata";
    musicAudio.loop = true; // Loop background music
    musicAudioRef.current = musicAudio;

    // Create notification audio element (for short notification sounds)
    const notificationAudio = new Audio();
    notificationAudio.preload = "auto";
    notificationAudioRef.current = notificationAudio;

    return () => {
      musicAudio.pause();
      musicAudio.src = "";
      notificationAudio.pause();
      notificationAudio.src = "";
    };
  }, []);

  // Set up music audio event listeners
  useEffect(() => {
    const musicAudio = musicAudioRef.current;
    if (!musicAudio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(musicAudio.currentTime);
    const handleDurationChange = () => setDuration(musicAudio.duration || 0);
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    musicAudio.addEventListener("loadstart", handleLoadStart);
    musicAudio.addEventListener("canplay", handleCanPlay);
    musicAudio.addEventListener("play", handlePlay);
    musicAudio.addEventListener("pause", handlePause);
    musicAudio.addEventListener("ended", handleEnded);
    musicAudio.addEventListener("timeupdate", handleTimeUpdate);
    musicAudio.addEventListener("durationchange", handleDurationChange);
    musicAudio.addEventListener("error", handleError);

    return () => {
      musicAudio.removeEventListener("loadstart", handleLoadStart);
      musicAudio.removeEventListener("canplay", handleCanPlay);
      musicAudio.removeEventListener("play", handlePlay);
      musicAudio.removeEventListener("pause", handlePause);
      musicAudio.removeEventListener("ended", handleEnded);
      musicAudio.removeEventListener("timeupdate", handleTimeUpdate);
      musicAudio.removeEventListener("durationchange", handleDurationChange);
      musicAudio.removeEventListener("error", handleError);
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Notification sound functions (existing)
  const playNotificationSound = useCallback(
    (frequency: number = 800, duration: number = 200) => {
      if (!enableNotifications) return;

      try {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: AudioContext })
            .webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.1,
          audioContext.currentTime + 0.01
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.warn("Could not play notification sound:", error);
      }
    },
    [enableNotifications]
  );

  const playSessionTransition = useCallback(
    (sessionType: SessionType) => {
      if (!enableNotifications) return;

      switch (sessionType) {
        case "focus":
          // Three ascending tones for focus completion
          playNotificationSound(600, 150);
          setTimeout(() => playNotificationSound(800, 150), 200);
          setTimeout(() => playNotificationSound(1000, 200), 400);
          break;
        case "shortBreak":
          // Two gentle tones for break completion
          playNotificationSound(800, 200);
          setTimeout(() => playNotificationSound(600, 200), 300);
          break;
        case "longBreak":
          // Four tones for long break completion
          playNotificationSound(600, 150);
          setTimeout(() => playNotificationSound(800, 150), 200);
          setTimeout(() => playNotificationSound(1000, 150), 400);
          setTimeout(() => playNotificationSound(800, 250), 600);
          break;
      }
    },
    [enableNotifications, playNotificationSound]
  );

  const playStartSound = useCallback(() => {
    playNotificationSound(800, 100);
  }, [playNotificationSound]);

  const playPauseSound = useCallback(() => {
    playNotificationSound(600, 150);
  }, [playNotificationSound]);

  // Music player functions
  const playTrack = useCallback(
    async (track: MusicTrack) => {
      const musicAudio = musicAudioRef.current;
      if (!musicAudio) return;

      try {
        setIsLoading(true);

        // If same track is already loaded, just play it
        if (currentTrack?.id === track.id && musicAudio.src) {
          await musicAudio.play();
          return;
        }

        // Load new track
        musicAudio.src = track.src;
        setCurrentTrack(track);

        // Wait for audio to load enough to play
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            musicAudio.removeEventListener("canplay", handleCanPlay);
            musicAudio.removeEventListener("error", handleError);
            resolve(void 0);
          };

          const handleError = (e: Event) => {
            musicAudio.removeEventListener("canplay", handleCanPlay);
            musicAudio.removeEventListener("error", handleError);
            reject(e);
          };

          musicAudio.addEventListener("canplay", handleCanPlay);
          musicAudio.addEventListener("error", handleError);

          musicAudio.load();
        });

        await musicAudio.play();
      } catch (error) {
        console.error("Failed to play track:", error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [currentTrack]
  );

  const pauseMusic = useCallback(() => {
    const musicAudio = musicAudioRef.current;
    if (musicAudio && !musicAudio.paused) {
      musicAudio.pause();
    }
  }, []);

  const resumeMusic = useCallback(() => {
    const musicAudio = musicAudioRef.current;
    if (musicAudio && musicAudio.paused && currentTrack) {
      musicAudio.play().catch(console.error);
    }
  }, [currentTrack]);

  const stopMusic = useCallback(() => {
    const musicAudio = musicAudioRef.current;
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.currentTime = 0;
      setCurrentTrack(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const musicAudio = musicAudioRef.current;
      if (musicAudio && duration > 0) {
        const clampedTime = Math.max(0, Math.min(duration, time));
        musicAudio.currentTime = clampedTime;
        setCurrentTime(clampedTime);
      }
    },
    [duration]
  );

  return {
    // Notification sounds
    playSessionTransition,
    playStartSound,
    playPauseSound,

    // Music player
    currentTrack,
    isPlaying,
    isLoading,
    volume,
    currentTime,
    duration,
    playTrack,
    pauseMusic,
    resumeMusic,
    stopMusic,
    setVolume,
    seekTo,
  };
};
