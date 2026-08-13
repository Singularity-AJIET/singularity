"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl, getAdminRole } from "@/lib/api";

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_reported: boolean;
  reported_at: string | null;
  team_id: number | null;
  team_name: string | null;
  team_number: string | null;
  college: string | null;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [staff, setStaff] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // In-page view toggle: 'participants' | 'staff'
  const [activeView, setActiveView] = useState<"participants" | "staff">("participants");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [teamNameFilter, setTeamNameFilter] = useState("");
  const [teamNumberFilter, setTeamNumberFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unconfirmed' | 'confirmed'

  // Async Action State
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Authenticate Admin and Fetch Data
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const profile = localStorage.getItem("admin_profile");

    if (!token || !profile) {
      router.push("/nexus/login");
      return;
    }

    const parsedProfile = JSON.parse(profile);
    setAdmin(parsedProfile);
    fetchRosters(token);
  }, [router]);

  // Toast Auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchRosters = async (token: string) => {
    setIsLoading(true);
    setError("");

    try {
      const API_BASE = getApiBaseUrl();
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
      if (!staffRes.ok) throw new Error("Failed to load staff list.");
      const staffData = await staffRes.json();
      setStaff(staffData);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading lists.");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform Check-In Action
  const handleConfirmCheckin = async (id: string, name: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setActionLoading(id);
    setToast(null);

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/participants/${id}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Check-in request failed.");
      }

      setToast({
        message: `Successfully checked in ${name} and emailed access pass!`,
        type: "success"
      });

      // Refresh rosters to sync local state
      await fetchRosters(token);
    } catch (err: any) {
      setToast({
        message: err.message || `Failed to check in ${name}.`,
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkCheckinStaff = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setActionLoading("bulk-staff");
    setToast(null);

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/checkin/bulk-staff`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Bulk check-in request failed.");
      }

      setToast({
        message: data.message || `Successfully bulk generated and emailed passes!`,
        type: "success"
      });

      // Refresh rosters to sync local state
      await fetchRosters(token);
    } catch (err: any) {
      setToast({
        message: err.message || `Failed to perform bulk check-in.`,
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    router.push("/nexus/login");
  };

  // Filter Logic - Client Side
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTeamName =
      !teamNameFilter ||
      (p.team_name && p.team_name.toLowerCase().includes(teamNameFilter.toLowerCase()));

    const matchesTeamNumber =
      !teamNumberFilter ||
      (p.team_number && p.team_number.toLowerCase().includes(teamNumberFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && p.is_reported) ||
      (statusFilter === "unconfirmed" && !p.is_reported);

    return matchesSearch && matchesTeamName && matchesTeamNumber && matchesStatus;
  });

  // Sort: Group by Team Number naturally (e.g. T-01, T-02), then by Name
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    const numA = a.team_number || "";
    const numB = b.team_number || "";

    if (numA && !numB) return -1;
    if (!numA && numB) return 1;
    if (numA !== numB) {
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: "base" });
    }
    return a.name.localeCompare(b.name);
  });

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || s.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && s.is_reported) ||
      (statusFilter === "unconfirmed" && !s.is_reported);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name));

  if (!admin) return null;

  return (
    <div className="relative overflow-hidden flex-1 w-full bg-[#050A18] text-white font-sans">
      {/* Glow effects */}
      <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />



      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
        
        {/* Floating Toast Notification Banner */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-2xl max-w-md animate-fade-in ${
            toast.type === "success" 
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 backdrop-blur-md" 
              : "bg-red-950/80 border-red-500/30 text-red-400 backdrop-blur-md"
          }`}>
            {toast.type === "success" ? (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header Intro with Underlined Tabs on the Right */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-900 pb-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Check-In & Registration desk</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Confirm check-in for participants or staff, automatically signing and emailing their cryptographic entry pass.
            </p>
          </div>

          {/* Underlined Text Tabs on the Right */}
          <div className="flex gap-6 border-b border-transparent shrink-0">
            <button
              onClick={() => {
                setActiveView("participants");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className={`pb-2 text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                activeView === "participants"
                  ? "border-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Participants ({participants.length})
            </button>
            <button
              onClick={() => {
                setActiveView("staff");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className={`pb-2 text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
                activeView === "staff"
                  ? "border-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Volunteers & Staff ({staff.length})
            </button>
          </div>
        </div>

        {/* Loader Screen */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
              <span className="text-xs sm:text-sm font-semibold">Loading records from Turso...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs sm:text-sm text-red-400">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Dynamic Filter Layout */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/30 p-4 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Filters</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
                
                {/* Search bar */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search Name / Email</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check-in Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">All statuses</option>
                    <option value="unconfirmed" className="bg-slate-900 text-white">Unconfirmed</option>
                    <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                  </select>
                </div>

                {/* Participants View Specific Filters */}
                {activeView === "participants" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Team Name</label>
                      <input
                        type="text"
                        value={teamNameFilter}
                        onChange={(e) => setTeamNameFilter(e.target.value)}
                        placeholder="Filter team name..."
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Team Number</label>
                      <input
                        type="text"
                        value={teamNumberFilter}
                        onChange={(e) => setTeamNumberFilter(e.target.value)}
                        placeholder="Filter team no..."
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  </>
                )}

                {/* Volunteers & Staff View Specific Filters */}
                {activeView === "staff" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Type</label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900 text-white">All Roles</option>
                        <option value="hod" className="bg-slate-900 text-white">HODs</option>
                        <option value="faculty" className="bg-slate-900 text-white">Faculty</option>
                        <option value="volunteer" className="bg-slate-900 text-white">Volunteers</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleBulkCheckinStaff}
                        disabled={actionLoading === "bulk-staff"}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 text-xs font-bold uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-400/20 h-[38px]"
                      >
                        {actionLoading === "bulk-staff" ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">Bulk Send Pending QR Passes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* View Panels */}
            {activeView === "participants" ? (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">Team Details</th>
                        <th className="p-4">College</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {sortedParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                            No matching participants found.
                          </td>
                        </tr>
                      ) : (
                        sortedParticipants.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/20 transition-all">
                            <td className="p-4">
                              <p className="font-bold text-white text-sm">{p.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{p.id}</p>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <p className="text-slate-300">{p.email}</p>
                              <p className="text-slate-500">{p.phone || "No Phone"}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-200">{p.team_name || "N/A"}</p>
                              {p.team_number && (
                                <span className="inline-block rounded bg-yellow-400/5 px-1 py-0.5 text-xs font-semibold text-yellow-400/80 border border-yellow-400/10 mt-1 uppercase">
                                  No: {p.team_number}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400">{p.college || "N/A"}</td>
                            <td className="p-4 text-left">
                              {p.is_reported ? (
                                <span className="rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/20 uppercase tracking-wide">
                                  Confirmed
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-800 uppercase tracking-wide">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleConfirmCheckin(p.id, p.name)}
                                disabled={actionLoading !== null}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 ${
                                  p.is_reported
                                    ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                                }`}
                              >
                                {actionLoading === p.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className={`h-3 w-3 animate-spin rounded-full border-2 border-t-transparent ${p.is_reported ? 'border-slate-400' : 'border-black'}`} />
                                    <span>Sending...</span>
                                  </div>
                                ) : p.is_reported ? (
                                  "Resend Pass"
                                ) : (
                                  "Confirm & Email"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden space-y-3">
                  {sortedParticipants.length === 0 ? (
                    <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-8 text-center text-slate-500 font-semibold">
                      No matching participants found.
                    </div>
                  ) : (
                    sortedParticipants.map((p) => (
                      <div key={p.id} className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{p.name}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{p.id.substring(0, 8)}...</p>
                          </div>
                          {p.is_reported ? (
                            <span className="rounded bg-yellow-400/10 px-2 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/20 uppercase">
                              Confirmed
                            </span>
                          ) : (
                            <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-500 border border-slate-800 uppercase">
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-slate-900/60">
                          <p className="truncate"><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Email</span> {p.email}</p>
                          <p><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Phone</span> {p.phone || "N/A"}</p>
                          <p className="truncate"><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Team</span> {p.team_name || "N/A"}</p>
                          <p><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Team No</span> {p.team_number || "N/A"}</p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-900/40">
                          <button
                            onClick={() => handleConfirmCheckin(p.id, p.name)}
                            disabled={actionLoading !== null}
                            className={`w-full rounded-lg py-2 text-center text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 ${
                              p.is_reported
                                ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                : "bg-yellow-400 text-black hover:bg-yellow-300"
                            }`}
                          >
                            {actionLoading === p.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className={`h-3 w-3 animate-spin rounded-full border-2 border-t-transparent ${p.is_reported ? 'border-slate-400' : 'border-black'}`} />
                                <span>Sending...</span>
                              </div>
                            ) : p.is_reported ? (
                              "Resend Pass"
                            ) : (
                              "Confirm & Email Pass"
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {sortedStaff.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                            No matching staff members found.
                          </td>
                        </tr>
                      ) : (
                        sortedStaff.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-900/20 transition-all">
                            <td className="p-4">
                              <p className="font-bold text-white text-sm">{s.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{s.id}</p>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <p className="text-slate-300">{s.email}</p>
                              <p className="text-slate-500">{s.phone || "No Phone"}</p>
                            </td>
                            <td className="p-4">
                              <span className="rounded bg-yellow-400/5 px-2 py-1 text-xs font-bold text-yellow-400/90 border border-yellow-400/10 uppercase tracking-wider">
                                {s.role}
                              </span>
                            </td>
                            <td className="p-4 text-left">
                              {s.is_reported ? (
                                <span className="rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/20 uppercase tracking-wide">
                                  Confirmed
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-800 uppercase tracking-wide">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleConfirmCheckin(s.id, s.name)}
                                disabled={actionLoading !== null}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 ${
                                  s.is_reported
                                    ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                                }`}
                              >
                                {actionLoading === s.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className={`h-3 w-3 animate-spin rounded-full border-2 border-t-transparent ${s.is_reported ? 'border-slate-400' : 'border-black'}`} />
                                    <span>Sending...</span>
                                  </div>
                                ) : s.is_reported ? (
                                  "Resend Pass"
                                ) : (
                                  "Confirm & Email"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden space-y-3">
                  {sortedStaff.length === 0 ? (
                    <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-8 text-center text-slate-500 font-semibold">
                      No matching staff members found.
                    </div>
                  ) : (
                    sortedStaff.map((s) => (
                      <div key={s.id} className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{s.name}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{s.id.substring(0, 8)}...</p>
                          </div>
                          {s.is_reported ? (
                            <span className="rounded bg-yellow-400/10 px-2 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/20 uppercase">
                              Confirmed
                            </span>
                          ) : (
                            <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-500 border border-slate-800 uppercase">
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-slate-900/60">
                          <p className="truncate"><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Email</span> {s.email}</p>
                          <p><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">Phone</span> {s.phone || "N/A"}</p>
                          <p className="col-span-2"><span className="text-slate-550 block text-xs font-bold uppercase tracking-wide text-slate-500">System Role</span>
                            <span className="inline-block rounded bg-yellow-400/5 px-1.5 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/10 uppercase mt-0.5">
                              {s.role}
                            </span>
                          </p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-900/40">
                          <button
                            onClick={() => handleConfirmCheckin(s.id, s.name)}
                            disabled={actionLoading !== null}
                            className={`w-full rounded-lg py-2 text-center text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 ${
                              s.is_reported
                                ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                                : "bg-yellow-400 text-black hover:bg-yellow-300"
                            }`}
                          >
                            {actionLoading === s.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className={`h-3 w-3 animate-spin rounded-full border-2 border-t-transparent ${s.is_reported ? 'border-slate-400' : 'border-black'}`} />
                                <span>Sending...</span>
                              </div>
                            ) : s.is_reported ? (
                              "Resend Pass"
                            ) : (
                              "Confirm & Email Pass"
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
