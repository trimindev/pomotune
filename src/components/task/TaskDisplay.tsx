// src/components/task/TaskDisplay.tsx

import React from "react";
import { SessionType } from "@/lib/types";
import { Clock, Coffee } from "lucide-react";

interface TaskDisplayProps {
  taskName: string | null;
  sessionType: SessionType;
  isRunning: boolean;
  timeRemaining?: string;
  showIcon?: boolean;
  variant?: "default" | "compact" | "minimal";
}

export const TaskDisplay: React.FC<TaskDisplayProps> = ({
  taskName,
  sessionType,
  isRunning,
  timeRemaining,
  showIcon = true,
  variant = "default",
}) => {
  // Get session-specific styling and content
  const getSessionInfo = () => {
    switch (sessionType) {
      case "focus":
        return {
          icon: Clock,
          label: "Focusing on",
          emptyMessage: "Ready to focus",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
        };
      case "shortBreak":
        return {
          icon: Coffee,
          label: "Taking a break from",
          emptyMessage: "Short break time",
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
        };
      case "longBreak":
        return {
          icon: Coffee,
          label: "Long break from",
          emptyMessage: "Long break time",
          color: "text-purple-400",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/30",
        };
      default:
        return {
          icon: Clock,
          label: "Working on",
          emptyMessage: "Ready to start",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
        };
    }
  };

  const sessionInfo = getSessionInfo();
  const Icon = sessionInfo.icon;

  // Render different variants
  if (variant === "minimal") {
    return taskName ? (
      <div className="text-center">
        <p className="text-sm text-gray-400 truncate max-w-xs">{taskName}</p>
      </div>
    ) : null;
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
        {showIcon && <Icon className={`w-4 h-4 ${sessionInfo.color}`} />}
        <div className="text-center min-w-0 flex-1">
          {taskName ? (
            <p className="text-sm text-gray-200 truncate">{taskName}</p>
          ) : (
            <p className="text-sm text-gray-500">{sessionInfo.emptyMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          relative rounded-lg border transition-all duration-300
          ${taskName ? sessionInfo.bgColor : "bg-gray-800/30"}
          ${taskName ? sessionInfo.borderColor : "border-gray-700/50"}
          ${isRunning && taskName ? "shadow-lg" : ""}
        `}
      >
        <div className="p-4">
          {/* Header with icon and label */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            {showIcon && (
              <Icon
                className={`w-4 h-4 ${
                  taskName ? sessionInfo.color : "text-gray-500"
                }`}
              />
            )}
            <span
              className={`text-xs font-medium uppercase tracking-wider ${
                taskName ? sessionInfo.color : "text-gray-500"
              }`}
            >
              {taskName ? sessionInfo.label : sessionInfo.emptyMessage}
            </span>
          </div>

          {/* Task name or empty state */}
          <div className="text-center min-h-[1.5rem] flex items-center justify-center">
            {taskName ? (
              <p className="text-lg font-medium text-gray-100 break-words leading-tight">
                {taskName}
              </p>
            ) : (
              <p className="text-gray-500 text-sm italic">No task specified</p>
            )}
          </div>

          {/* Optional time display */}
          {timeRemaining && taskName && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-400">
                {timeRemaining} remaining
              </span>
            </div>
          )}
        </div>

        {/* Running indicator */}
        {isRunning && taskName && (
          <div className="absolute -top-1 -right-1">
            <div
              className={`w-3 h-3 rounded-full ${sessionInfo.color.replace(
                "text-",
                "bg-"
              )} animate-pulse`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
