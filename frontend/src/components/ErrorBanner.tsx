"use client";

interface ErrorBannerProps {
  title: string;
  message: string;
  variant?: "error" | "warning";
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({
  title,
  message,
  variant = "error",
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const bgClass =
    variant === "error"
      ? "border-accent-red bg-accent-red/5 text-accent-red"
      : "border-accent-amber bg-accent-amber/5 text-accent-amber";

  return (
    <div
      className={`border rounded-lg p-4 ${bgClass}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-sm mt-1 opacity-80">{message}</p>
        </div>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <button onClick={onRetry} className="text-sm underline hover:no-underline">
              Retry
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="text-sm opacity-60 hover:opacity-100">
              &#x2715;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
