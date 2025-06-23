// src/components/background/ImageSelector.tsx

"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import type { BackgroundMedia, BackgroundCategory } from "../../lib/types";
import {
  BACKGROUND_IMAGES,
  BACKGROUND_CATEGORIES,
  getBackgroundsByCategory,
  getRandomBackground,
  getThumbnailUrl,
} from "../../data/background-images";

interface ImageSelectorProps {
  selectedBackgroundId: string | null;
  onBackgroundSelect: (background: BackgroundMedia) => void;
  onPreview?: (background: BackgroundMedia | null) => void;
}

export function ImageSelector({
  selectedBackgroundId,
  onBackgroundSelect,
  onPreview,
}: ImageSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    BackgroundCategory | "all"
  >("all");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Get filtered backgrounds based on selected category
  const filteredBackgrounds =
    selectedCategory === "all"
      ? BACKGROUND_IMAGES
      : getBackgroundsByCategory(selectedCategory);

  // Handle image loading states
  const handleImageLoad = (imageId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const handleImageError = (imageId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  const handleImageLoadStart = (imageId: string) => {
    setLoadingImages((prev) => new Set(prev).add(imageId));
  };

  // Handle random selection
  const handleRandomSelect = () => {
    const randomBg = getRandomBackground(
      selectedCategory === "all" ? undefined : selectedCategory
    );
    onBackgroundSelect(randomBg);
  };

  // Handle image selection
  const handleImageSelect = (background: BackgroundMedia) => {
    onBackgroundSelect(background);
  };

  // Handle image hover for preview
  const handleImageHover = (background: BackgroundMedia | null) => {
    setHoveredImage(background?.id || null);
    onPreview?.(background);
  };

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className="text-xs"
        >
          All Backgrounds
        </Button>
        {Object.entries(BACKGROUND_CATEGORIES).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key as BackgroundCategory)}
            className="text-xs"
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Random Selection Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRandomSelect}
          variant="outline"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
        >
          🎲 Random Background
        </Button>
      </div>

      {/* Background Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBackgrounds.map((background) => {
          const isSelected = selectedBackgroundId === background.id;
          const isLoading = loadingImages.has(background.id);
          const hasFailed = failedImages.has(background.id);
          const isHovered = hoveredImage === background.id;

          return (
            <Card
              key={background.id}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-200 
                aspect-video group hover:scale-105 hover:shadow-lg
                ${
                  isSelected
                    ? "ring-2 ring-blue-500 shadow-lg scale-105"
                    : "hover:ring-1 hover:ring-gray-300"
                }
                ${isHovered ? "z-10" : ""}
              `}
              onClick={() => handleImageSelect(background)}
              onMouseEnter={() => handleImageHover(background)}
              onMouseLeave={() => handleImageHover(null)}
            >
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error State */}
              {hasFailed && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500 text-xs">
                    <div className="text-lg mb-1">❌</div>
                    Failed to load
                  </div>
                </div>
              )}

              {/* Background Image */}
              {!hasFailed && (
                <img
                  src={getThumbnailUrl(background.src, 400)}
                  alt={background.title}
                  className={`
                    w-full h-full object-cover transition-opacity duration-200
                    ${isLoading ? "opacity-0" : "opacity-100"}
                  `}
                  onLoad={() => handleImageLoad(background.id)}
                  onError={() => handleImageError(background.id)}
                  onLoadStart={() => handleImageLoadStart(background.id)}
                />
              )}

              {/* Overlay */}
              <div
                className={`
                absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 flex items-end
              `}
              >
                <div className="p-3 text-white text-sm font-medium truncate w-full bg-gradient-to-t from-black/60 to-transparent">
                  {background.title}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {BACKGROUND_CATEGORIES[background.category].icon}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBackgrounds.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🖼️</div>
          <p>No backgrounds found in this category.</p>
        </div>
      )}

      {/* Category Description */}
      {selectedCategory !== "all" && (
        <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>{BACKGROUND_CATEGORIES[selectedCategory].label}:</strong>{" "}
          {BACKGROUND_CATEGORIES[selectedCategory].description}
        </div>
      )}
    </div>
  );
}
