// src/components/task/TaskInput.tsx

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showClearButton?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "What are you working on? (optional)",
  disabled = false,
  showClearButton = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Handle clear button
  const handleClear = () => {
    onChange("");
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pr-10 py-3 text-center text-lg
              bg-gray-800/50 border-gray-600 text-white placeholder-gray-400
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              transition-all duration-200
              ${isFocused ? "bg-gray-800/80" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            maxLength={100}
          />

          {/* Clear Button */}
          {showClearButton && value && !disabled && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Clear task"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Character count indicator */}
        {(isFocused || value.length > 80) && (
          <div className="mt-2 text-right">
            <span
              className={`text-xs ${
                value.length > 90
                  ? "text-red-400"
                  : value.length > 80
                  ? "text-yellow-400"
                  : "text-gray-500"
              }`}
            >
              {value.length}/100
            </span>
          </div>
        )}

        {/* Helper text */}
        {isFocused && !value && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd>{" "}
              to clear
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
