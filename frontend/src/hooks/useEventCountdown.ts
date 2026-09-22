"use client";

import { useEffect, useState } from "react";
import { ntpClient } from "@/lib/sync";

/**
 * Singularity Hackathon kickoff: October 8, 2026 at 9:00 AM IST (UTC+05:30)
 *
 * Target is defined as a fixed ISO string with the IST offset so it is
 * timezone-agnostic — no matter where the server or browser runs, the
 * parsed epoch milliseconds are always the same absolute moment in time:
 * 1791430200000 ms (2026-10-08T03:30:00.000Z).
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

/**
 * Compute countdown using server-corrected monotonic "now".
 *
 * ntpClient.getServerTime() is synchronized to the authoritative server clock
 * and advances via performance.now() monotonically. It is completely independent
 * of the user's local device clock, timezone, or manual time alterations.
 */
export function computeEventCountdown(targetMs: number = EVENT_TARGET_TIMESTAMP): CountdownTime {
  const now = ntpClient.getServerTime();
  const diff = Math.max(0, targetMs - now);
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

// Module-level subscriber set so Hero + Footer tick in perfect lockstep
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
      // Ignore errors from unmounted components
    }
  });

  if (!currentTime.isComplete && listeners.size > 0) {
    const now = ntpClient.getServerTime();
    const delay = Math.max(20, 1000 - (now % 1000));
    globalTimerId = setTimeout(tick, delay);
  } else {
    globalTimerId = null;
  }
}

function startGlobalTimerIfNeeded() {
  if (globalTimerId === null && listeners.size > 0) {
    const now = ntpClient.getServerTime();
    const delay = Math.max(20, 1000 - (now % 1000));
    globalTimerId = setTimeout(tick, delay);
  }
}

function stopGlobalTimerIfIdle() {
  if (listeners.size === 0 && globalTimerId !== null) {
    clearTimeout(globalTimerId);
    globalTimerId = null;
  }
}

// Force immediate re-tick whenever server clock sync completes
if (typeof window !== "undefined") {
  ntpClient.onSync(() => {
    tick();
  });
}

export function useEventCountdown() {
  const [time, setTime] = useState<CountdownTime>(() => computeEventCountdown());

  useEffect(() => {
    // Ensure NTP sync is performed as soon as component mounts
    if (!ntpClient.isSynced) {
      ntpClient.sync().then(() => {
        tick();
      }).catch(() => {});
    }

    // Immediately update on mount
    setTime(computeEventCountdown());

    const listener: Listener = (updatedTime) => setTime(updatedTime);
    listeners.add(listener);
    startGlobalTimerIfNeeded();

    return () => {
      listeners.delete(listener);
      stopGlobalTimerIfIdle();
    };
  }, []);

  return time;
}
