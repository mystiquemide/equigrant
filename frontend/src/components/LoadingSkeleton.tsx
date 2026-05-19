"use client";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "circle" | "rect";
  width?: string;
  height?: string;
  count?: number;
}

export function LoadingSkeleton({
  variant = "rect",
  width = "100%",
  height = "1rem",
  count = 1,
}: LoadingSkeletonProps) {
  const className = `animate-pulse bg-bg-tertiary rounded-md`;

  const Element = ({ w, h }: { w: string; h: string }) => (
    <div className={className} style={{ width: w, height: h }} />
  );

  if (variant === "card") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card">
            <Element w="30%" h="1rem" />
            <Element w="100%" h="3rem" />
            <Element w="50%" h="0.75rem" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return <div className={`${className} rounded-full`} style={{ width, height: height || width }} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Element key={i} w={width} h={height} />
      ))}
    </div>
  );
}
