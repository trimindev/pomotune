// src/hooks/useTimer.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerData, TimerSettings, SessionType, TimerState, DEFAULT_TIMER_SETTINGS } from '@/lib/types';

interface UseTimerProps {
  settings?: TimerSettings;
  onSessionComplete?: (sessionType: SessionType, taskName?: string) => void;
  onTimerTick?: (timeRemaining: number) => void;
}

export const useTimer = ({ 
  settings = DEFAULT_TIMER_SETTINGS, 
  onSessionComplete,
  onTimerTick 
}: UseTimerProps = {}) => {
  // Timer state
  const [timerData, setTimerData] = useState<TimerData>({
    state: 'idle',
    sessionType: 'focus',
    timeRemaining: settings.focusDuration * 60, // Convert minutes to seconds
    currentTask: null,
    sessionsCompleted: 0,
    currentCycle: 0,
  });

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const settingsRef = useRef(settings);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Get duration for session type
  const getSessionDuration = useCallback((sessionType: SessionType): number => {
    const currentSettings = settingsRef.current;
    switch (sessionType) {
      case 'focus':
        return currentSettings.focusDuration * 60;
      case 'shortBreak':
        return currentSettings.shortBreakDuration * 60;
      case 'longBreak':
        return currentSettings.longBreakDuration * 60;
      default:
        return currentSettings.focusDuration * 60;
    }
  }, []);

  // Determine next session type
  const getNextSessionType = useCallback((currentSessionType: SessionType, sessionsCompleted: number): SessionType => {
    const currentSettings = settingsRef.current;
    
    if (currentSessionType === 'focus') {
      // After focus session, determine break type
      const isLongBreakTime = (sessionsCompleted + 1) % currentSettings.sessionsUntilLongBreak === 0;
      return isLongBreakTime ? 'longBreak' : 'shortBreak';
    } else {
      // After any break, return to focus
      return 'focus';
    }
  }, []);

  // Clear interval helper
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer
  const startTimer = useCallback((taskName?: string) => {
    setTimerData(prev => ({
      ...prev,
      state: 'running',
      currentTask: taskName || prev.currentTask,
    }));
  }, []);

  // Pause timer
  const pauseTimer = useCallback(() => {
    clearTimer();
    setTimerData(prev => ({
      ...prev,
      state: 'paused',
    }));
  }, [clearTimer]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setTimerData(prev => ({
      ...prev,
      state: 'running',
    }));
  }, []);

  // Stop/Reset timer
  const stopTimer = useCallback(() => {
    clearTimer();
    setTimerData(prev => ({
      ...prev,
      state: 'idle',
      timeRemaining: getSessionDuration(prev.sessionType),
      currentTask: null,
    }));
  }, [clearTimer, getSessionDuration]);

  // Reset timer to initial state
  const resetTimer = useCallback(() => {
    clearTimer();
    setTimerData({
      state: 'idle',
      sessionType: 'focus',
      timeRemaining: getSessionDuration('focus'),
      currentTask: null,
      sessionsCompleted: 0,
      currentCycle: 0,
    });
  }, [clearTimer, getSessionDuration]);

  // Skip current session
  const skipSession = useCallback(() => {
    setTimerData(prev => {
      const nextSessionType = getNextSessionType(prev.sessionType, prev.sessionsCompleted);
      const newSessionsCompleted = prev.sessionType === 'focus' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
      const newCycle = prev.sessionType === 'longBreak' ? prev.currentCycle + 1 : prev.currentCycle;

      return {
        ...prev,
        sessionType: nextSessionType,
        timeRemaining: getSessionDuration(nextSessionType),
        sessionsCompleted: newSessionsCompleted,
        currentCycle: newCycle,
        state: 'idle',
        currentTask: nextSessionType === 'focus' ? null : prev.currentTask,
      };
    });
    clearTimer();
  }, [clearTimer, getNextSessionType, getSessionDuration]);

  // Switch session (internal use for automatic transitions)
  const switchSession = useCallback(() => {
    setTimerData(prev => {
      const nextSessionType = getNextSessionType(prev.sessionType, prev.sessionsCompleted);
      const newSessionsCompleted = prev.sessionType === 'focus' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
      const newCycle = prev.sessionType === 'longBreak' ? prev.currentCycle + 1 : prev.currentCycle;

      // Call completion callback
      if (onSessionComplete) {
        onSessionComplete(prev.sessionType, prev.currentTask || undefined);
      }

      return {
        ...prev,
        sessionType: nextSessionType,
        timeRemaining: getSessionDuration(nextSessionType),
        sessionsCompleted: newSessionsCompleted,
        currentCycle: newCycle,
        state: 'break',
        currentTask: nextSessionType === 'focus' ? null : prev.currentTask,
      };
    });
  }, [getNextSessionType, getSessionDuration, onSessionComplete]);

  // Update timer duration when settings change
  useEffect(() => {
    if (timerData.state === 'idle') {
      setTimerData(prev => ({
        ...prev,
        timeRemaining: getSessionDuration(prev.sessionType),
      }));
    }
  }, [settings, timerData.state, getSessionDuration]);

  // Main timer countdown effect
  useEffect(() => {
    if (timerData.state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimerData(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;

          // Call tick callback
          if (onTimerTick) {
            onTimerTick(newTimeRemaining);
          }

          // Check if timer is complete
          if (newTimeRemaining <= 0) {
            // Timer completed, switch to next session
            setTimeout(() => switchSession(), 0);
            return {
              ...prev,
              timeRemaining: 0,
              state: 'idle',
            };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);

      return () => clearTimer();
    } else {
      clearTimer();
    }
  }, [timerData.state, clearTimer, switchSession, onTimerTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Helper functions for UI
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback((): number => {
    const totalDuration = getSessionDuration(timerData.sessionType);
    return ((totalDuration - timerData.timeRemaining) / totalDuration) * 100;
  }, [timerData.sessionType, timerData.timeRemaining, getSessionDuration]);

  const isRunning = timerData.state === 'running';
  const isPaused = timerData.state === 'paused';
  const isIdle = timerData.state === 'idle';
  const isBreak = timerData.state === 'break';

  return {
    // State
    ...timerData,
    isRunning,
    isPaused,
    isIdle,
    isBreak,

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipSession,

    // Helpers
    formatTime: formatTime(timerData.timeRemaining),
    progress: getProgress(),
    sessionLabel: timerData.sessionType === 'focus' ? 'Focus' : 
                  timerData.sessionType === 'shortBreak' ? 'Short Break' : 
                  'Long Break',
    cycleProgress: `${timerData.currentCycle + 1}/${Math.ceil((timerData.sessionsCompleted + 1) / settingsRef.current.sessionsUntilLongBreak)}`,
  };
};