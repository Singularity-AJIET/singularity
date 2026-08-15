"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./SingularityCore.module.css";

const CENTER = 230;
const SCAN_PERIOD_MS = 11000;
const HIT_WINDOW_DEG = 11;

const RING_RADII = { inner: 92, mid: 141, outer: 170 };

type NodeCfg = {
  id: string;
  label: string;
  angle: number;
  radius: number;
  size: number;
  duration: number;
  reverse?: boolean;
  tier: "inner" | "mid" | "outer";
  flowIndex?: number;
};

const NODES: NodeCfg[] = [
  { id: "idea", label: "IDEA", angle: -90, radius: RING_RADII.inner, size: 5, duration: 52, tier: "inner", flowIndex: 0 },
  { id: "code", label: "CODE", angle: -14, radius: RING_RADII.inner, size: 5, duration: 52, tier: "inner", flowIndex: 1 },
  { id: "build", label: "BUILD", angle: 68, radius: RING_RADII.mid, size: 5.5, duration: 70, reverse: true, tier: "mid", flowIndex: 2 },
  { id: "innovate", label: "INNOVATE", angle: 158, radius: RING_RADII.mid, size: 6, duration: 70, reverse: true, tier: "mid", flowIndex: 3 },
  { id: "create", label: "CREATE", angle: 232, radius: RING_RADII.outer, size: 4, duration: 102, reverse: true, tier: "outer" },
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const a = (i * 137.5) % 360;
  const r = 60 + ((i * 53) % 200);
  const dur = 16 + (i % 6) * 3.5;
  const delay = -(i * 1.6);
  const drift = i % 2 === 0 ? 1 : -1;
  return { id: i, a, r, dur, delay, drift };
});

const TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = i * 15;
  return { angle, major: angle % 90 === 0 };
});

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function reticleLines(ringRadius: number) {
  return [0, 90, 180, 270].map((deg) => {
    const inner = polar(deg, ringRadius + 2);
    const outer = polar(deg, ringRadius + 7);
    return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
  });
}

function labelDistanceFor(n: NodeCfg) {
  return n.size + 7 + 14;
}

