// src/lib/types.ts

// Timer States
export type TimerState = 'idle' | 'running' | 'paused' | 'break';

// Session Types
export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

// Media Categories
export type MusicCategory = 'nature' | 'lofi' | 'whitenoise' | 'instrumental';
export type BackgroundCategory = 'nature' | 'abstract' | 'minimal' | 'workspace';
export type MediaType = 'image' | 'video' | 'audio';

// Task Session Model
export interface TaskSession {
  id: string; // uuid
  name: string | null;
  focusedMinutes: number;
  sessionType: SessionType;
  completed: boolean;
  createdAt: number; // timestamp
  completedAt: number | null; // timestamp
}

// Music Track Model
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string; // URL
  category: MusicCategory;
  duration: number; // seconds
  type: 'audio';
}

// Background Media Model
export interface BackgroundMedia {
  id: string;
  title: string;
  src: string; // URL
  type: 'image' | 'video';
  category: BackgroundCategory;
  isCustom: boolean;
}

// Timer Settings
export interface TimerSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
}

// Audio Settings
export interface AudioSettings {
  selectedMusicId: string | null;
  volume: number; // 0-100
  notificationSounds: boolean;
}

// Background Settings
export interface BackgroundSettings {
  selectedBackgroundId: string | null;
  customYouTubeEmbedUrl: string | null;
}

// App Settings Model
export interface AppSettings {
  timerSettings: TimerSettings;
  audioSettings: AudioSettings;
  backgroundSettings: BackgroundSettings;
}

// Timer State Interface
export interface TimerData {
  state: TimerState;
  sessionType: SessionType;
  timeRemaining: number; // seconds
  currentTask: string | null;
  sessionsCompleted: number;
  currentCycle: number; // for tracking long break cycles
}

// User Statistics
export interface UserStats {
  totalFocusTime: number; // minutes
  totalSessions: number;
  completedSessions: number;
  streakDays: number;
  lastSessionDate: number | null; // timestamp
}

// Audio Context Interface
export interface AudioContextData {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  audioElement: HTMLAudioElement | null;
}

// Background Context Interface
export interface BackgroundContextData {
  currentBackground: BackgroundMedia | null;
  customYouTubeUrl: string | null;
  backgroundType: 'image' | 'video' | 'youtube' | null;
}

// Local Storage Keys
export const STORAGE_KEYS = {
  APP_SETTINGS: 'pomotune_settings',
  TASK_SESSIONS: 'pomotune_sessions',
  USER_STATS: 'pomotune_stats',
  TIMER_STATE: 'pomotune_timer_state',
} as const;

// Default Settings
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  selectedMusicId: null,
  volume: 50,
  notificationSounds: true,
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  selectedBackgroundId: null,
  customYouTubeEmbedUrl: null,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  timerSettings: DEFAULT_TIMER_SETTINGS,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  backgroundSettings: DEFAULT_BACKGROUND_SETTINGS,
};

export const DEFAULT_TIMER_DATA: TimerData = {
  state: 'idle',
  sessionType: 'focus',
  timeRemaining: DEFAULT_TIMER_SETTINGS.focusDuration * 60, // convert to seconds
  currentTask: null,
  sessionsCompleted: 0,
  currentCycle: 0,
};

export const DEFAULT_USER_STATS: UserStats = {
  totalFocusTime: 0,
  totalSessions: 0,
  completedSessions: 0,
  streakDays: 0,
  lastSessionDate: null,
};

// Utility Types
export type TimerAction = 
  | { type: 'START_TIMER'; payload?: { taskName?: string } }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'TICK' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'START_BREAK'; payload: { breakType: 'shortBreak' | 'longBreak' } }
  | { type: 'SKIP_BREAK' }
  | { type: 'RESET_TIMER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimerSettings> };

// YouTube URL Validation Result
export interface YouTubeValidationResult {
  isValid: boolean;
  embedUrl?: string;
  error?: string;
}

// Error Types
export type PomotuneError = 
  | 'INVALID_YOUTUBE_URL'
  | 'AUDIO_LOAD_FAILED'
  | 'BACKGROUND_LOAD_FAILED'
  | 'STORAGE_ERROR'
  | 'PERMISSION_DENIED';

export interface ErrorState {
  type: PomotuneError;
  message: string;
  timestamp: number;
}