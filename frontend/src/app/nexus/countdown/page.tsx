"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getApiBaseUrl,
  fetchCountdownState,
  toggleCountdownDisplay,
  triggerCountdownStart,
  removeCountdown,
  resetCountdownState,
  CountdownState
} from "@/lib/api";

export default function NexusCountdownPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [admin, setAdmin] = useState<{ role?: string } | null>(null);
  const [state, setState] = useState<CountdownState>({
    isDisplayed: false,
    isStarted: false,
    startedAt: null,
    updatedAt: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auth verification
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedProfile = localStorage.getItem("admin_profile");

    if (!savedToken || !savedProfile) {
      router.push("/nexus/login");
      return;
    }

    const parsedProfile = JSON.parse(savedProfile);
    if (parsedProfile.role === "volunteer") {
      router.push("/nexus/scanner");
      return;
    }

    setToken(savedToken);
    setAdmin(parsedProfile);
  }, [router]);

  // Fetch initial countdown state & setup real-time SSE stream
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const initial = await fetchCountdownState();
        if (isMounted) {
          setState(initial);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load initial countdown state:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitial();

    // Setup real-time SSE listener
    const API_BASE = getApiBaseUrl();
    const eventSource = new EventSource(`${API_BASE}/api/countdown/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (isMounted && data) {
          setState({
            isDisplayed: Boolean(data.isDisplayed),
            isStarted: Boolean(data.isStarted),
            startedAt: data.startedAt || null,
            updatedAt: data.updatedAt || new Date().toISOString()
          });
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    // Polling fallback every 4 seconds to guarantee sync
    const pollInterval = setInterval(async () => {
      try {
        const fresh = await fetchCountdownState();
        if (isMounted) setState(fresh);
      } catch {
        // Silently ignore transient network errors during poll
      }
    }, 4000);

    return () => {
      isMounted = false;
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDisplay = async () => {
    if (!token) return;
    setActionLoading("display");
    try {
      const res = await toggleCountdownDisplay(token);
      if (res.state) setState(res.state);
      showFeedback("success", "Countdown display enabled. Public site now rendering in idle state.");
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to enable display");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async () => {
    if (!token) return;
    if (!state.isDisplayed) {
      showFeedback("error", "Display must be enabled first before starting the countdown.");
      return;
    }
    setActionLoading("start");
    try {
      const res = await triggerCountdownStart(token);
      if (res.state) setState(res.state);
      showFeedback("success", "Countdown started! Public frontend running sequence 10 -> 1 in real time.");
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to start countdown");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async () => {
    if (!token) return;
    setActionLoading("remove");
    try {
      const res = await removeCountdown(token);
      if (res.state) setState(res.state);
      showFeedback("success", "Countdown removed. Public site returning to normal view.");
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to remove countdown");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    setActionLoading("reset");
    try {
      const res = await resetCountdownState(token);
      if (res.state) setState(res.state);
      showFeedback("success", "Countdown reset to static idle state (10). Ready to start again.");
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to reset countdown");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 sm:py-10 flex-1 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-yellow-400/10 px-2.5 py-1 text-xs font-bold text-yellow-400 border border-yellow-400/20 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
            CONTROL PROTOCOL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Launch Countdown Control
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Broadcast sequence triggers directly to the public website and event display screens.
          </p>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 transition-all duration-300 ${
            state.isStarted
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : state.isDisplayed
              ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
              : "bg-slate-900/60 border-slate-800 text-slate-400"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${
              state.isStarted
                ? "bg-emerald-400 animate-ping"
                : state.isDisplayed
                ? "bg-yellow-400 animate-pulse"
                : "bg-slate-600"
            }`} />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Status</span>
              <span className="text-xs font-black tracking-wide uppercase">
                {state.isStarted
                  ? "LIVE RUNNING"
                  : state.isDisplayed
                  ? "DISPLAYED // IDLE (10)"
                  : "OFFLINE // REMOVED"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              : "bg-red-950/40 text-red-300 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          }`}
        >
          <span className="text-base">{feedback.type === "success" ? "✓" : "⚠"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Control Console Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Ambient top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execution Controls
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow sequence: Click <strong className="text-yellow-400">Display</strong> first to attach the idle screen, then <strong className="text-emerald-400">Start</strong> to trigger the live countdown.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Last Synced: {new Date(state.updatedAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. DISPLAY BUTTON */}
          <button
            onClick={handleDisplay}
            disabled={actionLoading !== null || state.isDisplayed}
            className={`flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-200 cursor-pointer active:scale-98 ${
              state.isDisplayed
                ? "bg-yellow-400/15 border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-yellow-400/30"
                : "bg-slate-900/60 border-slate-800 text-white hover:border-yellow-400/50 hover:bg-slate-900"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">
              {actionLoading === "display" ? "Enabling..." : state.isDisplayed ? "Display Active" : "Display"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {state.isDisplayed ? "Attached on public site (Idle 10)" : "Attach component to frontend"}
            </span>
          </button>

          {/* 2. START BUTTON */}
          <button
            onClick={handleStart}
            disabled={actionLoading !== null || !state.isDisplayed || state.isStarted}
            className={`flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-200 cursor-pointer active:scale-98 ${
              state.isStarted
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50 animate-pulse"
                : state.isDisplayed
                ? "bg-yellow-400 text-black border-yellow-400 font-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
                : "bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${
              state.isDisplayed && !state.isStarted
                ? "bg-black/10 text-black"
                : "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">
              {actionLoading === "start" ? "Starting..." : state.isStarted ? "Running Live" : "Start"}
            </span>
            <span className={`text-[11px] mt-1 ${state.isDisplayed && !state.isStarted ? "text-black/80 font-medium" : "text-slate-400"}`}>
              {!state.isDisplayed
                ? "Requires Display ON first"
                : state.isStarted
                ? "10 to 1 sequence active"
                : "Begin real-time sequence"}
            </span>
          </button>

          {/* 3. REMOVE BUTTON */}
          <button
            onClick={handleRemove}
            disabled={actionLoading !== null || !state.isDisplayed}
            className={`flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-200 cursor-pointer active:scale-98 ${
              state.isDisplayed
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/60"
                : "bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-not-allowed"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-red-400/10 border border-red-400/20 text-red-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">
              {actionLoading === "remove" ? "Removing..." : "Remove"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Hide countdown completely
            </span>
          </button>

          {/* 4. RESET BUTTON */}
          <button
            onClick={handleReset}
            disabled={actionLoading !== null || !state.isStarted}
            className={`flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-200 cursor-pointer active:scale-98 ${
              state.isStarted
                ? "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                : "bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-not-allowed"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-slate-800 border border-slate-700 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">
              {actionLoading === "reset" ? "Resetting..." : "Reset"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Reset sequence back to 10
            </span>
          </button>
        </div>
      </div>

      {/* Information & Live Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instructions Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            Standard Operating Procedure
          </h4>
          <ol className="space-y-3 text-xs text-slate-400 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-white">Projector / Audience View</strong>: Open <code className="text-yellow-400 bg-yellow-400/10 px-1 py-0.5 rounded">/countdown</code> on stage screens.
            </li>
            <li>
              <strong className="text-white">Display</strong>: Click to place the screen in armed standby mode (renders static 10 with ambient noise).
            </li>
            <li>
              <strong className="text-white">Start</strong>: Click when the host signals. The countdown runs in real-time.
            </li>
            <li>
              <strong className="text-white">Automatic Transition</strong>: Once the countdown finishes, the public website continues automatically into the splash screen.
            </li>
            <li>
              <strong className="text-white">Remove</strong>: If not in launch mode, click Remove to leave the site operating normally.
            </li>
          </ol>
        </div>

        {/* Public Simulation Status */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Live Public State Preview
              </h4>
              <a
                href="/countdown"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-yellow-400 hover:text-yellow-300 underline font-semibold flex items-center gap-1"
              >
                Open /countdown in new tab ↗
              </a>
            </div>

            <div className="rounded-xl border border-slate-800 bg-black p-6 text-center flex flex-col items-center justify-center min-h-[160px]">
              {!state.isDisplayed ? (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">
                    [ PUBLIC FRONTEND // STANDBY ]
                  </span>
                  <p className="text-sm font-bold text-slate-400">
                    Countdown is Removed / Hidden
                  </p>
                  <p className="text-xs text-slate-600">
                    Visitors see normal site splash screen & content. No countdown animation active.
                  </p>
                </div>
              ) : !state.isStarted ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    SEQUENCE ARMED // IDLE
                  </div>
                  <div className="text-4xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                    10
                  </div>
                  <p className="text-xs font-mono text-yellow-400/80">
                    INITIALIZING LAUNCH SEQUENCE — WAITING FOR ADMIN START TRIGGER
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE RUNNING SEQUENCE
                  </div>
                  <div className="text-4xl font-mono font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">
                    10 → 1
                  </div>
                  <p className="text-xs font-mono text-emerald-400">
                    COUNTDOWN IN PROGRESS — AUTO-ADVANCES TO SPLASH SCREEN ON FINISH
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
            <span>Stage Route: <code className="text-slate-400 font-mono">/countdown</code></span>
            <span>Home Route: <code className="text-slate-400 font-mono">/</code></span>
          </div>
        </div>
      </div>
    </main>
  );
}
