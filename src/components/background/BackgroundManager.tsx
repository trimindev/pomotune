// src/components/background/BackgroundManager.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import type { BackgroundMedia } from "../../lib/types";

interface BackgroundManagerProps {
  imageBackground: BackgroundMedia | null;
  youtubeEmbedUrl: string | null;
  className?: string;
}

export function BackgroundManager({
  imageBackground,
  youtubeEmbedUrl,
  className = "",
}: BackgroundManagerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [youtubeError, setYoutubeError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine which background type to display
  const backgroundType = youtubeEmbedUrl
    ? "youtube"
    : imageBackground
    ? "image"
    : "default";

  // Handle image loading
  useEffect(() => {
    if (imageBackground && backgroundType === "image") {
      setImageLoaded(false);
      setImageError(false);
      setIsTransitioning(true);

      // Preload image
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setIsTransitioning(false);
      };
      img.onerror = () => {
        setImageError(true);
        setIsTransitioning(false);
      };
      img.src = imageBackground.src;
    }
  }, [imageBackground, backgroundType]);

  // Handle YouTube iframe load
  useEffect(() => {
    if (youtubeEmbedUrl && backgroundType === "youtube") {
      setYoutubeError(false);
      setIsTransitioning(true);

      // Reset iframe error state
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [youtubeEmbedUrl, backgroundType]);

  // Handle iframe load error
  const handleIframeError = () => {
    setYoutubeError(true);
    setIsTransitioning(false);
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    setYoutubeError(false);
    setIsTransitioning(false);
  };

  // Default gradient background
  const defaultBackground = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden ${className}`}
      style={{ zIndex: -10 }}
    >
      {/* YouTube Background */}
      {backgroundType === "youtube" && youtubeEmbedUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            className={`
              absolute inset-0 w-full h-full object-cover border-0
              transition-opacity duration-500
              ${isTransitioning || youtubeError ? "opacity-0" : "opacity-100"}
            `}
            style={{
              width: "100vw",
              height: "56.25vw", // 16:9 aspect ratio
              minHeight: "100vh",
              minWidth: "177.77vh", // 16:9 aspect ratio
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
              pointerEvents: "none",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Background Video"
          />

          {/* YouTube Loading State */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm opacity-75">
                  Loading video background...
                </p>
              </div>
            </div>
          )}

          {/* YouTube Error State */}
          {youtubeError && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: defaultBackground }}
            >
              <div className="text-white text-center bg-black/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="text-sm">Failed to load video background</p>
                <p className="text-xs opacity-75 mt-1">
                  Using default background instead
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Background */}
      {backgroundType === "image" && imageBackground && (
        <>
          <div
            className={`
              absolute inset-0 bg-cover bg-center bg-no-repeat
              transition-opacity duration-500
              ${imageLoaded && !imageError ? "opacity-100" : "opacity-0"}
            `}
            style={{
              backgroundImage: `url(${imageBackground.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Image Loading State */}
          {(isTransitioning || (!imageLoaded && !imageError)) && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: defaultBackground }}
            >
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm opacity-75">Loading background...</p>
              </div>
            </div>
          )}

          {/* Image Error State */}
          {imageError && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: defaultBackground }}
            >
              <div className="text-white text-center bg-black/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-2xl mb-2">🖼️</div>
                <p className="text-sm">Failed to load background image</p>
                <p className="text-xs opacity-75 mt-1">
                  Using default background instead
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Default Background */}
      {backgroundType === "default" && (
        <div
          className="absolute inset-0"
          style={{ background: defaultBackground }}
        />
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
