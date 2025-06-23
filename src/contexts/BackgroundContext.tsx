// src/contexts/BackgroundContext.tsx

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import type { BackgroundMedia, BackgroundSettings } from "../lib/types";

interface BackgroundState {
  currentBackground: BackgroundMedia | null;
  youtubeEmbedUrl: string | null;
  backgroundType: "image" | "youtube" | "default";
  isLoading: boolean;
  error: string | null;
  previewBackground: BackgroundMedia | null;
  previewYoutubeUrl: string | null;
  isPreviewMode: boolean;
}

type BackgroundAction =
  | { type: "SET_IMAGE_BACKGROUND"; payload: BackgroundMedia }
  | { type: "SET_YOUTUBE_BACKGROUND"; payload: string }
  | { type: "CLEAR_BACKGROUND" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "START_PREVIEW";
      payload: { background?: BackgroundMedia; youtubeUrl?: string };
    }
  | { type: "END_PREVIEW" }
  | { type: "APPLY_PREVIEW" };

const initialState: BackgroundState = {
  currentBackground: null,
  youtubeEmbedUrl: null,
  backgroundType: "default",
  isLoading: false,
  error: null,
  previewBackground: null,
  previewYoutubeUrl: null,
  isPreviewMode: false,
};

function backgroundReducer(
  state: BackgroundState,
  action: BackgroundAction
): BackgroundState {
  switch (action.type) {
    case "SET_IMAGE_BACKGROUND":
      return {
        ...state,
        currentBackground: action.payload,
        youtubeEmbedUrl: null,
        backgroundType: "image",
        error: null,
        isLoading: false,
      };

    case "SET_YOUTUBE_BACKGROUND":
      return {
        ...state,
        currentBackground: null,
        youtubeEmbedUrl: action.payload,
        backgroundType: "youtube",
        error: null,
        isLoading: false,
      };

    case "CLEAR_BACKGROUND":
      return {
        ...state,
        currentBackground: null,
        youtubeEmbedUrl: null,
        backgroundType: "default",
        error: null,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "START_PREVIEW":
      return {
        ...state,
        previewBackground: action.payload.background || null,
        previewYoutubeUrl: action.payload.youtubeUrl || null,
        isPreviewMode: true,
      };

    case "END_PREVIEW":
      return {
        ...state,
        previewBackground: null,
        previewYoutubeUrl: null,
        isPreviewMode: false,
      };

    case "APPLY_PREVIEW":
      const newState = { ...state, isPreviewMode: false };

      if (state.previewBackground) {
        newState.currentBackground = state.previewBackground;
        newState.youtubeEmbedUrl = null;
        newState.backgroundType = "image";
      } else if (state.previewYoutubeUrl) {
        newState.currentBackground = null;
        newState.youtubeEmbedUrl = state.previewYoutubeUrl;
        newState.backgroundType = "youtube";
      }

      newState.previewBackground = null;
      newState.previewYoutubeUrl = null;

      return newState;

    default:
      return state;
  }
}

interface BackgroundContextValue extends BackgroundState {
  setImageBackground: (background: BackgroundMedia) => void;
  setYoutubeBackground: (embedUrl: string) => void;
  clearBackground: () => void;
  startPreview: (background?: BackgroundMedia, youtubeUrl?: string) => void;
  endPreview: () => void;
  applyPreview: () => void;
  getActiveBackground: () => BackgroundMedia | null;
  getActiveYoutubeUrl: () => string | null;
  saveSettings: () => void;
  loadSettings: (settings: BackgroundSettings) => void;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

interface BackgroundProviderProps {
  children: ReactNode;
  initialSettings?: BackgroundSettings;
}

export function BackgroundProvider({
  children,
  initialSettings,
}: BackgroundProviderProps) {
  const [state, dispatch] = useReducer(backgroundReducer, initialState);

  // Load initial settings
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.customYouTubeEmbedUrl) {
        dispatch({
          type: "SET_YOUTUBE_BACKGROUND",
          payload: initialSettings.customYouTubeEmbedUrl,
        });
      } else if (initialSettings.selectedBackgroundId) {
        // You would need to fetch the background by ID here
        // For now, we'll just set loading state
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [initialSettings]);

  // Set image background
  const setImageBackground = (background: BackgroundMedia) => {
    dispatch({ type: "SET_LOADING", payload: true });

    // Preload image to check if it's valid
    const img = new Image();
    img.onload = () => {
      dispatch({ type: "SET_IMAGE_BACKGROUND", payload: background });
    };
    img.onerror = () => {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load background image",
      });
    };
    img.src = background.src;
  };

  // Set YouTube background
  const setYoutubeBackground = (embedUrl: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    // Basic validation - you might want to validate the URL format
    if (embedUrl.includes("youtube.com/embed/")) {
      dispatch({ type: "SET_YOUTUBE_BACKGROUND", payload: embedUrl });
    } else {
      dispatch({ type: "SET_ERROR", payload: "Invalid YouTube embed URL" });
    }
  };

  // Clear background
  const clearBackground = () => {
    dispatch({ type: "CLEAR_BACKGROUND" });
  };

  // Start preview mode
  const startPreview = (background?: BackgroundMedia, youtubeUrl?: string) => {
    dispatch({ type: "START_PREVIEW", payload: { background, youtubeUrl } });
  };

  // End preview mode
  const endPreview = () => {
    dispatch({ type: "END_PREVIEW" });
  };

  // Apply preview as current background
  const applyPreview = () => {
    dispatch({ type: "APPLY_PREVIEW" });
  };

  // Get active background (considering preview mode)
  const getActiveBackground = (): BackgroundMedia | null => {
    if (state.isPreviewMode && state.previewBackground) {
      return state.previewBackground;
    }
    return state.currentBackground;
  };

  // Get active YouTube URL (considering preview mode)
  const getActiveYoutubeUrl = (): string | null => {
    if (state.isPreviewMode && state.previewYoutubeUrl) {
      return state.previewYoutubeUrl;
    }
    return state.youtubeEmbedUrl;
  };

  // Save current settings to localStorage
  const saveSettings = () => {
    try {
      const settings: BackgroundSettings = {
        selectedBackgroundId: state.currentBackground?.id || null,
        customYouTubeEmbedUrl: state.youtubeEmbedUrl,
      };

      localStorage.setItem("backgroundSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save background settings:", error);
    }
  };

  // Load settings from provided object
  const loadSettings = (settings: BackgroundSettings) => {
    if (settings.customYouTubeEmbedUrl) {
      setYoutubeBackground(settings.customYouTubeEmbedUrl);
    } else if (settings.selectedBackgroundId) {
      // You would need to fetch the background by ID and then set it
      // For now, we'll just clear the current background
      clearBackground();
    } else {
      clearBackground();
    }
  };

  // Auto-save settings when background changes
  useEffect(() => {
    if (state.currentBackground || state.youtubeEmbedUrl) {
      saveSettings();
    }
  }, [state.currentBackground, state.youtubeEmbedUrl]);

  const contextValue: BackgroundContextValue = {
    ...state,
    setImageBackground,
    setYoutubeBackground,
    clearBackground,
    startPreview,
    endPreview,
    applyPreview,
    getActiveBackground,
    getActiveYoutubeUrl,
    saveSettings,
    loadSettings,
  };

  return (
    <BackgroundContext.Provider value={contextValue}>
      {children}
    </BackgroundContext.Provider>
  );
}

// Custom hook to use the background context
export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}

// Higher-order component to provide background context
export function withBackground<P extends object>(
  Component: React.ComponentType<P>
) {
  return function BackgroundWrappedComponent(props: P) {
    const background = useBackground();
    return <Component {...props} background={background} />;
  };
}
