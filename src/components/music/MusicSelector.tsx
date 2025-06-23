// src/components/music/MusicSelector.tsx

"use client";

import React, { useState } from "react";
import { Play, Pause, Music, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MUSIC_TRACKS,
  CATEGORY_LABELS,
  formatDuration,
} from "@/data/music-tracks";
import type { MusicTrack, MusicCategory } from "@/lib/types";

interface MusicSelectorProps {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  onTrackSelect: (track: MusicTrack) => void;
  onPlayPause: () => void;
  className?: string;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  currentTrack,
  isPlaying,
  isLoading,
  onTrackSelect,
  onPlayPause,
  className = "",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter tracks based on selected category
  const filteredTracks =
    selectedCategory === "all"
      ? MUSIC_TRACKS
      : MUSIC_TRACKS.filter((track) => track.category === selectedCategory);

  // Get unique categories
  const categories = Object.keys(CATEGORY_LABELS) as MusicCategory[];

  return (
    <Card className={`p-4 bg-gray-800 border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Background Music</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Current Track Display */}
      {currentTrack && (
        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentTrack.artist} • {formatDuration(currentTrack.duration)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            disabled={isLoading}
            className="ml-2 text-white hover:text-blue-400"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="all" className="text-white">
                  All Categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white"
                  >
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Track List */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Track ({filteredTracks.length} available)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-900 rounded-lg p-2">
              {filteredTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => onTrackSelect(track)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    currentTrack?.id === track.id
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          currentTrack?.id === track.id
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          currentTrack?.id === track.id
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        {track.artist} • {formatDuration(track.duration)}
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        currentTrack?.id === track.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {CATEGORY_LABELS[track.category]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("nature")}
              className="flex-1 text-xs border-gray-600 text-gray-300 hover:text-white"
            >
              Nature
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("lofi")}
              className="flex-1 text-xs border-gray-600 text-gray-300 hover:text-white"
            >
              Lo-Fi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("whitenoise")}
              className="flex-1 text-xs border-gray-600 text-gray-300 hover:text-white"
            >
              White Noise
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!currentTrack && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Select background music to enhance your focus session
        </p>
      )}
    </Card>
  );
};
