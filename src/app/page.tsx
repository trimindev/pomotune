// src/app/page.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TaskInput } from "@/components/task/TaskInput";
import { TaskDisplay } from "@/components/task/TaskDisplay";
import { MusicSelector } from "@/components/music/MusicSelector";
import { VolumeControl } from "@/components/music/VolumeControl";
import { BackgroundManager } from "@/components/background/BackgroundManager";
import {
  // YouTubeEmbed,
  youTubeUtils,
} from "@/components/background/YouTubeEmbed";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { SessionType, MusicTrack, BackgroundMedia } from "@/lib/types";
import { DEFAULT_TIMER_SETTINGS } from "@/lib/constants";
import {
  saveCurrentTask,
  loadCurrentTask,
  clearCurrentTask,
  getRecentTaskNames,
} from "@/lib/storage";
import Image from "next/image";

export default function HomePage() {
  const [currentTask, setCurrentTask] = useState<string>("");
  const [settings] = useState(DEFAULT_TIMER_SETTINGS);
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [showMusicControls, setShowMusicControls] = useState(false);
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [savedVolume, setSavedVolume] = useState(50);

  // Background state
  const [currentBackground, setCurrentBackground] =
    useState<BackgroundMedia | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);

  // Audio hook for notifications and music
  const {
    playSessionTransition,
    playStartSound,
    playPauseSound,
    currentTrack,
    isPlaying,
    isLoading,
    volume,
    playTrack,
    pauseMusic,
    resumeMusic,
    setVolume,
  } = useAudio(true, 50);

  // Load saved settings on mount
  useEffect(() => {
    const savedTask = loadCurrentTask();
    if (savedTask) {
      setCurrentTask(savedTask);
    }

    // Load music settings
    const savedMusicSettings = localStorage.getItem("pomotune_music_settings");
    if (savedMusicSettings) {
      const settings = JSON.parse(savedMusicSettings);
      if (settings.volume !== undefined) {
        setVolume(settings.volume);
      }
      if (settings.isMuted !== undefined) {
        setIsMuted(settings.isMuted);
      }
      if (settings.showControls !== undefined) {
        setShowMusicControls(settings.showControls);
      }
    }

    // Load background settings
    const savedBackgroundSettings = localStorage.getItem(
      "pomotune_background_settings"
    );
    if (savedBackgroundSettings) {
      const settings = JSON.parse(savedBackgroundSettings);
      if (settings.currentBackground) {
        setCurrentBackground(settings.currentBackground);
      }
      if (settings.youtubeUrl) {
        setYoutubeUrl(settings.youtubeUrl);
        const embedUrl = youTubeUtils.toEmbedUrl(settings.youtubeUrl);
        setYoutubeEmbedUrl(embedUrl);
      }
      if (settings.showBackgroundControls !== undefined) {
        setShowBackgroundControls(settings.showBackgroundControls);
      }
    }
  }, [setVolume]);

  // Save settings whenever they change
  useEffect(() => {
    const musicSettings = {
      volume,
      isMuted,
      showControls: showMusicControls,
    };
    localStorage.setItem(
      "pomotune_music_settings",
      JSON.stringify(musicSettings)
    );
  }, [volume, isMuted, showMusicControls]);

  useEffect(() => {
    const backgroundSettings = {
      currentBackground,
      youtubeUrl,
      showBackgroundControls,
    };
    localStorage.setItem(
      "pomotune_background_settings",
      JSON.stringify(backgroundSettings)
    );
  }, [currentBackground, youtubeUrl, showBackgroundControls]);

  // Save current task whenever it changes
  useEffect(() => {
    saveCurrentTask(currentTask || null);
  }, [currentTask]);

  // Session completion handler
  const handleSessionComplete = useCallback(
    (completedSessionType: SessionType) => {
      playSessionTransition(completedSessionType);

      if (completedSessionType === "focus") {
        setCurrentTask("");
        clearCurrentTask();
      }
    },
    [playSessionTransition]
  );

  // Timer hook
  const {
    formattedTime,
    sessionLabel,
    cycleProgress,
    progress,
    isRunning,
    isPaused,
    isIdle,
    timerData,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipSession,
  } = useTimer(settings, handleSessionComplete);

  // Timer control handlers
  const handleStart = useCallback(() => {
    playStartSound();
    startTimer(currentTask || undefined);
    if (currentTask) {
      setShowTaskInput(false);
    }
  }, [playStartSound, startTimer, currentTask]);

  const handlePause = useCallback(() => {
    playPauseSound();
    pauseTimer();
  }, [playPauseSound, pauseTimer]);

  const handleResume = useCallback(() => {
    playStartSound();
    resumeTimer();
  }, [playStartSound, resumeTimer]);

  const handleReset = useCallback(() => {
    resetTimer();
    setCurrentTask("");
    clearCurrentTask();
    setShowTaskInput(true);
  }, [resetTimer]);

  const handleStop = useCallback(() => {
    stopTimer();
    setShowTaskInput(true);
  }, [stopTimer]);

  const handleTaskChange = useCallback((value: string) => {
    setCurrentTask(value);
  }, []);

  const handleTaskSubmit = useCallback(() => {
    if (currentTask.trim()) {
      handleStart();
    }
  }, [currentTask, handleStart]);

  // Music control handlers
  const handleTrackSelect = useCallback(
    async (track: MusicTrack) => {
      try {
        await playTrack(track);
      } catch (error) {
        console.error("Failed to play track:", error);
      }
    },
    [playTrack]
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseMusic();
    } else if (currentTrack) {
      resumeMusic();
    }
  }, [isPlaying, currentTrack, pauseMusic, resumeMusic]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      if (isMuted && newVolume > 0) {
        setIsMuted(false);
      }
    },
    [setVolume, isMuted]
  );

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(savedVolume > 0 ? savedVolume : 50);
    } else {
      setSavedVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  }, [isMuted, volume, savedVolume, setVolume]);

  // Background control handlers
  const handleBackgroundImageSelect = useCallback(
    (background: BackgroundMedia) => {
      setCurrentBackground(background);
      setYoutubeEmbedUrl(null); // Clear YouTube when selecting image
      setYoutubeUrl("");
    },
    []
  );

  const handleYoutubeUrlChange = useCallback((url: string) => {
    setYoutubeUrl(url);
    if (url.trim()) {
      const embedUrl = youTubeUtils.toEmbedUrl(url.trim());
      if (embedUrl) {
        setYoutubeEmbedUrl(embedUrl);
        setCurrentBackground(null); // Clear image when setting YouTube
      } else {
        setYoutubeEmbedUrl(null);
      }
    } else {
      setYoutubeEmbedUrl(null);
    }
  }, []);

  const handleClearBackground = useCallback(() => {
    setCurrentBackground(null);
    setYoutubeEmbedUrl(null);
    setYoutubeUrl("");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ":
          event.preventDefault();
          if (isIdle) {
            handleStart();
          } else if (isRunning) {
            handlePause();
          } else if (isPaused) {
            handleResume();
          }
          break;
        case "r":
          event.preventDefault();
          handleReset();
          break;
        case "s":
          event.preventDefault();
          skipSession();
          break;
        case "t":
          if (isIdle) {
            event.preventDefault();
            setShowTaskInput((prev) => !prev);
          }
          break;
        case "m":
          event.preventDefault();
          setShowMusicControls((prev) => !prev);
          break;
        case "b":
          event.preventDefault();
          setShowBackgroundControls((prev) => !prev);
          break;
        case "p":
          if (currentTrack) {
            event.preventDefault();
            handlePlayPause();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isIdle,
    isRunning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    skipSession,
    currentTrack,
    handlePlayPause,
  ]);

  return (
    <>
      {/* Background Manager - Renders behind everything */}
      <BackgroundManager
        imageBackground={currentBackground}
        youtubeEmbedUrl={youtubeEmbedUrl}
      />

      <div className="min-h-screen relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Background Controls */}
            {showBackgroundControls && (
              <div className="mb-6 p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
                <BackgroundControls
                  currentBackground={currentBackground}
                  youtubeUrl={youtubeUrl}
                  onBackgroundSelect={handleBackgroundImageSelect}
                  onYoutubeUrlChange={handleYoutubeUrlChange}
                  onClearBackground={handleClearBackground}
                />
              </div>
            )}

            {/* Compact Music Controls */}
            {!showMusicControls && currentTrack && (
              <div className="mb-4 flex items-center justify-between p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className="text-white hover:text-blue-400 p-1"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {currentTrack.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={handleVolumeChange}
                    onMuteToggle={handleMuteToggle}
                    variant="compact"
                  />
                  <button
                    onClick={() => setShowMusicControls(true)}
                    className="text-gray-400 hover:text-white p-1"
                    title="Show music controls"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Task Input */}
            {isIdle && showTaskInput && (
              <div className="mb-8">
                <TaskInput
                  value={currentTask}
                  onChange={handleTaskChange}
                  onSubmit={handleTaskSubmit}
                  placeholder="What are you working on? (optional)"
                  disabled={!isIdle}
                />
              </div>
            )}

            {/* Task Display */}
            {!isIdle && timerData.currentTask && (
              <div className="mb-6">
                <TaskDisplay
                  taskName={timerData.currentTask}
                  sessionType={timerData.sessionType}
                  isRunning={isRunning}
                  variant="default"
                />
              </div>
            )}

            {/* Timer Display */}
            <div className="mb-8">
              <TimerDisplay
                time={formattedTime}
                sessionType={timerData.sessionType}
                sessionLabel={sessionLabel}
                cycleProgress={cycleProgress}
                progress={progress}
                isRunning={isRunning}
              />
            </div>

            {/* Timer Controls */}
            <div className="mb-8">
              <TimerControls
                isRunning={isRunning}
                isPaused={isPaused}
                isIdle={isIdle}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onReset={handleReset}
                onSkip={skipSession}
              />
            </div>

            {/* Quick Task Suggestions */}
            {isIdle && showTaskInput && (
              <div className="mb-8">
                <QuickTaskSuggestions
                  onSelectTask={setCurrentTask}
                  currentTask={currentTask}
                />
              </div>
            )}

            {/* Controls Toggle Buttons */}
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={() => setShowMusicControls(!showMusicControls)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showMusicControls
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                🎵 Music
              </button>
              <button
                onClick={() =>
                  setShowBackgroundControls(!showBackgroundControls)
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showBackgroundControls
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                🖼️ Background
              </button>
            </div>

            {/* Music Controls */}
            {showMusicControls && (
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <MusicSelector
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    onTrackSelect={handleTrackSelect}
                    onPlayPause={handlePlayPause}
                  />
                </div>
                <div>
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={handleVolumeChange}
                    onMuteToggle={handleMuteToggle}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-xs text-gray-300">
            <p>
              Built with focus in mind. Use{" "}
              <kbd className="px-1 py-0.5 bg-white/10 rounded">Space</kbd> to
              play/pause,{" "}
              <kbd className="px-1 py-0.5 bg-white/10 rounded">R</kbd> to reset,{" "}
              <kbd className="px-1 py-0.5 bg-white/10 rounded">S</kbd> to skip,{" "}
              <kbd className="px-1 py-0.5 bg-white/10 rounded">T</kbd> to toggle
              task, <kbd className="px-1 py-0.5 bg-white/10 rounded">M</kbd> for
              music, <kbd className="px-1 py-0.5 bg-white/10 rounded">B</kbd>{" "}
              for background,{" "}
              <kbd className="px-1 py-0.5 bg-white/10 rounded">P</kbd> to
              play/pause music
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Background Controls Component
interface BackgroundControlsProps {
  currentBackground: BackgroundMedia | null;
  youtubeUrl: string;
  onBackgroundSelect: (background: BackgroundMedia) => void;
  onYoutubeUrlChange: (url: string) => void;
  onClearBackground: () => void;
}

const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  currentBackground,
  youtubeUrl,
  onBackgroundSelect,
  onYoutubeUrlChange,
  onClearBackground,
}) => {
  const [inputUrl, setInputUrl] = useState(youtubeUrl);

  const handleUrlSubmit = () => {
    onYoutubeUrlChange(inputUrl);
  };

  const sampleBackgrounds: BackgroundMedia[] = [
    {
      id: "nature-1",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
      title: "Mountain Lake",
      category: "nature",
      type: "image",
      isCustom: false,
    },
    {
      id: "nature-2",
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
      title: "Forest Path",
      category: "nature",
      type: "image",
      isCustom: false,
    },
    {
      id: "abstract-1",
      src: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80",
      title: "Abstract Waves",
      category: "abstract",
      type: "image",
      isCustom: false,
    },
    {
      id: "minimal-1",
      src: "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80",
      title: "Minimal Gradient",
      category: "minimal",
      type: "image",
      isCustom: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Background Settings
        </h3>

        {/* Clear Background Button */}
        <div className="mb-4">
          <button
            onClick={onClearBackground}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Clear Background
          </button>
        </div>

        {/* YouTube URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            YouTube Background Video
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Set Video
            </button>
          </div>
          {youtubeUrl && (
            <p className="text-xs text-gray-400 mt-1">Current: {youtubeUrl}</p>
          )}
        </div>

        {/* Background Image Grid */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Background Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sampleBackgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onBackgroundSelect(bg)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  currentBackground?.id === bg.id
                    ? "border-blue-500 ring-2 ring-blue-500/50"
                    : "border-white/20 hover:border-white/40"
                }`}
                type="button"
                aria-label={`Select background: ${bg.title}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onBackgroundSelect(bg);
                }}
              >
                <Image
                  src={bg.src}
                  alt={bg.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  priority={bg.id === "nature-1"}
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-xs text-white bg-black/50 rounded px-1 py-0.5 truncate">
                    {bg.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Task Suggestions Component
interface QuickTaskSuggestionsProps {
  onSelectTask: (task: string) => void;
  currentTask: string;
}

const QuickTaskSuggestions: React.FC<QuickTaskSuggestionsProps> = ({
  onSelectTask,
  currentTask,
}) => {
  const [recentTasks, setRecentTasks] = useState<string[]>([]);

  useEffect(() => {
    const recent = getRecentTaskNames(5);
    setRecentTasks(recent);
  }, []);

  if (recentTasks.length === 0 || currentTask) {
    return null;
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-300 mb-3">Recent tasks:</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {recentTasks.map((task, index) => (
          <button
            key={index}
            onClick={() => onSelectTask(task)}
            className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-colors duration-200 border border-white/20 hover:border-white/40"
          >
            {task}
          </button>
        ))}
      </div>
    </div>
  );
};
