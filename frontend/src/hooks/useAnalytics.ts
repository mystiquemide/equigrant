"use client";

import { useCallback } from "react";

interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
}

export function useAnalytics() {
  const track = useCallback(
    (name: string, properties: Record<string, string | number | boolean> = {}) => {
      const event: AnalyticsEvent = {
        name,
        properties,
        timestamp: new Date().toISOString(),
      };

      // Log to console for development
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics]", event);
      }

      // In production, send to analytics service
      // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
    },
    []
  );

  return { track };
}
