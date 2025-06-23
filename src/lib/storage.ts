// src/lib/storage.ts

import type { AppSettings, TaskSession, UserStats, TimerData } from "./types";
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_USER_STATS,
  DEFAULT_TIMER_DATA,
  STORAGE_KEYS,
} from "./constants";

// Error handling utility
const handleStorageError = (operation: string, error: unknown): void => {
  console.warn(`Storage ${operation} failed:`, error);
  // Could dispatch to error handling context here
};

// Generic localStorage operations with error handling
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === "undefined") return defaultValue;

    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    handleStorageError("read", error);
    return defaultValue;
  }
};

const safeSetItem = <T>(key: string, value: T): boolean => {
  try {
    if (typeof window === "undefined") return false;

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    handleStorageError("write", error);
    return false;
  }
};

const safeRemoveItem = (key: string): boolean => {
  try {
    if (typeof window === "undefined") return false;

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    handleStorageError("remove", error);
    return false;
  }
};

// App Settings Management
export const loadAppSettings = (): AppSettings => {
  return safeGetItem(STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS);
};

export const saveAppSettings = (settings: AppSettings): boolean => {
  return safeSetItem(STORAGE_KEYS.APP_SETTINGS, settings);
};

export const updateAppSettings = (
  updates: Partial<AppSettings>
): AppSettings => {
  const currentSettings = loadAppSettings();
  const newSettings = {
    ...currentSettings,
    ...updates,
    // Deep merge nested objects
    timerSettings: {
      ...currentSettings.timerSettings,
      ...(updates.timerSettings || {}),
    },
    audioSettings: {
      ...currentSettings.audioSettings,
      ...(updates.audioSettings || {}),
    },
    backgroundSettings: {
      ...currentSettings.backgroundSettings,
      ...(updates.backgroundSettings || {}),
    },
  };

  saveAppSettings(newSettings);
  return newSettings;
};

// Task Session Management
export const loadTaskSessions = (): TaskSession[] => {
  return safeGetItem(STORAGE_KEYS.TASK_SESSIONS, []);
};

export const saveTaskSession = (session: TaskSession): boolean => {
  try {
    const sessions = loadTaskSessions();
    const updatedSessions = [session, ...sessions];

    // Keep only the most recent 100 sessions to prevent storage bloat
    const trimmedSessions = updatedSessions.slice(0, 100);

    return safeSetItem(STORAGE_KEYS.TASK_SESSIONS, trimmedSessions);
  } catch (error) {
    handleStorageError("save task session", error);
    return false;
  }
};

export const updateTaskSession = (
  sessionId: string,
  updates: Partial<TaskSession>
): boolean => {
  try {
    const sessions = loadTaskSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex === -1) return false;

    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
    return safeSetItem(STORAGE_KEYS.TASK_SESSIONS, sessions);
  } catch (error) {
    handleStorageError("update task session", error);
    return false;
  }
};

export const deleteTaskSession = (sessionId: string): boolean => {
  try {
    const sessions = loadTaskSessions();
    const filteredSessions = sessions.filter((s) => s.id !== sessionId);
    return safeSetItem(STORAGE_KEYS.TASK_SESSIONS, filteredSessions);
  } catch (error) {
    handleStorageError("delete task session", error);
    return false;
  }
};

// Get completed tasks for history/statistics
export const getCompletedTasks = (): TaskSession[] => {
  return loadTaskSessions().filter((session) => session.completed);
};

// Get tasks by date range
export const getTasksByDateRange = (
  startDate: number,
  endDate: number
): TaskSession[] => {
  return loadTaskSessions().filter(
    (session) => session.createdAt >= startDate && session.createdAt <= endDate
  );
};

// Get recent task names for autocomplete/suggestions
export const getRecentTaskNames = (limit: number = 10): string[] => {
  const sessions = loadTaskSessions();
  const taskNames = sessions
    .filter((session) => session.name && session.name.trim())
    .map((session) => session.name!)
    .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
    .slice(0, limit);

  return taskNames;
};

