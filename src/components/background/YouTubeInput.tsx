// src/components/background/YouTubeInput.tsx

"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { YouTubeValidationResult } from "../../lib/types";

interface YouTubeInputProps {
  currentUrl: string | null;
  onUrlChange: (embedUrl: string | null) => void;
  onPreview?: (embedUrl: string | null) => void;
}

export function YouTubeInput({
  currentUrl,
  onUrlChange,
  onPreview,
}: YouTubeInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [validationResult, setValidationResult] =
    useState<YouTubeValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Popular YouTube ambient videos for suggestions
  const popularAmbientVideos = [
    {
      title: "Lofi Hip Hop - Beats to Study/Relax",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      embedUrl:
        "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1&playlist=jfKfPfyJRdk&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1",
    },
    {
      title: "Rain Sounds for Sleeping",
      url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
      embedUrl:
        "https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1&mute=1&loop=1&playlist=mPZkdNFkNps&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1",
    },
    {
      title: "Cozy Coffee Shop Ambience",
      url: "https://www.youtube.com/watch?v=DeumyOzKqgI",
      embedUrl:
        "https://www.youtube.com/embed/DeumyOzKqgI?autoplay=1&mute=1&loop=1&playlist=DeumyOzKqgI&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1",
    },
    {
      title: "Forest Sounds - Nature White Noise",
      url: "https://www.youtube.com/watch?v=xNN7iTA57jM",
      embedUrl:
        "https://www.youtube.com/embed/xNN7iTA57jM?autoplay=1&mute=1&loop=1&playlist=xNN7iTA57jM&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1",
    },
  ];

  // Initialize input value from current URL
  useEffect(() => {
    if (currentUrl && !inputValue) {
      // Try to reverse-engineer the original URL from embed URL
      const videoId = extractVideoIdFromEmbed(currentUrl);
      if (videoId) {
        setInputValue(`https://www.youtube.com/watch?v=${videoId}`);
      }
    }
  }, [currentUrl, inputValue]);

  // Validate YouTube URL and convert to embed format
  const validateYouTubeUrl = (url: string): YouTubeValidationResult => {
    if (!url.trim()) {
      return { isValid: false, error: "Please enter a YouTube URL" };
    }

    try {
      const videoId = extractVideoId(url);

      if (!videoId) {
        return {
          isValid: false,
          error: "Invalid YouTube URL. Please use a valid YouTube video URL.",
        };
      }

      // Create embed URL with optimal parameters for background use
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

      return {
        isValid: true,
        embedUrl,
      };
    } catch (error) {
      console.error("YouTube URL parsing error:", error);
      return {
        isValid: false,
        error: "Invalid URL format",
      };
    }
  };

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Extract video ID from embed URL
  const extractVideoIdFromEmbed = (embedUrl: string): string | null => {
    const match = embedUrl.match(/embed\/([^?&]+)/);
    return match ? match[1] : null;
  };

  // Handle input change with debounced validation
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!value.trim()) {
      setValidationResult(null);
      setPreviewUrl(null);
      return;
    }

    setIsValidating(true);

    // Debounce validation
    const timeoutId = setTimeout(() => {
      const result = validateYouTubeUrl(value);
      setValidationResult(result);
      setPreviewUrl(result.isValid ? result.embedUrl! : null);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle URL application
  const handleApplyUrl = () => {
    if (validationResult?.isValid && validationResult.embedUrl) {
      onUrlChange(validationResult.embedUrl);
    }
  };

  // Handle URL clearing
  const handleClearUrl = () => {
    setInputValue("");
    setValidationResult(null);
    setPreviewUrl(null);
    onUrlChange(null);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (
    suggestion: (typeof popularAmbientVideos)[0]
  ) => {
    setInputValue(suggestion.url);
    setValidationResult({
      isValid: true,
      embedUrl: suggestion.embedUrl,
    });
    setPreviewUrl(suggestion.embedUrl);
  };

  // Handle preview
  const handlePreview = () => {
    if (previewUrl) {
      onPreview?.(previewUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          YouTube Video URL
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`
                ${validationResult?.isValid === false ? "border-red-500" : ""}
                ${validationResult?.isValid === true ? "border-green-500" : ""}
              `}
            />
          </div>
          <Button
            onClick={handleApplyUrl}
            disabled={!validationResult?.isValid}
            className="shrink-0"
          >
            Apply
          </Button>
        </div>

        {/* Validation Status */}
        {isValidating && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Validating URL...
          </div>
        )}

        {validationResult && !isValidating && (
          <div
            className={`text-sm ${
              validationResult.isValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {validationResult.isValid ? (
              <div className="flex items-center gap-2">
                <span>✓ Valid YouTube URL</span>
                {previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="text-xs"
                  >
                    Preview
                  </Button>
                )}
              </div>
            ) : (
              <span>❌ {validationResult.error}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentUrl && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearUrl}
            className="text-red-600 hover:text-red-700"
          >
            Clear Background
          </Button>
        </div>
      )}

      {/* Popular Suggestions */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">
          Popular Ambient Videos
        </div>
        <div className="grid gap-2">
          {popularAmbientVideos.map((video, index) => (
            <Card
              key={index}
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSuggestionSelect(video)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">YT</span>
                  </div>
                  <span className="text-sm font-medium">{video.title}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Use This
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
