"use client";

import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  helperText,
  showCharCount = false,
  maxLength,
  className = "",
  ...props
}: TextareaProps) {
  const value = (props.value as string) || "";
  const charCount = value.length;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        className={`input-field min-h-[100px] resize-y ${error ? "border-border-error focus:border-border-error focus:ring-accent-red/20" : ""} ${className}`}
        {...props}
      />
      <div className="flex justify-between">
        {error && (
          <p className="text-xs text-accent-red" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
        {showCharCount && maxLength && (
          <p
            className={`text-xs ml-auto ${charCount > maxLength * 0.9 ? "text-accent-amber" : "text-text-muted"}`}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
