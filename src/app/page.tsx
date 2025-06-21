// src/app/page.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { SessionType } from "@/lib/types";
import { DEFAULT_TIMER_SETTINGS } from "@/lib/constants";

export default function HomePage() {
  const [currentTask, setCurrentTask] = useState<string>("");
  const [settings] = useState(DEFAULT_TIMER_SETTINGS);

  // Audio hook for notifications
  const {
    playSessionTransition,
    playStartSound,
    playPauseSound,
    isSupported: isAudioSupported,
  } = useAudio(true, 0.5);

  // Session completion handler
  const handleSessionComplete = useCallback(
    (completedSessionType: SessionType) => {
      playSessionTransition(completedSessionType);
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

  // Handle start with audio feedback
  const handleStart = useCallback(() => {
    playStartSound();
    startTimer(currentTask || undefined);
  }, [playStartSound, startTimer, currentTask]);

  // Handle pause with audio feedback
  const handlePause = useCallback(() => {
    playPauseSound();
    pauseTimer();
  }, [playPauseSound, pauseTimer]);

  // Handle resume with audio feedback
  const handleResume = useCallback(() => {
    playStartSound();
    resumeTimer();
  }, [playStartSound, resumeTimer]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetTimer();
    setCurrentTask("");
  }, [resetTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
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
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Pomotune</h1>
            {!isAudioSupported && (
              <div className="text-xs text-amber-400">
                Audio notifications not supported
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Task Input Section */}
          <div className="mb-8 text-center">
            <div className="max-w-md mx-auto">
              <label
                htmlFor="task-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                What are you working on? (optional)
              </label>
              <input
                id="task-input"
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Enter your task..."
                disabled={isRunning}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={100}
              />
              {currentTask && (
                <div className="mt-1 text-xs text-gray-500">
                  {currentTask.length}/100 characters
                </div>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="mb-8">
            <TimerDisplay
              time={formattedTime}
              sessionType={timerData.sessionType}
              sessionLabel={sessionLabel}
              cycleProgress={cycleProgress}
              progress={progress}
              isRunning={isRunning}
              currentTask={timerData.currentTask}
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
              onStop={stopTimer}
              onReset={handleReset}
              onSkip={skipSession}
            />
          </div>

          {/* Session Info */}
          <div className="text-center text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-center space-x-6">
              <div>
                <span className="font-medium">Sessions: </span>
                <span>{timerData.sessionsCompleted}</span>
              </div>
              <div>
                <span className="font-medium">Cycle: </span>
                <span>{cycleProgress}</span>
              </div>
            </div>

            {timerData.sessionType === "focus" && (
              <div className="text-xs text-gray-500">
                {timerData.currentCycle + 1 === settings.sessionsUntilLongBreak
                  ? "Long break coming up after this session!"
                  : `${
                      settings.sessionsUntilLongBreak -
                      (timerData.currentCycle + 1)
                    } sessions until long break`}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          <p>
            Built with focus in mind. Use{" "}
            <kbd className="px-1 py-0.5 bg-gray-800 rounded">Space</kbd> to
            play/pause,
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-1">R</kbd> to
            reset,
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-1">S</kbd> to
            skip
          </p>
        </div>
      </footer>
    </div>
  );
}
