'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './CountDown.module.css';

const SEQUENCE = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'] as const;

const STATUS_MESSAGES: Record<string, string> = {
  '10': 'INITIALIZING LAUNCH SEQUENCE...',
  '9': 'AUTHENTICATING NODES...',
  '8': 'AUTHENTICATION VERIFIED',
  '7': 'SIGNAL INTERFERENCE DETECTED',
  '6': 'SYSTEM INTEGRITY: STABLE',
  '5': 'RECOVERING DATA PACKETS...',
  '4': 'WARNING: SYSTEM INSTABILITY',
  '3': 'CONTAINMENT FAILING',
  '2': 'CRITICAL STATE',
  '1': 'FINAL SEQUENCE',
};

const BG_TOKENS = [
  '0x4F92A1', 'ACCESS_LAYER_07', 'SYS://CORE', 'ENCRYPTED',
  'NODE_04', '0x0007FF', 'PACKET_LOSS', 'CH_09::LOCK',
];

type Phase = 'active' | 'glitchOut' | 'plain' | 'gone';

const STEP_MS = 1600;

export default function CountDown({ onComplete }: { onComplete?: () => void } = {}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('active');
  const [seed, setSeed] = useState(0);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const current = SEQUENCE[index];
  const isLast = index === SEQUENCE.length - 1;
  const isGlitchNumber = current === '7' || current === '4' || current === '2' || current === '1';

  useEffect(() => {
    clearTimers();
    setPhase('active');
    setSeed((s) => s + 1);

    const holdTime = STEP_MS;

    // Mid-hold shake only for designated glitch numbers (7, 4, 2, 1)
    if (isGlitchNumber) {
      schedule(() => {
        setShake(true);
        schedule(() => setShake(false), 140);
      }, holdTime * 0.5);
    }

    // Begin exit phase
    schedule(() => {
      if (isGlitchNumber) setPhase('glitchOut');
      else setPhase('plain');

      if (isGlitchNumber) {
        setFlash(true);
        schedule(() => setFlash(false), 90);
      }
    }, holdTime);

    const vanishMs = isGlitchNumber ? 380 : 220;

    // Finish exit, move on (or terminate on last number)
    schedule(() => {
      setPhase('gone');
      if (isLast) {
        // Auto-advance to splash screen after final number completes
        schedule(() => onComplete?.(), 400);
        return;
      }
      schedule(() => setIndex((i) => i + 1), 80);
    }, holdTime + vanishMs);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className={`${styles.stage} ${shake ? styles.shake : ''}`} id="countdown-stage">
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      <div className={styles.bgNoise} aria-hidden>
        {BG_TOKENS.map((t, i) => (
          <span key={t} className={styles.bgToken} style={{ '--i': i } as CSSProperties}>
            {t}
          </span>
        ))}
      </div>

      <header className={styles.header}>
        <span>[ SYSTEM // SECURE CHANNEL ]</span>
        <span>STATUS: {phase === 'gone' && isLast ? 'TERMINATED' : 'ACTIVE'}</span>
      </header>

      <div className={styles.numberWrap}>
        {phase !== 'gone' && (
          <GlitchNumber key={`${current}-${seed}`} value={current} phase={phase} step={index} seed={seed} />
        )}
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerText}>
          {STATUS_MESSAGES[current]}
        </span>
      </footer>

      {flash && <div className={styles.flash} aria-hidden />}
    </div>
  );
}

function GlitchNumber({ value, phase, step, seed }: { value: string; phase: Phase; step: number; seed: number }) {
  const isGlitchNumber = value === '7' || value === '4' || value === '2' || value === '1';

  // Deterministic calculation based on step and seed to avoid SSR hydration mismatch
  const r1 = (Math.sin((step + 1) * 37 + seed * 13) * 6).toFixed(2);
  const r2 = (Math.cos((step + 1) * 41 + seed * 17) * 6).toFixed(2);
  const r3 = (25 + Math.abs(Math.sin((step + 1) * 19 + seed * 23)) * 50).toFixed(2);

  const style = {
    '--dx1': `${r1}px`,
    '--dx2': `${r2}px`,
    '--sliceY': `${r3}%`,
  } as CSSProperties;

  let phaseClass = styles.active;
  if (phase === 'glitchOut') phaseClass = styles.glitchOut;
  if (phase === 'plain') phaseClass = styles.plainOut;

  return (
    <div
      className={`${styles.numberBox} ${phaseClass}`}
      style={style}
      data-intensity={Math.min(step, 5)}
    >
      <span className={styles.mainNumber}>
        {value}
      </span>

      {/* RGB ghost layers only exist for glitch numbers (7, 4, 2, 1) */}
      {isGlitchNumber && (
        <>
          <span className={`${styles.ghostLayer} ${styles.ghostRed}`} aria-hidden>{value}</span>
          <span className={`${styles.ghostLayer} ${styles.ghostCyan}`} aria-hidden>{value}</span>
        </>
      )}
    </div>
  );
}