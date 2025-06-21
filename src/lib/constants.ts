// src/lib/constants.ts

import type {
  TimerSettings,
  AudioSettings,
  BackgroundSettings,
  AppSettings,
  TimerData,
  UserStats,
} from "./types";

// Local Storage Keys
export const STORAGE_KEYS = {
  APP_SETTINGS: "pomotune_settings",
  TASK_SESSIONS: "pomotune_sessions",
  USER_STATS: "pomotune_stats",
  TIMER_STATE: "pomotune_timer_state",
} as const;

// Default Timer Settings
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

// Default Audio Settings
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  selectedMusicId: null,
  volume: 50,
  notificationSounds: true,
};

// Default Background Settings
export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  selectedBackgroundId: null,
  customYouTubeEmbedUrl: null,
};

// Combined Default App Settings
export const DEFAULT_APP_SETTINGS: AppSettings = {
  timerSettings: DEFAULT_TIMER_SETTINGS,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  backgroundSettings: DEFAULT_BACKGROUND_SETTINGS,
};

// Default Timer State
export const DEFAULT_TIMER_DATA: TimerData = {
  state: "idle",
  sessionType: "focus",
  timeRemaining: DEFAULT_TIMER_SETTINGS.focusDuration * 60, // convert to seconds
  currentTask: null,
  sessionsCompleted: 0,
  currentCycle: 0,
};

// Default User Statistics
export const DEFAULT_USER_STATS: UserStats = {
  totalFocusTime: 0,
  totalSessions: 0,
  completedSessions: 0,
  streakDays: 0,
  lastSessionDate: null,
};

// Timer Duration Constants (in minutes)
export const TIMER_DURATIONS = {
  DEFAULT_FOCUS: 25,
  DEFAULT_SHORT_BREAK: 5,
  DEFAULT_LONG_BREAK: 15,
  MIN_DURATION: 1,
  MAX_DURATION: 120,
} as const;

// Audio Constants
export const AUDIO_CONSTANTS = {
  DEFAULT_VOLUME: 50,
  MIN_VOLUME: 0,
  MAX_VOLUME: 100,
  FADE_DURATION: 1000, // milliseconds
} as const;

// Session Constants
export const SESSION_CONSTANTS = {
  DEFAULT_SESSIONS_UNTIL_LONG_BREAK: 4,
  MAX_SESSIONS_UNTIL_LONG_BREAK: 10,
} as const;

// Notification Messages
export const NOTIFICATION_MESSAGES = {
  FOCUS_COMPLETE: "Focus session completed! Time for a break.",
  SHORT_BREAK_COMPLETE: "Short break finished! Ready to focus?",
  LONG_BREAK_COMPLETE: "Long break finished! Ready for a new cycle?",
  SESSION_STARTED: "Session started!",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_YOUTUBE_URL: "Invalid YouTube URL. Please check the URL format.",
  AUDIO_LOAD_FAILED: "Failed to load audio. Please try again.",
  BACKGROUND_LOAD_FAILED: "Failed to load background. Please try again.",
  STORAGE_ERROR: "Storage error occurred. Settings may not persist.",
  PERMISSION_DENIED: "Permission denied. Please check browser settings.",
} as const;
