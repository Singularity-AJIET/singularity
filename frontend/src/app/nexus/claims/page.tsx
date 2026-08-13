"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";

/* ─────────────────────────── Types ─────────────────────────── */
interface ClaimRecord {
  id: number;
  personId?: string;
  itemType: string;
  sessionName: string;
  claimedAt: string | null; // null if unclaimed
  isStaff: boolean;
  name: string;
  email: string | null;
  role: string;
  teamName: string | null;
  teamNumber: string | null;
  college: string | null;
}

interface CounterSession {
  id: string;
  name: string;
  isOpen: boolean;
}

/* ─────────────────────────── Helpers ──────────────────────────── */
function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}

const ROLE_COLORS: Record<string, string> = {
  hod: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  faculty: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  volunteer: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  staff: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};
function roleColor(role: string) {
  const key = role.toLowerCase().replace(/^staff \(/, "").replace(/\)$/, "");
  return ROLE_COLORS[key] || "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function ClaimsReportPage() {
  const router = useRouter();

  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [counters, setCounters] = useState<CounterSession[]>([]);
  const [allParticipants, setAllParticipants] = useState<Record<string, unknown>[]>([]);
  const [allStaff, setAllStaff] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // View toggle: participants | staff
  const [activeView, setActiveView] = useState<"participants" | "staff">("participants");

  // Active counter / session filter
  const [selectedItemType, setSelectedItemType] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "claimed" | "unclaimed"
  
  // Participants filters
  const [teamNameFilter, setTeamNameFilter] = useState("");
  const [teamNumberFilter, setTeamNumberFilter] = useState("");

  // Staff filters
  const [roleFilter, setRoleFilter] = useState("all"); // "all" | "hod" | "faculty" | "volunteer"

  /* ── Auth + Data Fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const profile = localStorage.getItem("admin_profile");
    if (!token || !profile) { router.push("/nexus/login"); return; }
    JSON.parse(profile); // Just validate it parses
    fetchData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError("");
    try {
      const API_BASE = getApiBaseUrl();
      const [claimsRes, countersRes, partsRes, staffRes] = await Promise.all([
        fetch(`${API_BASE}/api/claims/report`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/counters`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/participants`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/staff`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (claimsRes.status === 401 || countersRes.status === 401 || partsRes.status === 401 || staffRes.status === 401) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_profile");
        router.push("/nexus/login");
        return;
      }
      if (!claimsRes.ok) throw new Error("Failed to load claims.");
      setClaims(await claimsRes.json());
      if (countersRes.ok) {
        const cData = await countersRes.json();
        setCounters(cData);
        if (cData.length > 0) {
          setSelectedItemType(cData[0].id);
        }
      }
      if (partsRes.ok) setAllParticipants(await partsRes.json());
      if (staffRes.ok) setAllStaff(await staffRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };



  /* ── Derived data ── */
  const summaryByItemType = useMemo(() => {
    const map: Record<string, { sessionName: string; participants: number; staff: number }> = {};
    for (const c of claims) {
      if (!map[c.itemType]) map[c.itemType] = { sessionName: c.sessionName, participants: 0, staff: 0 };
      if (c.isStaff) map[c.itemType].staff++;
      else map[c.itemType].participants++;
    }
    return map;
  }, [claims]);



  const filteredClaims = useMemo(() => {
    if (!selectedItemType) return [];

    // Build a roster list showing claimed and unclaimed people for the selected session
    const roster = activeView === "participants" ? allParticipants : allStaff;
    const baseList: ClaimRecord[] = roster.map((person) => {
      // Find if they have a claim for this specific session
      const claimForSession = claims.find(c => c.personId === person.id && c.itemType === selectedItemType);
      
      return {
        id: claimForSession ? claimForSession.id : Math.random(), // fake id for unclaimed
        personId: person.id,
        itemType: selectedItemType,
        sessionName: counters.find(c => c.id === selectedItemType)?.name || selectedItemType,
        claimedAt: claimForSession ? claimForSession.claimedAt : null,
        isStaff: activeView === "staff",
        name: person.name,
        email: person.email,
        role: person.role,
        teamName: person.team_name || null,
        teamNumber: person.team_number || null,
        college: person.college || null,
      } as ClaimRecord;
    });

    return baseList.filter((c) => {
      // 1. View Filter
      if (activeView === "participants" && c.isStaff) return false;
      if (activeView === "staff" && !c.isStaff) return false;

      // 2. Status Filter
      if (statusFilter === "claimed" && !c.claimedAt) return false;
      if (statusFilter === "unclaimed" && c.claimedAt) return false;

      // 3. Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !(c.email?.toLowerCase().includes(q))) return false;
      }

      // 4. Team Filters (participants only)
      if (activeView === "participants") {
        if (teamNameFilter && !(c.teamName?.toLowerCase().includes(teamNameFilter.toLowerCase()))) return false;
        if (teamNumberFilter && !(String(c.teamNumber).toLowerCase().includes(teamNumberFilter.toLowerCase()))) return false;
      }

      // 5. Role Filter (staff only)
      if (activeView === "staff" && roleFilter !== "all") {
        const normalizedRole = c.role.toLowerCase().replace(/^staff \(/, "").replace(/\)$/, "");
        if (normalizedRole !== roleFilter) return false;
      }
      
      return true;
    });
  }, [claims, allParticipants, allStaff, counters, activeView, selectedItemType, searchQuery, teamNameFilter, teamNumberFilter, roleFilter, statusFilter]);

  // Group participants by team
  const grouped = useMemo(() => {
    if (activeView === "staff") return { "": filteredClaims };
    const groups: Record<string, ClaimRecord[]> = {};
    for (const c of filteredClaims) {
      const key = c.teamName ? `${c.teamName}${c.teamNumber ? ` — ${c.teamNumber}` : ""}` : "No Team";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [filteredClaims, activeView]);

  /* ──────────────── Render ──────────────── */
  return (
    <div className="relative overflow-hidden flex-1 w-full bg-[#050A18] text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Glow effects */}
      <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />



      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Claims Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Track food & item claims by counter session and team.</p>
        </div>

        {/* ── Summary Cards ── */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

          {/* Per session cards */}
          {counters.map((session) => {
            const stats = summaryByItemType[session.id];
            const total = (stats?.participants ?? 0) + (stats?.staff ?? 0);
            const isSelected = selectedItemType === session.id;
            return (
              <button
                key={session.id}
                onClick={() => setSelectedItemType(session.id)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-yellow-500/60 bg-yellow-950/30 ring-1 ring-yellow-500/30 shadow-lg shadow-yellow-900/20"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight max-w-[80%]">{session.name}</div>
                  <span className={`h-2 w-2 rounded-full shrink-0 mt-0.5 ${session.isOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                </div>
                <div className="text-3xl font-black text-white">{total}</div>
                <div className="mt-2 space-y-0.5 text-[11px] font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Participants</span>
                    <span className="text-blue-400 font-black">{stats?.participants ?? 0} / {allParticipants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staff</span>
                    <span className="text-teal-400 font-black">{stats?.staff ?? 0} / {allStaff.length}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Toggle Buttons ── */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/70 border border-slate-800 w-fit mb-6">
          <button
            onClick={() => { setActiveView("participants"); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeView === "participants" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            👥 Participants
          </button>
          <button
            onClick={() => { setActiveView("staff"); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeView === "staff" ? "bg-teal-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            🎓 Faculty & Volunteers
          </button>
        </div>

        {/* ── Filters Bar ── */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Name / Email</label>
              <svg className="absolute left-3 top-[32px] h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40 shrink-0">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Claim Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All statuses</option>
                <option value="claimed" className="bg-slate-900 text-white">Claimed</option>
                <option value="unclaimed" className="bg-slate-900 text-white">Unclaimed</option>
              </select>
            </div>

            {/* Participants View Specific Filters */}
            {activeView === "participants" && (
              <>
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Team Name</label>
                  <input
                    type="text"
                    placeholder="Filter team name..."
                    value={teamNameFilter}
                    onChange={(e) => setTeamNameFilter(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
                <div className="w-full sm:w-32 shrink-0">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Team No.</label>
                  <input
                    type="text"
                    placeholder="Team no..."
                    value={teamNumberFilter}
                    onChange={(e) => setTeamNumberFilter(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Staff View Specific Filters */}
            {activeView === "staff" && (
              <div className="w-full sm:w-48 shrink-0">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Type</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">All Roles</option>
                  <option value="hod" className="bg-slate-900 text-white">HODs</option>
                  <option value="faculty" className="bg-slate-900 text-white">Faculty</option>
                  <option value="volunteer" className="bg-slate-900 text-white">Volunteers</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">
              Showing <span className="font-bold text-white">{filteredClaims.length}</span> {activeView === "staff" ? "staff" : "participant"} claim{filteredClaims.length !== 1 ? "s" : ""}
              {selectedItemType && (
                <span className="ml-1">for <span className="text-yellow-400 font-semibold">{summaryByItemType[selectedItemType]?.sessionName ?? selectedItemType}</span></span>
              )}
            </span>
            {(searchQuery || teamNameFilter || teamNumberFilter || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setTeamNameFilter(""); setTeamNumberFilter(""); setRoleFilter("all"); setStatusFilter("all"); }}
                className="text-[11px] text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Error / Loading ── */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/30 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
            <span className="text-slate-500 text-sm">Loading claims...</span>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="h-12 w-12 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-slate-400 font-semibold">No claims found</h3>
            <p className="text-slate-600 text-sm mt-1">
              No claims found for the active filters.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeView === "participants" ? (
              // ── Team-grouped participant view ──
              Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([teamLabel, members]) => (
                  <div key={teamLabel} className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                    {/* Team Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/70 bg-slate-900/60">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/15 border border-yellow-500/30 text-xs font-black text-yellow-400">
                          {members[0]?.teamNumber ? members[0].teamNumber : "—"}
                        </span>
                        <span className="font-extrabold text-white text-sm">{teamLabel}</span>
                      </div>
                      <span className="text-[11px] font-bold bg-slate-800 px-2.5 py-1 rounded-full text-emerald-400">
                        {members.filter(m => m.claimedAt !== null).length} / {members.length} claimed
                      </span>
                    </div>

                    {/* Members Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800/50 bg-slate-950/30">
                            <th className="text-left px-4 py-2 text-slate-500 font-semibold w-12">#</th>
                            <th className="text-left px-4 py-2 text-slate-500 font-semibold w-[30%]">Name</th>
                            <th className="text-left px-4 py-2 text-slate-500 font-semibold hidden sm:table-cell w-[35%]">Email</th>
                            <th className="text-left px-4 py-2 text-slate-500 font-semibold w-32">Status</th>
                            
                            <th className="text-right px-4 py-2 text-slate-500 font-semibold">Claimed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, i) => (
                            <tr key={member.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                              <td className="px-4 py-2.5 text-slate-600 font-mono">{i + 1}</td>
                              <td className="px-4 py-2.5 font-semibold text-white">{member.name}</td>
                              <td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell font-mono text-[11px]">{member.email || "—"}</td>
                              <td className="px-4 py-2.5 text-left">
                                {member.claimedAt ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    Claimed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Unclaimed
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-2.5 text-right">
                                {member.claimedAt ? (
                                  <>
                                    <span className="font-semibold text-white">{formatTime(member.claimedAt)}</span>
                                    <span className="ml-1.5 text-[10px] text-slate-500">{formatDate(member.claimedAt)}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-600 font-mono text-[10px]">--:--</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
            ) : (
              // ── Staff flat view ──
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/70 bg-slate-900/60">
                  <span className="font-extrabold text-white text-sm">Faculty & Volunteer Claims</span>
                  <span className="text-[11px] font-bold text-teal-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    {filteredClaims.filter(m => m.claimedAt !== null).length} / {filteredClaims.length} claimed
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/50 bg-slate-950/30">
                        <th className="text-left px-4 py-2 text-slate-500 font-semibold w-12">#</th>
                        <th className="text-left px-4 py-2 text-slate-500 font-semibold w-1/4">Name</th>
                        <th className="text-left px-4 py-2 text-slate-500 font-semibold hidden sm:table-cell w-1/4">Email</th>
                        <th className="text-left px-4 py-2 text-slate-500 font-semibold w-24">Role</th>
                        <th className="text-left px-4 py-2 text-slate-500 font-semibold w-32">Status</th>
                        
                        <th className="text-right px-4 py-2 text-slate-500 font-semibold">Claimed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((member, i) => (
                        <tr key={member.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-2.5 text-slate-600 font-mono">{i + 1}</td>
                          <td className="px-4 py-2.5 font-semibold text-white">{member.name}</td>
                          <td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell font-mono text-[11px]">{member.email || "—"}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${roleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-left">
                            {member.claimedAt ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                Claimed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                Unclaimed
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 text-right">
                            {member.claimedAt ? (
                              <>
                                <span className="font-semibold text-white">{formatTime(member.claimedAt)}</span>
                                <span className="ml-1.5 text-[10px] text-slate-500">{formatDate(member.claimedAt)}</span>
                              </>
                            ) : (
                              <span className="text-slate-600 font-mono text-[10px]">--:--</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