export default function SingularityCore() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const labelRefs = useRef<Record<string, SVGTextElement | null>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const [burst, setBurst] = useState<string | null>(null);
  const [coreFlash, setCoreFlash] = useState(false);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const isVisible = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      target.current = { x: nx, y: ny };
    };
    const onLeave = () => {
      target.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);

    startTime.current = performance.now();

    const tick = (ts: number) => {
      if (!isVisible.current) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;
      const g = parallaxRef.current;
      if (g) {
        const tx = current.current.x * 10;
        const ty = current.current.y * 10;
        const rot = current.current.x * 1.5;
        g.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      }

      const elapsed = ts - startTime.current;
      const scanAngle = ((elapsed % SCAN_PERIOD_MS) / SCAN_PERIOD_MS) * 360;
      NODES.forEach((n) => {
        const dirMul = n.reverse ? -1 : 1;
        const travelled =
          ((elapsed / 1000 / n.duration) * 360 * dirMul) % 360;
        const nodeAngle = (((n.angle + travelled) % 360) + 360) % 360;
        let diff = Math.abs(nodeAngle - scanAngle);
        if (diff > 180) diff = 360 - diff;
        const ref = nodeRefs.current[n.id];
        if (ref) {
          if (diff < HIT_WINDOW_DEG) ref.classList.add(styles.scanHit);
          else ref.classList.remove(styles.scanHit);
        }

        const labelEl = labelRefs.current[n.id];
        if (labelEl) {
          const dist = labelDistanceFor(n);
          const rad = (nodeAngle * Math.PI) / 180;
          const dx = Math.cos(rad) * dist;
          const dy = Math.sin(rad) * dist;
          labelEl.setAttribute(
            "transform",
            `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`
          );
        }
      });

      raf.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(el);

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const handleActivate = (id: string) => {
    setBurst(id);
    setCoreFlash(true);
    window.setTimeout(() => setCoreFlash(false), 750);
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.radarSweep} />

      <svg
        className={styles.svg}
        viewBox="0 0 460 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Animated Singularity core visualization"
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3ffce" stopOpacity="1" />
            <stop offset="30%" stopColor="#c8f135" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c8f135" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        <g ref={parallaxRef} className={styles.parallax}>
          <g className={styles.graticule}>
            <line x1={CENTER} y1={0} x2={CENTER} y2={460} />
            <line x1={0} y1={CENTER} x2={460} y2={CENTER} />
          </g>

          <ellipse
            className={styles.ringC}
            cx={CENTER}
            cy={CENTER}
            rx={RING_RADII.outer}
            ry={RING_RADII.outer}
            filter="url(#softBlur)"
          />
          <ellipse
            className={styles.ringB}
            cx={CENTER}
            cy={CENTER}
            rx={RING_RADII.mid}
            ry={RING_RADII.mid}
          />
          <ellipse
            className={styles.ringA}
            cx={CENTER}
            cy={CENTER}
            rx={RING_RADII.inner}
            ry={RING_RADII.inner}
          />

          <g className={styles.ticks}>
            {TICKS.map((t) => {
              const outer = polar(t.angle, RING_RADII.outer);
              const inner = polar(t.angle, RING_RADII.outer - (t.major ? 16 : 8));
              return (
                <line
                  key={`tick-${t.angle}`}
                  className={t.major ? styles.tickMajor : styles.tick}
                  x1={CENTER + outer.x}
                  y1={CENTER + outer.y}
                  x2={CENTER + inner.x}
                  y2={CENTER + inner.y}
                />
              );
            })}
          </g>

          <circle className={styles.energyPulse} cx={CENTER} cy={CENTER} r={20} />

          {PARTICLES.map((p) => (
            <g
              key={p.id}
              className={styles.particleOrbit}
              style={
                {
                  "--start": `${p.a}deg`,
                  animationDuration: `${p.dur}s`,
                  animationDirection: p.drift > 0 ? "normal" : "reverse",
                  animationDelay: `${p.delay}s`,
                } as CSSProperties
              }
            >
              <circle
                className={styles.particle}
                cx={CENTER + p.r}
                cy={CENTER}
                r={p.id % 3 === 0 ? 1.6 : 1}
              />
            </g>
          ))}

          {NODES.map((n) => {
            const flowStyle =
              n.flowIndex !== undefined
                ? ({ "--flow-delay": `${n.flowIndex * 0.9}s` } as CSSProperties)
                : undefined;
            const isBurst = burst === n.id;
            const ringRadius = n.size + 7;

            const initDist = labelDistanceFor(n);
            const initRad = (n.angle * Math.PI) / 180;
            const initDx = Math.cos(initRad) * initDist;
            const initDy = Math.sin(initRad) * initDist;

            return (
              <g
                key={n.id}
                className={styles.orbit}
                style={
                  {
                    "--start": `${n.angle}deg`,
                    animationDuration: `${n.duration}s`,
                    animationDirection: n.reverse ? "reverse" : "normal",
                  } as CSSProperties
                }
              >
                <line
                  className={`${styles.connector} ${
                    hovered === n.id ? styles.connectorActive : ""
                  }`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER + n.radius}
                  y2={CENTER}
                />

                <circle
                  className={`${styles.packet} ${
                    n.flowIndex !== undefined ? styles.packetFlow : ""
                  }`}
                  r={1.8}
                  cx={CENTER}
                  cy={CENTER}
                  style={
                    {
                      "--radius": `${n.radius}px`,
                      ...flowStyle,
                    } as CSSProperties
                  }
                />

                {isBurst && (
                  <circle
                    className={styles.packetBurst}
                    r={2.6}
                    cx={CENTER}
                    cy={CENTER}
                    style={{ "--radius": `${n.radius}px` } as CSSProperties}
                    onAnimationEnd={() => setBurst(null)}
                  />
                )}

                <g transform={`translate(${CENTER + n.radius} ${CENTER})`}>
                  <g
                    className={styles.counter}
                    style={
                      {
                        animationDuration: `${n.duration}s`,
                        animationDirection: n.reverse ? "reverse" : "normal",
                      } as CSSProperties
                    }
                  >
                    <g
                      ref={(el) => {
                        nodeRefs.current[n.id] = el;
                      }}
                      className={`${styles.node} ${styles["tier-" + n.tier]} ${
                        hovered === n.id ? styles.nodeActive : ""
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-label={n.label}
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleActivate(n.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleActivate(n.id);
                        }
                      }}
                    >
                      <circle className={styles.nodeRing} r={ringRadius} />
                      <circle className={styles.nodeDot} r={n.size} />

                      <g className={styles.reticle}>
                        {reticleLines(ringRadius).map((l, i) => (
                          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
                        ))}
                      </g>

                      <text
                        ref={(el) => {
                          labelRefs.current[n.id] = el;
                        }}
                        className={styles.nodeLabel}
                        x={0}
                        y={0}
                        dominantBaseline="central"
                        textAnchor="middle"
                        transform={`translate(${initDx.toFixed(2)} ${initDy.toFixed(2)})`}
                      >
                        {n.label}
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            );
          })}

          <circle className={styles.coreGlow} cx={CENTER} cy={CENTER} r={92} fill="url(#coreGlow)" />
          <circle className={styles.coreLayer3} cx={CENTER} cy={CENTER} r={40} />
          <circle className={styles.coreLayer2} cx={CENTER} cy={CENTER} r={27} />
          <circle className={styles.coreLayer1} cx={CENTER} cy={CENTER} r={16} />
          <circle
            className={`${styles.core} ${coreFlash ? styles.coreFlash : ""}`}
            cx={CENTER}
            cy={CENTER}
            r={11}
          />
        </g>
      </svg>

      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <span className={`${styles.tag} ${styles.tagTopLeft}`}>
        <span className={styles.statusDot} />
        SYSTEM // ONLINE
      </span>
      <span className={`${styles.tag} ${styles.tagTopRight}`}>CORE // ACTIVE</span>
      <span className={`${styles.tag} ${styles.tagBottomLeft}`}>NODES // 06</span>
      <span className={`${styles.tag} ${styles.tagBottomRight}`}>
        <span className={styles.statusDot} />
        DATA // STREAMING
      </span>
    </div>
  );
}