"use client";

import React, { useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { SessionType } from "@/lib/types";

export default function Home() {
  const {
    // Timer state
    state,
    sessionType,
    timeRemaining,
    currentTask,
    sessionsCompleted,
    currentCycle,
    isRunning,
    isPaused,
    isIdle,
    isBreak,

    // Timer actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipSession,

    // Helper values
    formatTime,
    progress,
    sessionLabel,
    cycleProgress,
  } = useTimer({
    onSessionComplete: (sessionType: SessionType, taskName?: string) => {
      console.log(
        `Session completed: ${sessionType}`,
        taskName ? `Task: ${taskName}` : ""
      );
      // Here you could show a notification or play a sound
    },
    onTimerTick: (timeRemaining: number) => {
      // Update document title with remaining time
      if (typeof document !== "undefined") {
        document.title = `${Math.floor(timeRemaining / 60)
          .toString()
          .padStart(2, "0")}:${(timeRemaining % 60)
          .toString()
          .padStart(2, "0")} - Pomotune`;
      }
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (isIdle) {
            startTimer();
          } else if (isRunning) {
            pauseTimer();
          } else if (isPaused) {
            resumeTimer();
          }
          break;
        case "KeyR":
          event.preventDefault();
          resetTimer();
          break;
        case "KeyS":
          event.preventDefault();
          skipSession();
          break;
        case "Escape":
          event.preventDefault();
          if (!isIdle) {
            stopTimer();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isIdle,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    stopTimer,
  ]);

  // Reset document title on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.title = "Pomotune";
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Pomotune</h1>

            {/* Session Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">Sessions:</span>{" "}
                {sessionsCompleted}
              </div>
              <div>
                <span className="text-gray-500">Cycle:</span> {cycleProgress}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Timer Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Break notification */}
          {isBreak && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3" />
                <span className="text-green-400 font-medium">
                  Session completed! Time for a{" "}
                  {sessionType === "longBreak" ? "long" : "short"} break.
                </span>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="flex justify-center mb-8">
            <TimerDisplay
              time={formatTime}
              sessionType={sessionType}
              sessionLabel={sessionLabel}
              cycleProgress={cycleProgress}
              progress={progress}
              isRunning={isRunning}
              currentTask={currentTask}
            />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center">
            <TimerControls
              isRunning={isRunning}
              isPaused={isPaused}
              isIdle={isIdle}
              onStart={() => startTimer()}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
              onReset={resetTimer}
              onSkip={skipSession}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Focus better with the Pomodoro Technique</p>
            <p className="mt-1">
              Press Space to start/pause • R to reset • S to skip
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
