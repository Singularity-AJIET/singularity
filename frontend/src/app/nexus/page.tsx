"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl, getAdminRole } from "@/lib/api";

interface CounterSession {
  id: string;
  name: string;
  is_open: boolean;
  opened_at: string | null;
  closed_at: string | null;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  is_reported: boolean;
  team_id: number | null;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    router.push("/nexus/login");
  };
  const [counters, setCounters] = useState<CounterSession[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmSessionId, setConfirmSessionId] = useState<string | null>(null);
  const [confirmSessionName, setConfirmSessionName] = useState("");

  // Authenticate and fetch initial data
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const profile = localStorage.getItem("admin_profile");

    if (!token || !profile) {
      router.push("/nexus/login");
      return;
    }

    const parsedProfile = JSON.parse(profile);
    // Volunteers are not allowed on the Console page
    if (parsedProfile.role === 'volunteer') {
      router.push("/nexus/scanner");
      return;
    }

    setAdmin(parsedProfile);
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    setError("");

    try {
      const API_BASE = getApiBaseUrl();
      // Fetch Counters
      const countersRes = await fetch(`${API_BASE}/api/counters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (countersRes.status === 401) return handleLogout();
      if (!countersRes.ok) throw new Error("Failed to load counter sessions.");
      const countersData = await countersRes.json();
      setCounters(countersData);

      // Fetch Participants
      const partsRes = await fetch(`${API_BASE}/api/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (partsRes.status === 401) return handleLogout();
      if (!partsRes.ok) throw new Error("Failed to load participants.");
      const partsData = await partsRes.json();
      setParticipants(partsData);

      // Fetch Staff
      const staffRes = await fetch(`${API_BASE}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (staffRes.status === 401) return handleLogout();
      if (!staffRes.ok) throw new Error("Failed to load staff.");
      const staffData = await staffRes.json();
      setStaff(staffData);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCounter = (sessionId: string) => {
    const session = counters.find(c => c.id === sessionId);
    if (!session) return;

    // Both locking and unlocking require confirmation modal
    setConfirmSessionId(sessionId);
    setConfirmSessionName(session.name);
    setShowConfirmModal(true);
  };

  const executeToggleCounter = async (sessionId: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setActionLoading(sessionId);
    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/counters/${sessionId}/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        throw new Error("Failed to update counter session door.");
      }

      // Fetch updated list of all counters to reflect any that were closed in the process
      const countersRes = await fetch(`${API_BASE}/api/counters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (countersRes.ok) {
        const countersData = await countersRes.json();
        setCounters(countersData);
      } else {
        const updatedSession = await response.json();
        setCounters(prev => 
          prev.map(c => c.id === sessionId ? updatedSession : c)
        );
      }
    } catch (err: any) {
      alert(err.message || "Could not toggle counter door.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmOpen = () => {
    if (confirmSessionId) {
      executeToggleCounter(confirmSessionId);
    }
    setShowConfirmModal(false);
    setConfirmSessionId(null);
  };



  if (isLoading && !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A18] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-400">Loading terminal interface...</span>
        </div>
      </div>
    );
  }

  // Calculate Statistics
  const totalParticipants = participants.length;
  const reportedCount = participants.filter(p => p.is_reported).length;
  const reportedPercentage = totalParticipants > 0 ? Math.round((reportedCount / totalParticipants) * 100) : 0;

  const totalStaff = staff.length;
  const reportedStaffCount = staff.filter(s => s.is_reported).length;
  const reportedStaffPercentage = totalStaff > 0 ? Math.round((reportedStaffCount / totalStaff) * 100) : 0;

  const isTargetSessionOpen = counters.find(c => c.id === confirmSessionId)?.is_open || false;

  return (
    <div className="relative overflow-hidden flex-1 w-full bg-[#050A18] text-white font-sans">
      {/* Decorative ambient neon background glows */}
      <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-yellow-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-yellow-400/5 blur-[120px]" />



      {/* Main Dashboard Layout */}
      <main className="mx-auto max-w-7xl p-6 sm:p-8 space-y-8">
        
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-pulse">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold">Fetch Error</p>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => fetchDashboardData(localStorage.getItem("admin_token") || "")}
              className="ml-auto rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 text-white cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Top Cards Statistics Row */}
        <section className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          {/* Participant Check-In Progress card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md shadow-lg transition-all hover:border-yellow-400/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Participants Check-In</h3>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {reportedCount} <span className="text-sm font-semibold text-slate-500">/ {totalParticipants} reported</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]">{reportedPercentage}%</span>
              </div>
            </div>
            
            {/* Custom Meter */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
              <div 
                className="bg-yellow-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_#facc15]"
                style={{ width: `${reportedPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-500 mt-3">
              Automatically updates when participant passes are scanned.
            </p>
          </div>

          {/* Event Staff Check-In Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md shadow-lg transition-all hover:border-yellow-400/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Staff Check-In</h3>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {reportedStaffCount} <span className="text-sm font-semibold text-slate-500">/ {totalStaff} reported</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]">{reportedStaffPercentage}%</span>
              </div>
            </div>
            
            {/* Custom Meter */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
              <div 
                className="bg-yellow-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_#facc15]"
                style={{ width: `${reportedStaffPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-500 mt-3">
              Applies to HODs, Faculty, and Volunteers checked-in.
            </p>
          </div>

          {/* Quick Stats Panel */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md shadow-lg transition-all hover:border-yellow-400/10 md:col-span-2 lg:col-span-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r border-slate-900 pr-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered Teams</h4>
                <p className="text-2xl font-bold mt-1 text-slate-200">
                  {isLoading ? "..." : Array.from(new Set(participants.map(p => p.team_id).filter(id => id !== null))).length}
                </p>
              </div>
              <div className="pl-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Counter</h4>
                <p className={`text-base font-extrabold mt-1.5 truncate ${counters.find(c => c.is_open) ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.2)]' : 'text-slate-500'}`}>
                  {isLoading ? "..." : counters.find(c => c.is_open)?.name || "None"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Counter Controllers Dashboard Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-lg font-bold text-slate-200">Session Counter Switches</h3>
            <span className="text-xs text-slate-500">Enable switches to unlock verification claims at kiosks</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && counters.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[180px] rounded-2xl bg-slate-900/40 border border-slate-900 animate-pulse" />
              ))
            ) : (
              counters.map((session) => (
                <div 
                  key={session.id}
                  className={`relative overflow-hidden rounded-2xl border bg-slate-950/40 p-6 shadow-md transition-all duration-300 ${
                    session.is_open 
                      ? "border-yellow-400/30 hover:border-yellow-400/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.05)]" 
                      : "border-slate-900 hover:border-slate-800/80"
                  }`}
                >
                  {/* Glowing vertical neon bar if counter is open */}
                  {session.is_open && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-yellow-400 shadow-[0_0_8px_#facc15]" />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{session.id}</span>
                      <h4 className="text-lg font-bold text-white mt-0.5">{session.name}</h4>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      session.is_open 
                        ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" 
                        : "bg-slate-900 text-slate-500 border border-slate-800/50"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${session.is_open ? "bg-yellow-400 animate-pulse" : "bg-slate-600"}`} />
                      {session.is_open ? "ACTIVE" : "LOCKED"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs text-slate-500">
                      Opened: <span className="font-semibold text-slate-400">{session.opened_at ? new Date(session.opened_at).toLocaleTimeString() : "N/A"}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Closed: <span className="font-semibold text-slate-400">{session.closed_at ? new Date(session.closed_at).toLocaleTimeString() : "N/A"}</span>
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleCounter(session.id)}
                    disabled={actionLoading !== null}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] border cursor-pointer ${
                      session.is_open
                        ? "bg-transparent text-yellow-400 border-yellow-400/30 hover:border-yellow-400/60 hover:bg-yellow-400/5"
                        : "bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                    } disabled:opacity-50`}
                  >
                    {actionLoading === session.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`h-3 w-3 animate-spin rounded-full border-2 border-t-transparent ${session.is_open ? 'border-yellow-400' : 'border-black'}`} />
                        <span>Updating...</span>
                      </div>
                    ) : session.is_open ? (
                      "Lock Counter Door"
                    ) : (
                      "Unlock Counter Door"
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isTargetSessionOpen ? "Lock Counter Door?" : "Unlock Counter Door?"}
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {isTargetSessionOpen ? (
                <>Are you sure you want to lock and close <span className="font-bold text-yellow-400">"{confirmSessionName}"</span>? Scanners will no longer be able to verify claims for this counter.</>
              ) : (
                <>Do you want to close any other active counter sessions and open <span className="font-bold text-yellow-400">"{confirmSessionName}"</span>?</>
              )}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmSessionId(null);
                }}
                className="rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOpen}
                className="rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 px-5 py-2 text-xs font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-95 cursor-pointer"
              >
                {isTargetSessionOpen ? "Lock Door" : "Unlock Door"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
