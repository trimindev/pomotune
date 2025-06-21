# Project Overview

**Product Name:** Pomotune
**Goal:** A minimalist, mobile-first Pomodoro timer app that tracks time and allows users to select ambient music from a predefined list and customize a fullscreen background (image/YouTube video)
**Target Users:**

- Remote workers seeking productivity enhancement
- Students practicing time-blocking and study sessions
- Writers, developers, or creatives using the Pomodoro technique
- Focus-oriented professionals who prefer ambient environments

# Core Features

## Feature 1: Pomodoro Timer

**User Story:** As a focused user, I want a simple Pomodoro timer so that I can manage my work sessions using the 25/5 minute technique.
**Requirements:**

- [ ] 25-minute focus timer with 5-minute breaks
- [ ] Long break (15-30 minutes) after 4 cycles
- [ ] Play/pause/stop functionality
- [ ] Visual countdown display
- [ ] Audio notifications for session transitions
- [ ] Customizable timer durations (15, 25, 45, 60 minutes)
      **Acceptance Criteria:**
- [ ] Timer counts down accurately from selected duration
- [ ] Clear visual indication of current session type (focus/break)
- [ ] Smooth transitions between sessions
- [ ] Notification sound plays at session end
- [ ] Timer can be paused and resumed
- [ ] Settings persist across app restarts

## Feature 2: Music Selection

**User Story:** As a user, I want to choose ambient music from a predefined list so that I can stay focused with a calming background atmosphere.
**Requirements:**

- [ ] Curated list of 10-15 ambient tracks
- [ ] Music categories: Nature sounds, Lo-fi, White noise, Instrumental
- [ ] Volume control slider
- [ ] Loop functionality for continuous playback
- [ ] Music continues during timer transitions
      **Acceptance Criteria:**
- [ ] Music plays continuously without interruption
- [ ] Volume adjustable from 0-100%
- [ ] Track selection persists across sessions
- [ ] Smooth audio transitions when switching tracks
- [ ] Music can be muted while timer continues

## Feature 3: YouTube Link Background

**User Story:** As a user, I want to input a YouTube video URL to use as an animated background so that I can create a personalized ambient environment.
**Requirements:**

- [ ] URL input field for YouTube links
- [ ] YouTube embed iframe as fullscreen background
- [ ] Fallback to default background if video fails
- [ ] Video auto-plays muted with loop parameters
- [ ] Convert YouTube URLs to embed format
- [ ] URL validation for YouTube links only
      **Acceptance Criteria:**
- [ ] Converts YouTube URLs to embed format (youtube.com/embed/)
- [ ] YouTube iframe loads and auto-plays when URL is converted
- [ ] YouTube embed plays muted with autoplay=1&mute=1 parameters
- [ ] Error handling for invalid YouTube URLs or embed failures
- [ ] YouTube handles video quality automatically

## Feature 4: Random Image Background

**User Story:** As a user, I want to select from curated background images so that I can have a visually pleasing static background.
**Requirements:**

- [ ] Collection of 20+ high-quality background images
- [ ] Categories: Nature, Abstract, Minimal, Workspace
- [ ] Random selection button
- [ ] Image preview thumbnails
- [ ] Responsive image sizing
      **Acceptance Criteria:**
- [ ] Images load quickly and display properly
- [ ] Random button cycles through different images
- [ ] Images maintain aspect ratio on all devices
- [ ] Smooth transitions between image changes
- [ ] Images optimized for mobile and desktop

## Feature 5: Optional Task Tracking

**User Story:** As a user, I want to optionally name my tasks so that I can track my productivity and see what I accomplished.
**Requirements:**

- [ ] Optional task name input field
- [ ] Current task display above timer
- [ ] Session history with task names and durations
- [ ] Ability to edit or delete task names
- [ ] Task completion statistics
      **Acceptance Criteria:**
