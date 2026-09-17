"use client";

import { useEffect, useState } from "react";
import { ntpClient } from "@/lib/sync";

/**
 * Singularity Hackathon kickoff: October 8, 2026 at 9:00 AM IST (UTC+05:30)
 *
 * Target is defined as a fixed ISO string with the IST offset so it is
 * timezone-agnostic — no matter where the server or browser runs, the
 * parsed epoch milliseconds are always the same absolute moment in time.
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
 * Compute countdown using server-corrected "now".
 *
 * ntpClient.isSynced is true once the one-time NTP round-trip has finished.
 * getServerTime() returns Date.now() + offset, where offset corrects the
 * client clock to match the backend clock.  Before sync completes we still
 * fall back to Date.now() so the display is never blank.
 */
export function computeEventCountdown(targetMs: number = EVENT_TARGET_TIMESTAMP): CountdownTime {
  const now = ntpClient.isSynced ? ntpClient.getServerTime() : Date.now();
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

// Whether the one-time NTP sync has been kicked off already
let ntpSyncStarted = false;

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
    // Align to the next wall-clock second boundary to prevent sub-second drift
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
    // Kick off a one-time NTP sync (shared across all hook instances).
    // Once it resolves the next tick() call will automatically use the
    // corrected server time, so the displayed value self-corrects within
    // at most ~1 second of the page loading.
    if (!ntpSyncStarted) {
      ntpSyncStarted = true;
      ntpClient.sync(3).then(() => {
        // Force an immediate re-tick so the corrected value appears right
        // away rather than waiting for the next scheduled tick.
        tick();
      }).catch(() => {
        // NTP failed — continue with client clock (graceful degradation)
      });
    }

    // Immediately show the latest computed value on mount
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
