"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import styles from "./TrackSelectFab.module.css";

export default function TrackSelectFab() {
  const [visible, setVisible] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    // Check if this browser already registered
    const registered = localStorage.getItem("singularity_track_registered");
    if (registered) setHasRegistered(true);

    const checkVisibility = async () => {
      try {
        const res = await fetch("/api/register", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setVisible(!!data.displayTrackSelection);
        }
      } catch {
        // ignore
      }
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/trackSelection"
      className={`${styles.fab} ${hasRegistered ? styles.fabDone : ""}`}
      aria-label="Track Selection"
      title={hasRegistered ? "You have already registered for a track" : "Select your track"}
    >
      <Layers size={18} strokeWidth={2} />
      <span className={styles.fabLabel}>
        {hasRegistered ? "TRACK SELECTED ✓" : "SELECT TRACK"}
      </span>
      {!hasRegistered && <span className={styles.fabPulse} />}
    </Link>
  );
}
