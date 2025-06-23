// src/components/background/YouTubeEmbed.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";

interface YouTubeEmbedProps {
  embedUrl: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
  controls?: boolean;
  muted?: boolean;
  autoplay?: boolean;
}

export function YouTubeEmbed({
  embedUrl,
  onError,
  onLoad,
  className = "",
  controls = false,
  muted = true,
  autoplay = true,
}: YouTubeEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const maxRetries = 3;

  // Build YouTube embed URL with proper parameters
  const buildEmbedUrl = useCallback(
    (baseUrl: string) => {
      try {
        const url = new URL(baseUrl);

        // Set parameters for background video use
        url.searchParams.set("autoplay", autoplay ? "1" : "0");
        url.searchParams.set("mute", muted ? "1" : "0");
        url.searchParams.set("controls", controls ? "1" : "0");
        url.searchParams.set("loop", "1");
        url.searchParams.set("showinfo", "0");
        url.searchParams.set("rel", "0");
        url.searchParams.set("iv_load_policy", "3");
        url.searchParams.set("modestbranding", "1");
        url.searchParams.set("playsinline", "1");
        url.searchParams.set("enablejsapi", "1");

        // Extract video ID for playlist parameter (required for looping)
        const videoId = url.pathname.split("/embed/")[1]?.split("?")[0];
        if (videoId) {
          url.searchParams.set("playlist", videoId);
        }

        return url.toString();
      } catch (error) {
        console.error("Invalid YouTube embed URL:", error);
        return baseUrl;
      }
    },
    [autoplay, muted, controls]
  );

  const finalEmbedUrl = buildEmbedUrl(embedUrl);

  // Handle iframe load success
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  // Handle iframe load error
  const handleError = useCallback(
    (errorMessage: string) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(errorMessage);
    },
    [onError]
  );

  // Retry loading the iframe
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      setHasError(false);
      setIsLoading(true);
      setRetryCount((prev) => prev + 1);

      // Force iframe reload by changing src
      if (iframeRef.current) {
        iframeRef.current.src = "";
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = finalEmbedUrl;
          }
          setIsRetrying(false);
        }, 500);
      }
    }
  }, [retryCount, maxRetries, finalEmbedUrl]);

  // Set up iframe error detection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        handleError("YouTube video load timeout");
      }
    }, 10000); // 10 second timeout

    const handleIframeLoad = () => {
      clearTimeout(loadTimeout);
      handleLoad();
    };

    const handleIframeError = () => {
      clearTimeout(loadTimeout);
      handleError("Failed to load YouTube video");
    };

    iframe.addEventListener("load", handleIframeLoad);
    iframe.addEventListener("error", handleIframeError);

    return () => {
      clearTimeout(loadTimeout);
      iframe.removeEventListener("load", handleIframeLoad);
      iframe.removeEventListener("error", handleIframeError);
    };
  }, [handleLoad, handleError, isLoading]);

  // Reset state when embedUrl changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [embedUrl]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* YouTube Iframe */}
      <iframe
        ref={iframeRef}
        src={finalEmbedUrl}
        className={`
          absolute inset-0 w-full h-full border-0
          transition-opacity duration-300
          ${isLoading || hasError ? "opacity-0" : "opacity-100"}
        `}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: controls ? "auto" : "none",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        title="YouTube Background Video"
      />

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              {isRetrying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-sm opacity-90">
              {isRetrying ? "Retrying..." : "Loading video..."}
            </p>
            {retryCount > 0 && (
              <p className="text-xs opacity-60 mt-1">
                Attempt {retryCount + 1} of {maxRetries + 1}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-gray-900/20 flex items-center justify-center">
          <div className="text-white text-center bg-black/40 backdrop-blur-sm rounded-lg p-6 max-w-sm mx-4">
            <div className="text-3xl mb-3">📺</div>
            <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
            <p className="text-sm opacity-90 mb-4">
              Unable to load the YouTube video. This might be due to:
            </p>
            <ul className="text-xs opacity-75 text-left mb-6 space-y-1">
              <li>• Video is private or restricted</li>
              <li>• Network connectivity issues</li>
              <li>• Video has been removed</li>
              <li>• Embedding is disabled for this video</li>
            </ul>

            {retryCount < maxRetries && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isRetrying}
              >
                {isRetrying ? "Retrying..." : "Try Again"}
              </Button>
            )}

            {retryCount >= maxRetries && (
              <p className="text-xs opacity-60">
                Max retries reached. Please try a different video.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// YouTube URL utilities
export const youTubeUtils = {
  // Extract video ID from various YouTube URL formats
  extractVideoId: (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/e\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  },

  // Validate YouTube URL
  isValidYouTubeUrl: (url: string): boolean => {
    return youTubeUtils.extractVideoId(url) !== null;
  },

  // Convert any YouTube URL to embed format
  toEmbedUrl: (
    url: string,
    params: Record<string, string> = {}
  ): string | null => {
    const videoId = youTubeUtils.extractVideoId(url);
    if (!videoId) return null;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

    // Set default parameters
    const defaultParams = {
      autoplay: "1",
      mute: "1",
      loop: "1",
      controls: "0",
      showinfo: "0",
      rel: "0",
      iv_load_policy: "3",
      modestbranding: "1",
      playsinline: "1",
      playlist: videoId, // Required for looping
    };

    // Merge with custom parameters
    const finalParams = { ...defaultParams, ...params };

    Object.entries(finalParams).forEach(([key, value]) => {
      embedUrl.searchParams.set(key, value);
    });

    return embedUrl.toString();
  },

  // Get video thumbnail URL
  getThumbnailUrl: (
    videoId: string,
    quality: "default" | "medium" | "high" | "standard" | "maxres" = "medium"
  ): string => {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  },
};
