"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/nexus");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      // Store credentials and trigger success state
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_profile", JSON.stringify(data.admin)); // includes role
      setIsSuccess(true);

      // Redirect based on role: volunteers go straight to scanner
      const role = data.admin?.role || 'admin';
      setTimeout(() => {
        router.push(role === 'volunteer' ? "/nexus/scanner" : "/nexus");
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050A18] px-4 font-sans">
      {/* Decorative ambient neon yellow glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/10 blur-[120px] md:h-[500px] md:w-[500px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px] md:h-[500px] md:w-[500px]" />

      {/* Cyberpunk grid backdrop overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #facc15 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)] mb-4">
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Singularity<span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"> &apos;26</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Event food claim control terminal
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="overflow-hidden rounded-2xl bg-slate-900/50 p-8 backdrop-blur-xl border border-slate-800/80 shadow-2xl transition-all duration-300 hover:border-yellow-400/30">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Administrator Login</h2>
            <p className="text-xs text-slate-400 mt-1">Authorized personnel access only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isLoading || isSuccess}
                  className="w-full rounded-lg bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-600 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading || isSuccess}
                className="w-full rounded-lg bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-600 border border-slate-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 animate-pulse">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`relative w-full overflow-hidden rounded-lg py-3 text-sm font-bold tracking-wider uppercase transition-all duration-200 active:scale-[0.98] ${
                isSuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Verifying...</span>
                </div>
              ) : isSuccess ? (
                <div className="flex items-center justify-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access Granted</span>
                </div>
              ) : (
                "Initiate Connection"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Singularity API Console v1.1.0 &copy; 2026.
        </p>
      </div>
    </div>
  );
}
