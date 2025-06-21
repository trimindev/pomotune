// src/components/timer/TimerControls.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward, Square } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  isIdle,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onSkip,
  disabled = false,
}) => {
  // Main play/pause button logic
  const handlePlayPause = () => {
    if (isIdle) {
      onStart();
    } else if (isRunning) {
      onPause();
    } else if (isPaused) {
      onResume();
    }
  };

  // Get play/pause button icon and text
  const getPlayPauseButton = () => {
    if (isIdle) {
      return {
        icon: Play,
        text: "Start",
        variant: "default" as const,
      };
    } else if (isRunning) {
      return {
        icon: Pause,
        text: "Pause",
        variant: "secondary" as const,
      };
    } else {
      return {
        icon: Play,
        text: "Resume",
        variant: "default" as const,
      };
    }
  };

  const playPauseButton = getPlayPauseButton();
  const PlayPauseIcon = playPauseButton.icon;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Play/Pause Button */}
      <Button
        onClick={handlePlayPause}
        disabled={disabled}
        variant={playPauseButton.variant}
        size="lg"
        className="w-24 h-24 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <div className="flex flex-col items-center">
          <PlayPauseIcon className="w-8 h-8 mb-1" />
          <span className="text-xs">{playPauseButton.text}</span>
        </div>
      </Button>

      {/* Secondary Controls */}
      <div className="flex items-center space-x-4">
        {/* Stop Button - Only show when timer is running or paused */}
        {!isIdle && (
          <Button
            onClick={onStop}
            disabled={disabled}
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
            title="Stop Timer"
          >
            <Square className="w-5 h-5" />
          </Button>
        )}

        {/* Reset Button */}
        <Button
          onClick={onReset}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400 transition-all duration-200"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        {/* Skip Button */}
        <Button
          onClick={onSkip}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-200"
          title="Skip Session"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Control Labels */}
      <div className="flex items-center justify-center space-x-8 text-xs text-gray-500">
        {!isIdle && <span>Stop</span>}
        <span>Reset</span>
        <span>Skip</span>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-gray-600 mt-4">
        <p>Keyboard shortcuts:</p>
        <div className="flex items-center justify-center space-x-4 mt-1">
          <span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Space</kbd>{" "}
            Play/Pause
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">R</kbd> Reset
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">S</kbd> Skip
          </span>
        </div>
      </div>
    </div>
  );
};
