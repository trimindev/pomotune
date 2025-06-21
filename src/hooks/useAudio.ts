// src/hooks/useAudio.ts

import { useCallback, useRef, useEffect, useState } from "react";
import { SessionType } from "@/lib/types";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface UseAudioReturn {
  playSessionTransition: (sessionType: SessionType) => void;
  playStartSound: () => void;
  playPauseSound: () => void;
  setVolume: (volume: number) => void;
  isSupported: boolean;
}

export const useAudio = (
  notificationSounds: boolean = true,
  volume: number = 0.5
): UseAudioReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);
  const volumeRef = useRef(volume);

  // Update volume ref when volume changes
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current || !notificationSounds) return;

    try {
      // Create audio context
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();

        // Resume context if suspended (required by some browsers)
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        isInitializedRef.current = true;
      }
    } catch (error) {
      console.warn("Failed to initialize audio context:", error);
    }
  }, [notificationSounds]);

  // Create a simple beep tone
  const createBeep = useCallback(
    async (
      frequency: number = 800,
      duration: number = 200,
      volume: number = 0.1
    ) => {
      if (!audioContextRef.current || !notificationSounds) return;

      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        // Configure oscillator
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContextRef.current.currentTime
        );

        // Configure gain (volume)
        const adjustedVolume = Math.min(
          1,
          Math.max(0, volume * volumeRef.current)
        );
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          adjustedVolume,
          audioContextRef.current.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContextRef.current.currentTime + duration / 1000
        );

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        // Start and stop
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
      } catch (error) {
        console.warn("Failed to create beep:", error);
      }
    },
    [notificationSounds]
  );

  // Create a double beep
  const createDoubleBeep = useCallback(
    async (frequency: number = 800, volume: number = 0.1) => {
      await createBeep(frequency, 150, volume);
      setTimeout(() => createBeep(frequency, 150, volume), 200);
    },
    [createBeep]
  );

  // Create a triple beep sequence
  const createTripleBeep = useCallback(
    async (frequencies: number[] = [600, 800, 1000], volume: number = 0.1) => {
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => createBeep(frequencies[i], 200, volume), i * 150);
      }
    },
    [createBeep]
  );

  // Play session transition sound
  const playSessionTransition = useCallback(
    async (sessionType: SessionType) => {
      await initializeAudio();

      if (!notificationSounds) return;

      switch (sessionType) {
        case "focus":
          // Focus session ended - play double beep (break time)
          await createDoubleBeep(800, 0.15);
          break;
        case "shortBreak":
          // Short break ended - play single beep (back to focus)
          await createBeep(1000, 300, 0.12);
          break;
        case "longBreak":
          // Long break ended - play triple ascending beep (back to focus after long break)
          await createTripleBeep([600, 800, 1000], 0.12);
          break;
        default:
          await createBeep(800, 200, 0.1);
      }
    },
    [
      initializeAudio,
      notificationSounds,
      createDoubleBeep,
      createBeep,
      createTripleBeep,
    ]
  );

  // Play start sound
  const playStartSound = useCallback(async () => {
    await initializeAudio();
    if (notificationSounds) {
      await createBeep(600, 150, 0.08);
    }
  }, [initializeAudio, notificationSounds, createBeep]);

  // Play pause sound
  const playPauseSound = useCallback(async () => {
    await initializeAudio();
    if (notificationSounds) {
      await createBeep(400, 200, 0.08);
    }
  }, [initializeAudio, notificationSounds, createBeep]);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    volumeRef.current = Math.min(1, Math.max(0, newVolume));
  }, []);

  // Check if audio is supported (client-side only)
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(Boolean(window.AudioContext || window.webkitAudioContext));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSessionTransition,
    playStartSound,
    playPauseSound,
    setVolume,
    isSupported,
  };
};
