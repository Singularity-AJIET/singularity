"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SplashScreen.module.css";

const WORD = "SINGULARITY";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$!&0123456789%^*/<>";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  // The character shown for each letter position
  const [display, setDisplay] = useState<string[]>(() => WORD.split("").map(() => "?"));
  // Which letters have locked in to their correct value
  const [lockedLetters, setLockedLetters] = useState<boolean[]>(() => new Array(WORD.length).fill(false));
  // Ref for interval to safely read locked state inside closure
  const lockedRef = useRef<boolean[]>(new Array(WORD.length).fill(false));

  useEffect(() => {
    setMounted(true);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Immediately start scramble — show random chars
    setDisplay(WORD.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]));

    // Scramble interval: update non-locked chars every 55ms
    const scramble = setInterval(() => {
      setDisplay(
        WORD.split("").map((char, i) =>
          lockedRef.current[i] ? char : CHARS[Math.floor(Math.random() * CHARS.length)]
        )
      );
    }, 55);

    // Phase 1: letters start rising (with scrambled content)
    timers.push(setTimeout(() => setPhase(1), 80));

    // Lock in letters one by one after they've risen (~1000ms + stagger)
    WORD.split("").forEach((char, i) => {
      timers.push(
        setTimeout(() => {
          lockedRef.current[i] = true;
          setLockedLetters((prev) => {
            const n = [...prev];
            n[i] = true;
            return n;
          });
          setDisplay((prev) => {
            const n = [...prev];
            n[i] = char;
            return n;
          });
        }, 1050 + i * 70)
      );
    });

    // Stop scramble after all letters locked (1050 + 11*70 = ~1820ms)
    timers.push(setTimeout(() => clearInterval(scramble), 1900));

    // Neon flash at 2300ms
    timers.push(setTimeout(() => setPhase(2), 2300));
    // Flash off at 2600ms
    timers.push(setTimeout(() => setPhase(3), 2600));
    // Wipe out + complete at 3300ms
    timers.push(setTimeout(() => { setPhase(4); onComplete(); }, 3300));

    return () => {
      clearInterval(scramble);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className={styles.splash}
          animate={{ backgroundColor: phase === 2 ? "#c8f135" : "#0D0D0D" }}
          exit={{ y: "-100%", transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
          transition={{ backgroundColor: { duration: 0.09 } }}
        >
          {/* Top-left terminal label */}
          <motion.div
            className={styles.corner}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              color: phase === 2 ? "#0D0D0D" : "#c8f135",
            }}
            transition={{ opacity: { duration: 0.4, delay: 0.35 }, color: { duration: 0.09 } }}
            initial={{ opacity: 0 }}
          >
            &gt;_ DECODING...
          </motion.div>

          {/* Main scrambling word row */}
          <div className={styles.wordRow}>
            {WORD.split("").map((_, i) => (
              <div key={i} className={styles.charClip}>
                <motion.span
                  className={styles.charLetter}
                  animate={{
                    y: phase >= 1 ? "0%" : "115%",
                    // locked = lime, scrambling = dim, flash = black
                    color:
                      phase === 2
                        ? "#0D0D0D"
                        : lockedLetters[i]
                        ? "#c8f135"
                        : "rgba(240, 237, 232, 0.35)",
                    // subtle scale punch when locking in
                    scale: lockedLetters[i] ? 1 : 0.92,
                  }}
                  transition={{
                    y: { duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.05 + i * 0.042 },
                    color: { duration: 0.12 },
                    scale: { duration: 0.15, type: "spring", stiffness: 400 },
                  }}
                  initial={{ y: "115%" }}
                >
                  {display[i]}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Sub label */}
          <div className={styles.subClip}>
            <motion.div
              className={styles.subLabel}
              animate={{
                y: phase >= 1 ? "0%" : "115%",
                opacity: phase >= 1 ? 1 : 0,
                color: phase === 2 ? "#0D0D0D" : "#888580",
              }}
              transition={{
                y: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.48 },
                opacity: { duration: 0.5, delay: 0.48 },
                color: { duration: 0.09 },
              }}
              initial={{ y: "115%", opacity: 0 }}
            >
              HACKATHON_2026 &nbsp;/&nbsp; 36HRS &nbsp;/&nbsp; ₹1L+ PRIZES
            </motion.div>
          </div>

          {/* Scanning line effect */}
          <motion.div
            className={styles.scanLine}
            animate={{
              opacity: phase >= 1 && phase < 2 ? [0, 1, 0] : 0,
              y: phase >= 1 ? ["0%", "100vh"] : "0%",
            }}
            transition={{
              y: { duration: 2.5, ease: "easeInOut" },
              opacity: { duration: 2.5, times: [0, 0.1, 1] },
            }}
            initial={{ opacity: 0 }}
          />

          {/* Progress bar */}
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressBar}
              animate={{
                scaleX: phase >= 1 ? 1 : 0,
                backgroundColor: phase === 2 ? "#0D0D0D" : "#c8f135",
              }}
              transition={{
                scaleX: { duration: 2.1, ease: "easeInOut" },
                backgroundColor: { duration: 0.09 },
              }}
              initial={{ scaleX: 0 }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
