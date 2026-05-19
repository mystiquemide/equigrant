"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownTimerProps {
  deadline: string;
  size?: "sm" | "md";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function CountdownTimer({ deadline, size = "sm" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [deadline]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  if (timeLeft.expired) {
    return (
      <span className={`badge-neutral font-mono ${size === "sm" ? "text-xs" : "text-sm"}`}>
        Closed
      </span>
    );
  }

  const critical = timeLeft.days === 0 && timeLeft.hours < 1;
  const warning = timeLeft.days === 0 && timeLeft.hours < 24;

  const textClass = critical
    ? "text-accent-red animate-pulse"
    : warning
    ? "text-accent-amber"
    : "text-text-secondary";

  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`font-mono ${fontSize} ${textClass}`}>
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
      {`${timeLeft.minutes}m ${timeLeft.seconds}s`}
    </span>
  );
}
