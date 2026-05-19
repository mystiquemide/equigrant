"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  variant: "success" | "danger" | "warning" | "info" | "neutral";
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ variant, children, size = "sm", className = "" }: BadgeProps) {
  const map: Record<string, string> = {
    success: "badge-success",
    danger: "badge-danger",
    warning: "badge-warning",
    info: "badge-info",
    neutral: "badge-neutral",
  };

  return (
    <span className={`${map[variant]} ${size === "md" ? "px-3 py-1 text-sm" : ""} ${className}`}>
      {children}
    </span>
  );
}
