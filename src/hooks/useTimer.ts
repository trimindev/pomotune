// src/hooks/useTimer.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { TimerState, SessionType, TimerData, TimerSettings } from "@/lib/types";
import { DEFAULT_TIMER_SETTINGS } from "@/lib/constants";

interface UseTimerReturn {
  timerData: TimerData;
  formattedTime: string;
  sessionLabel: string;
  cycleProgress: string;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  startTimer: (taskName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

export const useTimer = (
  settings: TimerSettings = DEFAULT_TIMER_SETTINGS,
  onSessionComplete?: (sessionType: SessionType) => void
): UseTimerReturn => {
  const [timerData, setTimerData] = useState<TimerData>({
    state: "idle",
    sessionType: "focus",
    timeRemaining: settings.focusDuration * 60,
    currentTask: null,
    sessionsCompleted: 0,
    currentCycle: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const settingsRef = useRef(settings);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Get session label
  const getSessionLabel = useCallback((sessionType: SessionType): string => {
    switch (sessionType) {
      case "focus":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus Time";
    }
  }, []);

  // Get session duration in seconds
  const getSessionDuration = useCallback((sessionType: SessionType): number => {
    const currentSettings = settingsRef.current;
    switch (sessionType) {
      case "focus":
        return currentSettings.focusDuration * 60;
      case "shortBreak":
        return currentSettings.shortBreakDuration * 60;
      case "longBreak":
        return currentSettings.longBreakDuration * 60;
      default:
        return currentSettings.focusDuration * 60;
    }
  }, []);

  // Calculate progress percentage
  const calculateProgress = useCallback(
    (timeRemaining: number, sessionType: SessionType): number => {
      const totalTime = getSessionDuration(sessionType);
      const elapsed = totalTime - timeRemaining;
      return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
    },
    [getSessionDuration]
  );

  // Handle session completion and transition
  const completeSession = useCallback(() => {
    setTimerData((prev) => {
      const isCompletedFocusSession = prev.sessionType === "focus";
      const newSessionsCompleted = isCompletedFocusSession
        ? prev.sessionsCompleted + 1
        : prev.sessionsCompleted;
      const newCycle = isCompletedFocusSession
        ? prev.currentCycle + 1
        : prev.currentCycle;

      // Determine next session type
      let nextSessionType: SessionType;
      if (prev.sessionType === "focus") {
        // After focus, decide between short or long break
        const shouldTakeLongBreak =
          newCycle >= settingsRef.current.sessionsUntilLongBreak;
        nextSessionType = shouldTakeLongBreak ? "longBreak" : "shortBreak";
      } else {
        // After any break, go to focus
        nextSessionType = "focus";
      }

      // Reset cycle if taking long break
      const resetCycle =
        prev.sessionType === "focus" &&
        newCycle >= settingsRef.current.sessionsUntilLongBreak;

      const newTimerData = {
        ...prev,
        state: "idle" as TimerState,
        sessionType: nextSessionType,
        timeRemaining: getSessionDuration(nextSessionType),
        sessionsCompleted: newSessionsCompleted,
        currentCycle: resetCycle ? 0 : newCycle,
        currentTask: nextSessionType === "focus" ? prev.currentTask : null, // Keep task only for focus sessions
      };

      // Trigger callback
      if (onSessionComplete) {
        onSessionComplete(prev.sessionType);
      }

      return newTimerData;
    });
  }, [getSessionDuration, onSessionComplete]);

  // Timer tick logic
  const tick = useCallback(() => {
    setTimerData((prev) => {
      if (prev.state !== "running") return prev;

      const newTimeRemaining = prev.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        // Session completed
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Use setTimeout to handle session completion after state update
        setTimeout(completeSession, 0);

        return {
          ...prev,
          timeRemaining: 0,
          state: "idle",
        };
      }

      return {
        ...prev,
        timeRemaining: newTimeRemaining,
      };
    });
  }, [completeSession]);

  // Start timer
  const startTimer = useCallback(
    (taskName?: string) => {
      setTimerData((prev) => ({
        ...prev,
        state: "running",
        currentTask:
          prev.sessionType === "focus" ? taskName || prev.currentTask : null,
      }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(tick, 1000);
    },
    [tick]
  );

  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerData((prev) => ({
      ...prev,
      state: "paused",
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setTimerData((prev) => ({
      ...prev,
      state: "running",
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerData((prev) => ({
      ...prev,
      state: "idle",
      timeRemaining: getSessionDuration(prev.sessionType),
    }));
  }, [getSessionDuration]);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerData((prev) => ({
      ...prev,
      state: "idle",
      sessionType: "focus",
      timeRemaining: settingsRef.current.focusDuration * 60,
      currentTask: null,
      sessionsCompleted: 0,
      currentCycle: 0,
    }));
  }, []);

  // Skip current session
  const skipSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    completeSession();
  }, [completeSession]);

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      settingsRef.current = { ...settingsRef.current, ...newSettings };

      // If timer is idle, update the time remaining for current session
      setTimerData((prev) => {
        if (prev.state === "idle") {
          return {
            ...prev,
            timeRemaining: getSessionDuration(prev.sessionType),
          };
        }
        return prev;
      });
    },
    [getSessionDuration]
  );

  // Computed values
  const formattedTime = formatTime(timerData.timeRemaining);
  const sessionLabel = getSessionLabel(timerData.sessionType);
  const cycleProgress = `${timerData.currentCycle + 1}/${
    settings.sessionsUntilLongBreak
  }`;
  const progress = calculateProgress(
    timerData.timeRemaining,
    timerData.sessionType
  );
  const isRunning = timerData.state === "running";
  const isPaused = timerData.state === "paused";
  const isIdle = timerData.state === "idle";

  return {
    timerData,
    formattedTime,
    sessionLabel,
    cycleProgress,
    progress,
    isRunning,
    isPaused,
    isIdle,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipSession,
    updateSettings,
  };
};