// User Statistics Management
export const loadUserStats = (): UserStats => {
  return safeGetItem(STORAGE_KEYS.USER_STATS, DEFAULT_USER_STATS);
};

export const saveUserStats = (stats: UserStats): boolean => {
  return safeSetItem(STORAGE_KEYS.USER_STATS, stats);
};

export const updateUserStats = (updates: Partial<UserStats>): UserStats => {
  const currentStats = loadUserStats();
  const newStats = { ...currentStats, ...updates };

  saveUserStats(newStats);
  return newStats;
};

// Calculate and update statistics from completed session
export const updateStatsFromSession = (session: TaskSession): UserStats => {
  if (!session.completed) return loadUserStats();

  const currentStats = loadUserStats();
  const sessionDate = new Date(session.createdAt).toDateString();
  const lastSessionDate = currentStats.lastSessionDate
    ? new Date(currentStats.lastSessionDate).toDateString()
    : null;

  // Calculate streak
  let newStreakDays = currentStats.streakDays;
  if (lastSessionDate) {
    const daysDiff = Math.floor(
      (session.createdAt - currentStats.lastSessionDate!) /
        (1000 * 60 * 60 * 24)
    );

    if (sessionDate === lastSessionDate) {
      // Same day, streak continues
    } else if (daysDiff === 1) {
      // Next day, increment streak
      newStreakDays++;
    } else if (daysDiff > 1) {
      // Gap in days, reset streak
      newStreakDays = 1;
    }
  } else {
    // First session
    newStreakDays = 1;
  }

  const updatedStats: UserStats = {
    totalFocusTime:
      currentStats.totalFocusTime +
      (session.sessionType === "focus" ? session.focusedMinutes : 0),
    totalSessions: currentStats.totalSessions + 1,
    completedSessions: currentStats.completedSessions + 1,
    streakDays: newStreakDays,
    lastSessionDate: session.completedAt || session.createdAt,
  };

  saveUserStats(updatedStats);
  return updatedStats;
};

// Timer State Persistence (for app state recovery)
export const loadTimerData = (): TimerData => {
  return safeGetItem(STORAGE_KEYS.TIMER_STATE, DEFAULT_TIMER_DATA);
};

export const saveTimerData = (timerData: TimerData): boolean => {
  return safeSetItem(STORAGE_KEYS.TIMER_STATE, timerData);
};

export const clearTimerData = (): boolean => {
  return safeRemoveItem(STORAGE_KEYS.TIMER_STATE);
};

// Current task management (separate from session history)
export const saveCurrentTask = (taskName: string | null): boolean => {
  return safeSetItem("pomotune_current_task", taskName);
};

export const loadCurrentTask = (): string | null => {
  return safeGetItem("pomotune_current_task", null);
};

export const clearCurrentTask = (): boolean => {
  return safeRemoveItem("pomotune_current_task");
};

// Storage cleanup utilities
export const clearAllData = (): boolean => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      safeRemoveItem(key);
    });
    safeRemoveItem("pomotune_current_task");
    return true;
  } catch (error) {
    handleStorageError("clear all data", error);
    return false;
  }
};

export const getStorageUsage = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  try {
    if (typeof window === "undefined") {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
      }
    });

    // Rough estimate of localStorage limit (usually 5-10MB)
    const estimated_limit = 5 * 1024 * 1024; // 5MB
    const percentage = (used / estimated_limit) * 100;

    return {
      used,
      available: estimated_limit - used,
      percentage: Math.min(percentage, 100),
    };
  } catch (error) {
    handleStorageError("get storage usage", error);
    return { used: 0, available: 0, percentage: 0 };
  }
};

// Export utility functions for error handling
export const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === "undefined") return false;

    const test = "__pomotune_storage_test__";
    localStorage.setItem(test, "test");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
