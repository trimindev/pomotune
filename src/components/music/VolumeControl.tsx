// src/components/music/VolumeControl.tsx

"use client";

import React from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface VolumeControlProps {
  volume: number;
  isMuted?: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle?: () => void;
  className?: string;
  variant?: "default" | "compact";
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted = false,
  onVolumeChange,
  onMuteToggle,
  className = "",
  variant = "default",
}) => {
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    onVolumeChange(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4" />;
    } else if (volume < 50) {
      return <Volume1 className="w-4 h-4" />;
    } else {
      return <Volume2 className="w-4 h-4" />;
    }
  };

  const displayVolume = isMuted ? 0 : volume;

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {onMuteToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
            className="text-gray-400 hover:text-white p-1"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {getVolumeIcon()}
          </Button>
        )}
        <div className="flex items-center gap-2 min-w-[80px]">
          <Slider
            value={[displayVolume]}
            onValueChange={handleVolumeChange}
            max={100}
            min={0}
            step={1}
            className="flex-1"
            disabled={isMuted}
          />
          <span className="text-xs text-gray-400 min-w-[32px] text-right">
            {Math.round(displayVolume)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-3 bg-gray-800 border-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        {onMuteToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
            className="text-gray-400 hover:text-white"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {getVolumeIcon()}
          </Button>
        )}

        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-gray-400 min-w-[24px]">
            {Math.round(displayVolume)}%
          </span>

          <Slider
            value={[displayVolume]}
            onValueChange={handleVolumeChange}
            max={100}
            min={0}
            step={1}
            className="flex-1"
            disabled={isMuted}
          />

          <div className="flex gap-1">
            {/* Quick volume buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVolumeChange(25)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
              disabled={isMuted}
            >
              25%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVolumeChange(50)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
              disabled={isMuted}
            >
              50%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVolumeChange(75)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
              disabled={isMuted}
            >
              75%
            </Button>
          </div>
        </div>
      </div>

      {/* Volume indicator bar */}
      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
          style={{ width: `${displayVolume}%` }}
        />
      </div>
    </Card>
  );
};
