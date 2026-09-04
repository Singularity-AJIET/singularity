"use client";

import { useEffect, useState } from "react";

/**
 * Singularity Hackathon kickoff: October 8, 2026 at 9:00 AM IST (UTC+05:30)
 */
export const EVENT_TARGET_TIMESTAMP = new Date("2026-10-08T09:00:00+05:30").getTime();

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
}

export function computeEventCountdown(targetMs: number = EVENT_TARGET_TIMESTAMP): CountdownTime {
  const diff = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const days = Math.floor(totalSeconds / 86400);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isComplete: diff <= 0,
  };
}

// Global subscribers set to guarantee all timer instances (Hero, Footer, etc.) update in exact lockstep
type Listener = (time: CountdownTime) => void;
const listeners = new Set<Listener>();
let globalTimerId: ReturnType<typeof setTimeout> | null = null;
let currentTime: CountdownTime = computeEventCountdown();

function tick() {
  currentTime = computeEventCountdown();
  listeners.forEach((listener) => {
    try {
      listener(currentTime);
    } catch {
      // Ignore listener error if unmounted
    }
  });

  if (!currentTime.isComplete && listeners.size > 0) {
    // Synchronize to the start of the next system second to prevent drift and phase offset
    const delay = 1000 - (Date.now() % 1000);
    globalTimerId = setTimeout(tick, delay);
  } else {
    globalTimerId = null;
  }
}

function startGlobalTimerIfNeeded() {
  if (globalTimerId === null && listeners.size > 0) {
    const delay = 1000 - (Date.now() % 1000);
    globalTimerId = setTimeout(tick, delay);
  }
}

function stopGlobalTimerIfIdle() {
  if (listeners.size === 0 && globalTimerId !== null) {
    clearTimeout(globalTimerId);
    globalTimerId = null;
  }
}

export function useEventCountdown() {
  const [time, setTime] = useState<CountdownTime>(() => computeEventCountdown());

  useEffect(() => {
    // Immediately synchronize to the latest calculated time on mount
    const latest = computeEventCountdown();
    setTime(latest);

    const listener: Listener = (updatedTime) => {
      setTime(updatedTime);
    };

    listeners.add(listener);
    startGlobalTimerIfNeeded();

    return () => {
      listeners.delete(listener);
      stopGlobalTimerIfIdle();
    };
  }, []);

  return time;
}
