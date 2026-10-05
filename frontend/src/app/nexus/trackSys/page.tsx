"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./trackSys.module.css";
import {
  Compass,
  Boxes,
  Factory,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sliders,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

interface TrackMeta {
  id: string;
  name: string;
  number: string;
  color: string;
  icon: React.ElementType;
}

const TRACKS_METADATA: TrackMeta[] = [
  {
    id: "coastal",
    name: "Coastal Intelligence",
    number: "01",
    color: "#00d2ff",
    icon: Compass,
  },
  {
    id: "supply-chain",
    name: "Supply Chain Intelligence",
    number: "02",
    color: "#f59e0b",
    icon: Boxes,
  },
  {
    id: "industrial",
    name: "Industrial Intelligence",
    number: "03",
    color: "#c8f135",
    icon: Factory,
  },
];

const MAX_SLOTS = 12;

interface RegistrationRecord {
  rowNumber: number;
  trackNumber: string;
  teamNo: number | string;
  teamName: string;
  trackName: string;
  leaderName: string;
  trackAndTeamNumber?: string;
}

export default function TrackSysAdminPage() {
  const [activeTab, setActiveTab] = useState<"tracks" | "registrations">("tracks");
  const [counts, setCounts] = useState<Record<string, number>>({
    "Coastal Intelligence": 0,
    "Supply Chain Intelligence": 0,
    "Industrial Intelligence": 0,
  });
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({
    "Coastal Intelligence": false,
    "Supply Chain Intelligence": false,
    "Industrial Intelligence": false,
  });
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Selection mode: false = single selection (strict), true = multiple selections allowed (testing)
  const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);

  // Portal Display mode: true = /trackSelection is visible to participants, false = hidden/standby
  const [displayTrackSelection, setDisplayTrackSelection] = useState(false);
  const [togglingDisplay, setTogglingDisplay] = useState(false);

  // Search in table
  const [searchQuery, setSearchQuery] = useState("");

  // Delete all warning modal state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);

  // Alert/Message banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  // Fetch admin track data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tracks", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load track data");
      const data = await res.json();
      if (data.success) {
        if (data.counts) setCounts(data.counts);
        if (data.lockedTracks) setLockedTracks(data.lockedTracks);
        if (data.records) setRecords(data.records);
        if (typeof data.allowMultipleSelections === "boolean") {
          setAllowMultipleSelections(data.allowMultipleSelections);
        }
        if (typeof data.displayTrackSelection === "boolean") {
          setDisplayTrackSelection(data.displayTrackSelection);
        }
      }
    } catch {
      showFeedback("error", "Unable to sync with track management API.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle selection mode: Unlimited (Test Mode) vs Single Selection (Strict Mode)
  const handleToggleSelectionMode = async () => {
    const nextVal = !allowMultipleSelections;
    setTogglingMode(true);
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowMultipleSelections: nextVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback("error", data.error || "Failed to update selection mode.");
      } else {
        setAllowMultipleSelections(data.allowMultipleSelections);
        // Clear local storage for quick testing in this browser
        try {
          localStorage.removeItem("singularity_track_registered");
        } catch {
          // ignore
        }
        showFeedback(
          "success",
          nextVal
            ? "⚡ TEST MODE ENABLED: Users can now select tracks any number of times."
            : "🔒 STRICT MODE ENABLED: Users can only select 1 track (all tracks lock after selection)."
        );
      }
    } catch {
      showFeedback("error", "Network error toggling selection mode.");
    } finally {
      setTogglingMode(false);
    }
  };

  // Toggle portal display: Visible to participants vs Hidden (standby)
  const handleToggleDisplay = async () => {
    const nextVal = !displayTrackSelection;
    setTogglingDisplay(true);
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayTrackSelection: nextVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback("error", data.error || "Failed to update track selection display state.");
      } else {
        setDisplayTrackSelection(data.displayTrackSelection);
        showFeedback(
          "success",
          nextVal
            ? "👁 DISPLAY ENABLED: /trackSelection is now LIVE and visible to all participants."
            : "🔒 DISPLAY DISABLED: /trackSelection is now HIDDEN from participants (Standby Mode)."
        );
      }
    } catch {
      showFeedback("error", "Network error toggling track selection display.");
    } finally {
      setTogglingDisplay(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Toggle Track Lock
  const handleToggleLock = async (trackName: string) => {
    const currentlyLocked = !!lockedTracks[trackName];
    setActionLoading(trackName);

    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: trackName, locked: !currentlyLocked }),
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback("error", data.error || "Failed to update track status.");
      } else {
        setLockedTracks(data.lockedTracks);
        showFeedback(
          "success",
          `Track "${trackName}" is now ${!currentlyLocked ? "LOCKED" : "UNLOCKED"}.`
        );
      }
    } catch {
      showFeedback("error", "Network error updating track lock status.");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete a registration
  const handleDeleteRecord = async (rowNumber: number, teamName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete registration for team "${teamName}"? This will free up 1 slot on the track.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tracks?rowNumber=${rowNumber}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        showFeedback("error", data.error || "Failed to delete registration.");
      } else {
        showFeedback("success", `Team "${teamName}" registration was removed.`);
        if (data.counts) setCounts(data.counts);
        if (data.records) setRecords(data.records);
      }
    } catch {
      showFeedback("error", "Network error trying to delete registration.");
    }
  };

  // Delete ALL registrations
  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const res = await fetch("/api/admin/tracks?all=true", {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        showFeedback("error", data.error || "Failed to delete all registrations.");
      } else {
        showFeedback("success", "All registration records have been cleared and track slots reset.");
        if (data.counts) setCounts(data.counts);
        if (data.records) setRecords(data.records);
        setShowDeleteAllModal(false);
      }
    } catch {
      showFeedback("error", "Network error trying to clear all registrations.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Download Excel
  const handleDownloadExcel = () => {
    window.location.href = "/api/admin/excel";
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.teamName && r.teamName.toLowerCase().includes(q)) ||
      (r.trackName && r.trackName.toLowerCase().includes(q)) ||
      (r.leaderName && r.leaderName.toLowerCase().includes(q)) ||
      (r.trackAndTeamNumber && r.trackAndTeamNumber.toLowerCase().includes(q)) ||
      (r.trackNumber && r.trackNumber.includes(q)) ||
      (r.teamNo && String(r.teamNo).includes(q))
    );
  });

  const totalRegistered = records.length;

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <div>
              <div className={styles.headerBadgeRow}>
                <span className={styles.systemTag}>TRACK SYS ADMIN</span>
                <span className={styles.subTag}>// NEXUS CONTROL PANEL</span>
              </div>
              <h1 className={styles.pageTitle}>TRACK SELECTION SYSTEM</h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* DISPLAY Button */}


              <button
                type="button"
                className={styles.refreshBtn}
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? styles.spin : ""} />
                REFRESH DATA
              </button>
              <button
                type="button"
                className={styles.downloadExcelBtn}
                onClick={handleDownloadExcel}
              >
                <Download size={14} /> EXPORT EXCEL
              </button>
            </div>
          </div>
          <p className={styles.pageSub}>
            Real-time track capacity management, team allocations, manual track locking, and Excel database synchronization.
          </p>
        </div>

        {/* Global Selection Mode Bar */}
        <div className={styles.modeBanner}>
          <div className={styles.bannerActions}>
            {/* Display Button */}
            <button
              type="button"
              className={displayTrackSelection ? styles.displayBtnActive : styles.displayBtnInactive}
              onClick={handleToggleDisplay}
              disabled={togglingDisplay}
              title={
                displayTrackSelection
                  ? "Track Selection portal is currently VISIBLE to participants at /trackSelection. Click to hide."
                  : "Track Selection portal is currently HIDDEN from participants. Click to display and make visible to participants."
              }
            >
              {togglingDisplay ? (
                <>
                  <RefreshCw size={13} className={styles.spin} />
                  <span>UPDATING...</span>
                </>
              ) : displayTrackSelection ? (
                <>
                  <Eye size={13} />
                  <span>DISPLAY [VISIBLE]</span>
                </>
              ) : (
                <>
                  <EyeOff size={13} />
                  <span>DISPLAY [HIDDEN]</span>
                </>
              )}
            </button>

            {/* Switch to Selection Mode Button */}
            <button
              type="button"
              className={allowMultipleSelections ? styles.modeToggleBtnActive : styles.modeToggleBtnStrict}
              onClick={handleToggleSelectionMode}
              disabled={togglingMode}
            >
              {togglingMode ? (
                <>
                  <RefreshCw size={13} className={styles.spin} />
                  <span>SAVING...</span>
                </>
              ) : allowMultipleSelections ? (
                <>
                  <Lock size={13} />
                  <span>SWITCH TO: 1 SELECTION ONLY</span>
                </>
              ) : (
                <>
                  <Unlock size={13} />
                  <span>SWITCH TO: UNLIMITED SELECTIONS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "tracks" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("tracks")}
          >
            <Sliders size={14} />
            Track Slots & Locks
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "registrations" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("registrations")}
          >
            <Users size={14} />
            Live Registrations
            <span className={styles.tabCountBadge}>{totalRegistered}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`${styles.feedbackAlert} ${
              feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError
            }`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              className={styles.closeFeedbackBtn}
              onClick={() => setFeedback(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* SECTION 1: TRACK SLOTS & LOCK CONTROLS */}
        {activeTab === "tracks" && (
          <section>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionTag}>// 01. CAPACITY & MANUAL LOCK CONTROLS</span>
                <h2 className={styles.sectionTitle}>TRACK ALLOCATION OVERVIEW</h2>
                <p className={styles.sectionSub}>
                  Each track is capped at 12 teams. Lock a track manually at any time to block new participant selections regardless of slots.
                </p>
              </div>
            </div>

            <div className={styles.tracksGrid}>
              {TRACKS_METADATA.map((track) => {
                const count = counts[track.name] || 0;
                const isManuallyLocked = !!lockedTracks[track.name];
                const isFull = count >= MAX_SLOTS;
                const pct = Math.min(100, Math.round((count / MAX_SLOTS) * 100));
                const Icon = track.icon;
                const isUpdating = actionLoading === track.name;

                return (
                  <div
                    key={track.id}
                    className={`${styles.trackContainer} ${
                      isManuallyLocked ? styles.trackContainerLocked : ""
                    }`}
                    style={{ "--track-color": track.color } as React.CSSProperties}
                  >
                    <div className={styles.containerTop}>
                      <div className={styles.containerTrackInfo}>
                        <span className={styles.containerNumber}>TRACK {track.number}</span>
                        <h3 className={styles.containerName}>{track.name}</h3>
                      </div>
                      <Icon size={24} style={{ color: track.color }} />
                    </div>

                    <div className={styles.containerStats}>
                      <div className={styles.statsRow}>
                        <span className={styles.statsLabel}>STATUS</span>
                        {isManuallyLocked ? (
                          <span className={`${styles.statusBadge} ${styles.statusLocked}`}>
                            MANUALLY LOCKED
                          </span>
                        ) : isFull ? (
                          <span className={`${styles.statusBadge} ${styles.statusFull}`}>
                            12/12 FULL
                          </span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.statusOpen}`}>
                            OPEN
                          </span>
                        )}
                      </div>

                      <div className={styles.statsRow}>
                        <span className={styles.statsLabel}>ENROLLED TEAMS</span>
                        <span className={styles.statsValue}>
                          {count} / {MAX_SLOTS}
                        </span>
                      </div>

                      <div className={styles.progressBarTrack}>
                        <div
                          className={`${styles.progressBarFill} ${
                            isFull ? styles.progressBarFillFull : ""
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdating}
                      className={`${styles.manualToggleBtn} ${
                        isManuallyLocked ? styles.btnUnlock : styles.btnLock
                      }`}
                      onClick={() => handleToggleLock(track.name)}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw size={14} className={styles.spin} /> UPDATING...
                        </>
                      ) : isManuallyLocked ? (
                        <>
                          <Unlock size={14} /> UNLOCK TRACK
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> MANUALLY LOCK TRACK
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: LIVE REGISTRATIONS ROSTER */}
        {activeTab === "registrations" && (
          <section>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionTag}>// 02. LIVE ROSTER</span>
                <h2 className={styles.sectionTitle}>REGISTERED TEAMS ROSTER</h2>
                <p className={styles.sectionSub}>
                  {records.length} registered teams across 3 tracks (12 teams cap per track).
                </p>
              </div>

              <button
                type="button"
                className={styles.downloadExcelBtn}
                onClick={handleDownloadExcel}
              >
                <Download size={15} /> EXPORT (.XLSX)
              </button>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableToolbar}>
                <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
                  <input
                    type="text"
                    className={styles.searchBox}
                    placeholder="Search by team, track, or leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    className={styles.clearAllBtn}
                    onClick={() => setShowDeleteAllModal(true)}
                    disabled={loading || records.length === 0}
                    title="Delete all registrations at once"
                  >
                    <Trash2 size={13} />
                    DELETE ALL ({records.length})
                  </button>

                  <button
                    type="button"
                    className={styles.refreshBtn}
                    onClick={fetchData}
                    disabled={loading}
                  >
                    <RefreshCw size={13} className={loading ? styles.spin : ""} />
                    REFRESH
                  </button>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>TRACK NO (COL 1)</th>
                      <th>TEAM NO (COL 2)</th>
                      <th>TEAM NAME (COL 3)</th>
                      <th>TRACK NAME (COL 4)</th>
                      <th>LEADER NAME (COL 5)</th>
                      <th>TRACK & TEAM (COL 6)</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className={styles.emptyState}>
                          {searchQuery
                            ? "No teams matching query."
                            : "No teams registered yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r, i) => {
                        const meta = TRACKS_METADATA.find((m) => m.name === r.trackName);
                        return (
                          <tr key={`${r.teamName}-${i}`}>
                            <td
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "#888580",
                              }}
                            >
                              {i + 1}
                            </td>
                            <td
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: meta?.color || "#c8f135",
                                fontWeight: 800,
                              }}
                            >
                              {r.trackNumber}
                            </td>
                            <td
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "#fff",
                                fontWeight: 800,
                              }}
                            >
                              {r.teamNo || i + 1}
                            </td>
                            <td style={{ fontWeight: 700, color: "#fff" }}>
                              {r.teamName}
                            </td>
                            <td>
                              <span
                                className={styles.trackBadge}
                                style={{
                                  background: `${meta?.color || "#fff"}15`,
                                  color: meta?.color || "#fff",
                                  border: `1px solid ${meta?.color || "#fff"}40`,
                                }}
                              >
                                {r.trackName}
                              </span>
                            </td>
                            <td style={{ color: "#aaa" }}>{r.leaderName}</td>
                            <td style={{ fontFamily: "var(--font-mono)", color: meta?.color || "#c8f135", fontWeight: 800 }}>{r.trackAndTeamNumber}</td>
                            <td>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                title="Remove Registration"
                                onClick={() =>
                                  handleDeleteRecord(r.rowNumber, r.teamName)
                                }
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Delete All Warning Confirmation Modal */}
      {showDeleteAllModal && (
        <div
          className={styles.warningModalOverlay}
          onClick={() => !isDeletingAll && setShowDeleteAllModal(false)}
        >
          <div className={styles.warningModalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningIconBadge}>
              <AlertTriangle size={30} />
            </div>
            <h3 className={styles.warningModalTitle}>WARNING: DELETE ALL REGISTRATIONS</h3>
            <p className={styles.warningModalDesc}>
              Are you sure you want to permanently delete <strong>ALL ({records.length})</strong> registered teams?
              This will reset all track slot counters back to 0 across the entire platform.
              <br /><br />
              <span style={{ color: "#ef4444", fontWeight: 700 }}>⚠️ This action is irreversible!</span>
            </p>
            <div className={styles.warningModalActions}>
              <button
                type="button"
                className={styles.warningCancelBtn}
                onClick={() => setShowDeleteAllModal(false)}
                disabled={isDeletingAll}
              >
                CANCEL
              </button>
              <button
                type="button"
                className={styles.warningConfirmBtn}
                onClick={handleConfirmDeleteAll}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? (
                  <>
                    <RefreshCw size={14} className={styles.spin} />
                    DELETING...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    YES, DELETE ALL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
