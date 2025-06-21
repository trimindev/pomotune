// src/components/timer/TimerDisplay.tsx

import React from "react";
import { SessionType } from "@/lib/types";

interface TimerDisplayProps {
  time: string; // Formatted time string (MM:SS)
  sessionType: SessionType;
  sessionLabel: string; // Human readable session label
  cycleProgress: string; // e.g., "1/4", "2/4"
  progress: number; // Progress percentage (0-100)
  isRunning: boolean;
  currentTask?: string | null;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  sessionType,
  sessionLabel,
  cycleProgress,
  progress,
  isRunning,
  currentTask,
}) => {
  // Get colors based on session type
  const getSessionColors = () => {
    switch (sessionType) {
      case "focus":
        return {
          accent: "text-blue-400",
          bg: "bg-blue-500/10",
          progress: "bg-blue-500",
        };
      case "shortBreak":
        return {
          accent: "text-green-400",
          bg: "bg-green-500/10",
          progress: "bg-green-500",
        };
      case "longBreak":
        return {
          accent: "text-purple-400",
          bg: "bg-purple-500/10",
          progress: "bg-purple-500",
        };
      default:
        return {
          accent: "text-blue-400",
          bg: "bg-blue-500/10",
          progress: "bg-blue-500",
        };
    }
  };

  const colors = getSessionColors();

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* Session Type and Cycle Progress */}
      <div className="flex items-center justify-between w-full max-w-md">
        <div
          className={`px-4 py-2 rounded-full ${colors.bg} ${colors.accent} font-medium`}
        >
          {sessionLabel}
        </div>
        <div className="text-gray-400 font-medium">Cycle {cycleProgress}</div>
      </div>

      {/* Current Task Display */}
      {currentTask && (
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-500 mb-1">Working on</p>
          <p className="text-lg text-gray-200 font-medium truncate">
            {currentTask}
          </p>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="relative">
        {/* Progress Ring */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className={`${colors.progress} transition-all duration-1000 ease-linear`}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl md:text-7xl font-mono font-bold text-white mb-2">
              {time}
            </div>

            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              {isRunning && (
                <>
                  <div
                    className={`w-2 h-2 rounded-full ${colors.progress} animate-pulse`}
                  />
                  <span className="text-sm text-gray-400">Running</span>
                </>
              )}
              {!isRunning && (
                <span className="text-sm text-gray-500">Paused</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