- [ ] Timer works without entering task name
- [ ] Task name displays prominently during session
- [ ] Task history shows date, name, and duration
- [ ] Can start timer immediately without task input
- [ ] Task statistics show total focused time per task

# Tech Stack

## Frontend

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript with strict mode
- **Styling:** TailwindCSS + ShadCN UI components
- **State Management:** Context API + `useReducer` for complex state
- **Audio/Video:** HTML5 Audio/Video APIs
- **YouTube Integration:** YouTube iframe embed API
- **Storage:** LocalStorage for persistence
- **PWA:** Service Worker for offline capability

# Constraints

## Must Have

- Responsive design (mobile-first approach)
- Works without entering a task name
- LocalStorage support for persistence
- Offline functionality for core timer features
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Touch-friendly controls for mobile devices

## Must Not

- Require backend API for MVP
- Require authentication or accounts
- Include social sharing features in MVP
- Store user data externally

# UI/UX Guidelines

- **Design Style:** Minimal like Notion, distraction-free interface with breathing room
- **Color Scheme:** Dark them, like Notion
- **Typography:** Clean, readable fonts optimized for timer display
- **Components:** Custom components built on ShadCN UI foundation
- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Animations:** Subtle transitions and micro-interactions
- **Mobile Experience:** Thumb-friendly tap targets, swipe gestures

# Data Models

## TaskSession

```json
{
  "id": "string (uuid)",
  "name": "string | null",
  "focusedMinutes": "number",
  "sessionType": "focus" | "shortBreak" | "longBreak",
  "completed": "boolean",
  "createdAt": "timestamp",
  "completedAt": "timestamp | null"
}

```

## MusicTrack

```json
{
  "id": "string",
  "title": "string",
  "artist": "string",
  "src": "string (URL)",
  "category": "nature" | "lofi" | "whitenoise" | "instrumental",
  "duration": "number (seconds)",
  "type": "audio"
}

```

## BackgroundMedia

```json
{
  "id": "string",
  "title": "string",
  "src": "string (URL)",
  "type": "image" | "video",
  "category": "nature" | "abstract" | "minimal" | "workspace",
  "isCustom": "boolean"
}

```

## AppSettings

```json
{
  "timerSettings": {
    "focusDuration": "number (minutes)",
    "shortBreakDuration": "number (minutes)",
    "longBreakDuration": "number (minutes)",
    "sessionsUntilLongBreak": "number"
  },
  "audioSettings": {
    "selectedMusicId": "string | null",
    "volume": "number (0-100)",
    "notificationSounds": "boolean"
  },
  "backgroundSettings": {
    "selectedBackgroundId": "string | null",
    "customYouTubeEmbedUrl": "string | null"
  }
}
```

# User Flow

1. **App Launch**
   - Load saved settings and preferences
   - Display timer with default 25-minute focus session
   - Show optional task input field
2. **Session Setup**
   - User optionally enters task name
   - Selects background (image, YouTube video, or default)
   - Chooses ambient music track and adjusts volume
   - Customizes timer duration if needed
3. **Timer Execution**
   - User starts timer
   - Background media plays/displays
   - Timer counts down with clear visual feedback
   - Music plays continuously (if selected)
4. **Session Transition**
   - Audio notification at session end
   - Automatic transition to break timer
   - Break type determined by session count
   - User can extend or skip break
5. **Session Completion**
   - Session logged to history (if task named)
   - Statistics updated
   - Ready for next session

# Success Metrics

- [ ] **User Engagement:** 80% of users complete their first Pomodoro session
- [ ] **Retention:** 60% of users return within 7 days
- [ ] **Session Completion:** Average session completion rate above 75%
- [ ] **Feature Adoption:** 40% of users utilize background customization
- [ ] **Performance:** App loads in under 3 seconds on mobile
- [ ] **Accessibility:** Passes automated accessibility tests
- [ ] **Cross-platform:** Works consistently across iOS Safari, Android Chrome, and desktop browsers
