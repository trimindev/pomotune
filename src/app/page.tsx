// src/app/page.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TaskInput } from "@/components/task/TaskInput";
import { TaskDisplay } from "@/components/task/TaskDisplay";
import { useTimer } from "@/hooks/useTimer";
import { useAudio } from "@/hooks/useAudio";
import { SessionType } from "@/lib/types";
import { DEFAULT_TIMER_SETTINGS } from "@/lib/constants";
import {
  saveCurrentTask,
  loadCurrentTask,
  clearCurrentTask,
  getRecentTaskNames,
} from "@/lib/storage";

export default function HomePage() {
  const [currentTask, setCurrentTask] = useState<string>("");
  const [settings] = useState(DEFAULT_TIMER_SETTINGS);
  const [showTaskInput, setShowTaskInput] = useState(true);

  // Audio hook for notifications
  const { playSessionTransition, playStartSound, playPauseSound } = useAudio(
    true,
    0.5
  );

  // Load saved current task on mount
  useEffect(() => {
    const savedTask = loadCurrentTask();
    if (savedTask) {
      setCurrentTask(savedTask);
    }
  }, []);

  // Save current task whenever it changes
  useEffect(() => {
    saveCurrentTask(currentTask || null);
  }, [currentTask]);

  // Session completion handler
  const handleSessionComplete = useCallback(
    (completedSessionType: SessionType) => {
      playSessionTransition(completedSessionType);

      // Clear current task after completing a focus session
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

  // Handle start with audio feedback
  const handleStart = useCallback(() => {
    playStartSound();
    startTimer(currentTask || undefined);
    // Hide task input when timer starts
    if (currentTask) {
      setShowTaskInput(false);
    }
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
    clearCurrentTask();
    setShowTaskInput(true);
  }, [resetTimer]);

  // Handle stop
  const handleStop = useCallback(() => {
    stopTimer();
    setShowTaskInput(true);
  }, [stopTimer]);

  // Handle task input changes
  const handleTaskChange = useCallback((value: string) => {
    setCurrentTask(value);
  }, []);

  // Handle task input submit (optional)
  const handleTaskSubmit = useCallback(() => {
    if (currentTask.trim()) {
      handleStart();
    }
  }, [currentTask, handleStart]);

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
        case "t":
          // Toggle task input visibility when idle
          if (isIdle) {
            event.preventDefault();
            setShowTaskInput((prev) => !prev);
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
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Task Input - Show when idle or when explicitly shown */}
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

          {/* Task Display - Show when timer is active and task exists */}
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
              onStop={handleStop}
              onReset={handleReset}
              onSkip={skipSession}
            />
          </div>

          {/* Quick Task Suggestions - Show when idle and input is visible */}
          {isIdle && showTaskInput && (
            <div className="mb-8">
              <QuickTaskSuggestions
                onSelectTask={setCurrentTask}
                currentTask={currentTask}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          <p>
            Built with focus in mind. Use{" "}
            <kbd className="px-1 py-0.5 bg-gray-800 rounded">Space</kbd> to
            play/pause, <kbd className="px-1 py-0.5 bg-gray-800 rounded">R</kbd>{" "}
            to reset, <kbd className="px-1 py-0.5 bg-gray-800 rounded">S</kbd>{" "}
            to skip, <kbd className="px-1 py-0.5 bg-gray-800 rounded">T</kbd> to
            toggle task input
          </p>
        </div>
      </footer>
    </div>
  );
}

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
      <p className="text-sm text-gray-500 mb-3">Recent tasks:</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {recentTasks.map((task, index) => (
          <button
            key={index}
            onClick={() => onSelectTask(task)}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors duration-200 border border-gray-700 hover:border-gray-600"
          >
            {task}
          </button>
        ))}
      </div>
    </div>
  );
};
