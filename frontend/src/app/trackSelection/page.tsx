"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./page.module.css";
import {
  Compass,
  Boxes,
  Factory,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ChevronDown,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface TrackConfig {
  id: string;
  name: string;
  number: string;
  color: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
}

const TRACKS_CONFIG: TrackConfig[] = [
  {
    id: "coastal",
    name: "Coastal Intelligence",
    number: "01",
    color: "#00d2ff",
    description:
      "Explore AI's potential in protecting and monitoring our oceans. This track challenges you to tackle critical issues in marine ecosystems and coastal environments.",
    tags: ["Marine AI", "Sustainability", "Oceanography"],
    icon: Compass,
  },
  {
    id: "supply-chain",
    name: "Supply Chain Intelligence",
    number: "02",
    color: "#f59e0b",
    description:
      "Dive into the complex world of global logistics. This track focuses on leveraging data and AI to solve challenges in forecasting and optimization.",
    tags: ["Logistics", "Optimization", "Forecasting"],
    icon: Boxes,
  },
  {
    id: "industrial",
    name: "Industrial Intelligence",
    number: "03",
    color: "#c8f135",
    description:
      "Step into the future of manufacturing. This track challenges participants to find innovative ways to apply AI in smart automation and industrial processes.",
    tags: ["Automation", "Predictive Maintenance", "Smart Manufacturing"],
    icon: Factory,
  },
];

const MAX_SLOTS = 12;

const LS_KEY = "singularity_track_registered";

function MarqueeFooter() {
  const items = Array.from({ length: 16 });
  return (
    <footer className={styles.tsFooter}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          {items.map((_, i) => (
            <span key={i} className={i % 2 === 1 ? styles.marqueeOutline : undefined}>
              SINGULARITY
            </span>
          ))}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {items.map((_, i) => (
            <span key={`dup-${i}`} className={i % 2 === 1 ? styles.marqueeOutline : undefined}>
              SINGULARITY
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function TrackSelectionPage() {
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

  // Track selection mode: true = test mode (unlimited selections), false = strict (1 selection per user)
  const [allowMultipleSelections, setAllowMultipleSelections] = useState<boolean>(false);

  // Track selection display: true = visible/live, false = hidden/standby
  const [displayTrackSelection, setDisplayTrackSelection] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Per-user one-track restriction — stored in localStorage
  const [hasUserRegistered, setHasUserRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<{
    teamName: string;
    leaderName: string;
    track: string;
    trackAndTeamNumber?: string;
  } | null>(null);

  const [clickedTrack, setClickedTrack] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalColor, setModalColor] = useState<string>("#c8f135");
  const [teamName, setTeamName] = useState<string>("");
  const [leaderName, setLeaderName] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<{
    teamName: string;
    leaderName: string;
    track: string;
    trackAndTeamNumber?: string;
  } | null>(null);

  // Custom dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // On mount: check if this browser has already registered
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHasUserRegistered(true);
        setUserRegistration(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch live counts, mode, and display status from the server
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/register", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.counts) setCounts(data.counts);
        if (data.lockedTracks) setLockedTracks(data.lockedTracks);
        if (typeof data.allowMultipleSelections === "boolean") {
          setAllowMultipleSelections(data.allowMultipleSelections);
        }
        if (typeof data.displayTrackSelection === "boolean") {
          setDisplayTrackSelection(data.displayTrackSelection);
        }
      }
    } catch (err) {
      console.error("Failed to fetch track counts:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  // Real-time capacity check: If selected track gets filled (or locked) while the modal is open
  useEffect(() => {
    if (selectedTrack) {
      const count = counts[selectedTrack] || 0;
      const isFull = count >= MAX_SLOTS;
      const isManuallyLocked = !!lockedTracks[selectedTrack];
      if (isFull || isManuallyLocked) {
        setSelectedTrack("");
        setDropdownOpen(true);
        setFormError(
          isManuallyLocked
            ? `Registration Unavailable: Track "${selectedTrack}" has been locked by the administrator. Please select an alternative track to complete your registration.`
            : `Capacity Reached: Track "${selectedTrack}" has reached its maximum quota of ${MAX_SLOTS} teams. Please select an alternative track to complete your registration.`
        );
      }
    }
  }, [counts, lockedTracks, selectedTrack]);

  const handleOpenModal = (trackName?: string, trackColor?: string) => {
    fetchCounts();
    setFormError(null);
    setRegisteredData(null);
    setDropdownOpen(false);

    if (trackColor) setModalColor(trackColor);

    if (trackName) {
      const currentCount = counts[trackName] || 0;
      const isLocked = currentCount >= MAX_SLOTS || !!lockedTracks[trackName];
      if (!isLocked) {
        setSelectedTrack(trackName);
      } else {
        setSelectedTrack("");
      }
    } else {
      const firstAvailable = TRACKS_CONFIG.find(
        (t) => (counts[t.name] || 0) < MAX_SLOTS && !lockedTracks[t.name]
      );
      setSelectedTrack(firstAvailable ? firstAvailable.name : "");
      if (firstAvailable) setModalColor(firstAvailable.color);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTeamName("");
    setLeaderName("");
    setSelectedTrack("");
    setFormError(null);
    setRegisteredData(null);
    setDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTeam = teamName.trim();
    const cleanLeader = leaderName.trim();
    const cleanTrack = selectedTrack.trim();

    if (!cleanTeam) { setFormError("Please enter your Team Name."); return; }
    if (!cleanLeader) { setFormError("Please enter the Leader Name."); return; }
    if (!cleanTrack) { setFormError("Please select a track."); return; }

    if (lockedTracks[cleanTrack]) {
      setFormError(`Registration Unavailable: Track "${cleanTrack}" has been locked by the administrator. Please select an alternative track.`);
      setSelectedTrack("");
      setDropdownOpen(true);
      return;
    }

    const currentCount = counts[cleanTrack] || 0;
    if (currentCount >= MAX_SLOTS) {
      setFormError(`Capacity Reached: Track "${cleanTrack}" has reached its maximum quota of ${MAX_SLOTS} teams. Please select an alternative track to complete your registration.`);
      setSelectedTrack("");
      setDropdownOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: cleanTeam, leaderName: cleanLeader, track: cleanTrack }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(
          data.error ||
            `Capacity Reached: Track "${cleanTrack}" has reached its maximum quota of ${MAX_SLOTS} teams. Please select an alternative track to complete your registration.`
        );
        // If track was filled by another team in the same moment
        if (res.status === 409 || data.trackFull || data.trackLocked) {
          setSelectedTrack("");
          setDropdownOpen(true);
        }
        if (data.counts) setCounts(data.counts);
        await fetchCounts();
      } else {
        const regPayload = {
          teamName: cleanTeam,
          leaderName: cleanLeader,
          track: cleanTrack,
          trackAndTeamNumber: data.trackAndTeamNumber,
        };
        setRegisteredData(regPayload);
        // Lock all tracks for this browser — one-track rule
        try { localStorage.setItem(LS_KEY, JSON.stringify(regPayload)); } catch { /* ignore */ }
        setHasUserRegistered(true);
        setUserRegistration(regPayload);
        if (data.counts) setCounts(data.counts);
        else await fetchCounts();
      }
    } catch {
      setFormError("Network error: Unable to reach registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (track: TrackConfig, isLocked: boolean) => {
    const isUserBlocked = !allowMultipleSelections && hasUserRegistered;
    if (isLocked || isUserBlocked) return;
    setClickedTrack(track.id);
    setTimeout(() => { handleOpenModal(track.name, track.color); }, 120);
    setTimeout(() => { setClickedTrack(null); }, 800);
  };

  const selectedTrackConfig = TRACKS_CONFIG.find((t) => t.name === selectedTrack);

  if (initialLoading) {
    return (
      <div className={styles.main}>
        <nav className={styles.topNav}>
          <div className={styles.navInner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="Singularity" className={styles.navLogo} />
            <span className={styles.navTitle}>SINGULARITY</span>
          </div>
        </nav>
        <main className={styles.content} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "65vh" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#888580", fontFamily: "var(--font-mono, monospace)" }}>
            <RefreshCw size={24} className={styles.spin} style={{ color: "#c8f135" }} />
            <span style={{ fontSize: "0.82rem", letterSpacing: "0.12em" }}>SYNCHRONIZING TRACK SYSTEM...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!displayTrackSelection) {
    return (
      <div className={styles.main}>
        <nav className={styles.topNav}>
          <div className={styles.navInner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="Singularity" className={styles.navLogo} />
            <span className={styles.navTitle}>SINGULARITY</span>
          </div>
        </nav>
        <main className={styles.content}>
          <div className={styles.standbyContainer}>
            <div className={styles.standbyCard}>
              <div className={styles.standbyTag}>// TRACK SELECTION // STANDBY MODE</div>
              <div className={styles.standbyIconWrap}>
                <Lock size={28} />
              </div>
              <h1 className={styles.standbyTitle}>TRACK SELECTION NOT OPENED YET</h1>
              <p className={styles.standbyDesc}>
                Track selection is currently not open for participant registrations.
                The event coordinators will activate this portal when track selection begins.
              </p>
              <div className={styles.standbyActions}>
                <Link href="/" className={styles.returnHomeBtn}>
                  <ArrowLeft size={15} />
                  <span>RETURN TO HOME</span>
                </Link>
                <button
                  type="button"
                  className={styles.standbyCheckBtn}
                  onClick={fetchCounts}
                  title="Check if track selection has opened"
                >
                  <RefreshCw size={14} />
                  <span>REFRESH STATUS</span>
                </button>
              </div>
            </div>
          </div>
        </main>
        <MarqueeFooter />
      </div>
    );
  }

  return (
    <div className={styles.main}>
      {/* Top Nav Bar */}
      <nav className={styles.topNav}>
        <div className={styles.navInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="Singularity" className={styles.navLogo} />
          <span className={styles.navTitle}>SINGULARITY</span>
        </div>
      </nav>

      {/* ─── Already Registered Banner (Strict Mode) ─── */}
      {!allowMultipleSelections && hasUserRegistered && userRegistration && (
        <div className={styles.alreadyRegisteredBanner}>
          <CheckCircle2 size={18} />
          <span>
            You have already registered —{" "}
            <strong style={{ color: "#c8f135" }}>{userRegistration.teamName}</strong>
            {" "}selected{" "}
            <strong style={{ color: "#c8f135" }}>{userRegistration.track}</strong>
          </span>
        </div>
      )}

      {/* Track Selection Content */}
      <main className={styles.content}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.systemTag}>// SINGULARITY 2026 // TRACK SELECTION</div>
          <h1 className={styles.heroTitle}>SELECT YOUR TRACK</h1>
          <p className={styles.heroSubtitle}>
            Dive deep into the frontiers of Artificial Intelligence across three core
            tracks. Each track has a strict cap of 12 teams on a first-come,
            first-served basis. Click any track to lock in your registration.
          </p>
        </section>

        {/* Tracks Interactive Grid */}
        <section className={styles.tracksGrid} id="selection-grid">
          {TRACKS_CONFIG.map((track) => {
            const count = counts[track.name] || 0;
            const remaining = Math.max(0, MAX_SLOTS - count);
            const isFull = count >= MAX_SLOTS;
            const isManuallyLocked = !!lockedTracks[track.name];
            // If strict mode and user already registered, lock ALL tracks for them
            const isUserLocked = !allowMultipleSelections && hasUserRegistered;
            const isLocked = isFull || isManuallyLocked || isUserLocked;
            const isUsersChosenTrack = !allowMultipleSelections && hasUserRegistered && userRegistration?.track === track.name;
            const Icon = track.icon;
            const isClicked = clickedTrack === track.id;

            return (
              <div
                key={track.id}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                aria-label={`Select track ${track.name} - ${isUserLocked ? "Already registered" : isManuallyLocked ? "Locked by admin" : isFull ? "12 teams selected (Track full)" : remaining + " slots remaining"}`}
                className={`${styles.trackCard} ${isLocked ? styles.cardFull : ""} ${isUsersChosenTrack ? styles.cardChosen : ""} ${isClicked ? styles.cardClicked : ""}`}
                style={{ "--track-color": track.color } as React.CSSProperties}
                onClick={() => handleCardClick(track, isLocked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(track, isLocked);
                  }
                }}
              >
                {/* Card Top: Icon & Track Number */}
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon}>
                    <Icon size={30} strokeWidth={1.8} />
                  </span>
                  <span className={styles.cardNum}>{track.number}</span>
                </div>

                {/* Horizontal Accent Line */}
                <div className={styles.colorBar} />

                {/* Track Details */}
                <h2 className={styles.cardName}>{track.name}</h2>
                <p className={styles.cardDesc}>{track.description}</p>

                {/* Tags */}
                <div className={styles.tags}>
                  {track.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                  {isUsersChosenTrack && (
                    <span className={`${styles.tag} ${styles.tagChosen}`}>✓ YOUR TRACK</span>
                  )}
                  {!isUsersChosenTrack && isManuallyLocked && (
                    <span className={`${styles.tag} ${styles.tagFull}`}>LOCKED BY ADMIN</span>
                  )}
                  {!isUsersChosenTrack && !isManuallyLocked && isFull && (
                    <span className={`${styles.tag} ${styles.tagFull}`}>12/12 FULL</span>
                  )}
                  {!isUsersChosenTrack && isUserLocked && !isManuallyLocked && !isFull && (
                    <span className={`${styles.tag} ${styles.tagFull}`}>REGISTRATION CLOSED</span>
                  )}
                </div>

                {/* Select button */}
                <button
                  type="button"
                  className={styles.cardSelectBtn}
                  disabled={isLocked}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(track, isLocked); }}
                >
                  {isUsersChosenTrack
                    ? "✓ REGISTERED"
                    : isUserLocked
                    ? "REGISTRATION CLOSED FOR YOU"
                    : isManuallyLocked
                    ? "LOCKED BY ADMIN"
                    : isFull
                    ? "12 TEAMS SELECTED // LOCKED"
                    : "SELECT TRACK →"}
                </button>
              </div>
            );
          })}
        </section>
      </main>


      {/* Registration Modal Overlay */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div
            className={styles.modalContent}
            style={{ "--modal-color": selectedTrackConfig?.color || modalColor } as React.CSSProperties}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderTitle}>// TEAM REGISTRATION</span>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {registeredData ? (
                /* Success View */
                <div className={styles.successView}>
                  <div className={styles.successIconBadge}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className={styles.successTitle}>REGISTRATION CONFIRMED</h3>
                  <p className={styles.cardDesc}>
                    Your team has been successfully locked in for{" "}
                    <strong>{registeredData.track}</strong>.
                  </p>

                  <div className={styles.successSummaryBox}>
                    {/* Track Number Identifier - Colored text without outside container */}
                    {(() => {
                      const trackCfg = TRACKS_CONFIG.find(t => t.name === registeredData.track);
                      const trackNum = trackCfg ? parseInt(trackCfg.number, 10) : 0;
                      const teamNum = counts[registeredData.track] || 1;
                      const identifier =
                        (registeredData.trackAndTeamNumber
                          ? registeredData.trackAndTeamNumber.replace("_", "@")
                          : `TRACK${trackNum}@team${teamNum}`);
                      return (
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>// TEAM NUMBER:</span>
                          <span
                            className={styles.summaryValHighlight}
                            style={{
                              color: trackCfg?.color || "var(--accent-lime)",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {identifier}
                          </span>
                        </div>
                      );
                    })()}
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>// TEAM NAME:</span>
                      <span className={styles.summaryVal}>{registeredData.teamName}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>// LEADER:</span>
                      <span className={styles.summaryVal}>{registeredData.leaderName}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>// TRACK:</span>
                      <span className={styles.summaryValHighlight}>{registeredData.track}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.closeSuccessBtn}
                    onClick={handleCloseModal}
                  >
                    [ DONE / CLOSE ]
                  </button>
                </div>
              ) : (
                /* Registration Form */
                <form className={styles.form} onSubmit={handleSubmit}>
                  {/* Field 1: Team Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="ts-teamName" className={styles.label}>
                      <span className={styles.labelPrefix}>//</span> 1. TEAM NAME
                    </label>
                    <input
                      id="ts-teamName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. CyberVanguard"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Field 2: Leader Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="ts-leaderName" className={styles.label}>
                      <span className={styles.labelPrefix}>//</span> 2. LEADER NAME
                    </label>
                    <input
                      id="ts-leaderName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Alex Mercer"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Field 3: Custom Track Dropdown */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelPrefix}>//</span> 3. TRACK
                    </label>
                    <div className={styles.customDropdown} ref={dropdownRef}>
                      <button
                        type="button"
                        className={`${styles.dropdownTrigger} ${dropdownOpen ? styles.dropdownTriggerOpen : ""}`}
                        onClick={() => setDropdownOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen}
                      >
                        {selectedTrackConfig ? (
                          <span className={styles.dropdownSelected}>
                            <span className={styles.dropdownDot} style={{ background: selectedTrackConfig.color }} />
                            {selectedTrackConfig.name}
                          </span>
                        ) : (
                          <span className={styles.dropdownPlaceholder}>— Select a track —</span>
                        )}
                        <ChevronDown
                          size={16}
                          className={`${styles.dropdownChevron} ${dropdownOpen ? styles.dropdownChevronOpen : ""}`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className={styles.dropdownPanel}>
                          <ul className={styles.dropdownList} role="listbox" onWheel={(e) => e.stopPropagation()}>
                            {TRACKS_CONFIG.map((t) => {
                              const count = counts[t.name] || 0;
                              const isFull = count >= MAX_SLOTS;
                              const isManuallyLocked = !!lockedTracks[t.name];
                              const isLocked = isFull || isManuallyLocked;
                              const isSelected = selectedTrack === t.name;
                              const Icon = t.icon;

                              return (
                                <li
                                  key={t.id}
                                  role="option"
                                  aria-selected={isSelected}
                                  aria-disabled={isLocked}
                                  className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ""} ${isLocked ? styles.dropdownOptionDisabled : ""}`}
                                  style={{
                                    "--opt-color": t.color,
                                    cursor: isLocked ? "not-allowed" : "pointer",
                                    pointerEvents: isLocked ? "none" : "auto",
                                  } as React.CSSProperties}
                                  onClick={() => {
                                    if (isLocked) return;
                                    setSelectedTrack(t.name);
                                    setModalColor(t.color);
                                    setFormError(null);
                                  }}
                                >
                                  <span className={styles.dropdownOptionLeft}>
                                    <span className={styles.dropdownDot} style={{ background: t.color }} />
                                    <Icon size={15} strokeWidth={1.8} style={{ color: t.color }} />
                                    <span className={styles.dropdownOptionName}>{t.name}</span>
                                  </span>
                                  {isManuallyLocked && <span className={styles.dropdownFullBadge}>LOCKED</span>}
                                  {!isManuallyLocked && isFull && <span className={styles.dropdownFullBadge}>12/12 FULL</span>}
                                  {isSelected && !isLocked && <span className={styles.dropdownCheckmark}>✓</span>}
                                </li>
                              );
                            })}
                          </ul>
                          <div className={styles.dropdownFooter}>
                            <button
                              type="button"
                              className={styles.dropdownSelectBtn}
                              disabled={!selectedTrack || (counts[selectedTrack] || 0) >= MAX_SLOTS || !!lockedTracks[selectedTrack]}
                              onClick={() => {
                                if (!selectedTrack || (counts[selectedTrack] || 0) >= MAX_SLOTS || !!lockedTracks[selectedTrack]) return;
                                setDropdownOpen(false);
                              }}
                            >
                              {selectedTrack && (counts[selectedTrack] || 0) < MAX_SLOTS && !lockedTracks[selectedTrack]
                                ? `SELECT — ${selectedTrack}`
                                : "SELECT AN OPEN TRACK"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {formError && (
                    <div className={styles.errorAlert}>
                      <AlertTriangle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={styles.modalSubmitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={15} className={styles.spin} />
                        PROCESSING SELECTION...
                      </>
                    ) : (
                      <>CONFIRM SELECTION →</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Singularity Slim Marquee Footer */}
      <MarqueeFooter />
    </div>
  );
}
