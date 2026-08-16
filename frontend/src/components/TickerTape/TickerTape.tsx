"use client";
import styles from "./TickerTape.module.css";

const PHRASES = [
  "BUILD THE FUTURE",
  "CODE THE UNKNOWN",
  "DEFY LIMITS",
  "CODE OR CONQUER",
  "SINGULARITY 2026",
  "CODE IS LAW",
  "NO BOUNDARIES",
];

export default function TickerTape() {
  const content = (
    <>
      {PHRASES.map((phrase, i) => (
        <div key={i} className={styles.tickerItem}>
          <span>{phrase}</span>
          <span className={styles.separator}>{"//"}</span>
        </div>
      ))}
    </>
  );

  return (
    <div className={styles.tickerWrapper} role="marquee" aria-label="Singularity 2026 hackathon highlights: Build the Future, Code the Unknown, Defy Limits">
      {/* Container 1 */}
      <div className={styles.tickerContent}>
        {content}
      </div>
      {/* Container 2 for seamless looping */}
      <div className={styles.tickerContent} aria-hidden="true">
        {content}
      </div>
    </div>
  );
}