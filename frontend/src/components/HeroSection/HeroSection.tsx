"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";

const TARGET_DATE = new Date("2026-08-15T09:00:00+05:30");

function useCountdown(target: Date) {
  const [time, setTime] = useState(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  });

  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  
  return time;
}

function Pad({ v, label }: { v: number; label: string }) {
  return (
    <div className={styles.unit}>
      <span className={styles.num}>{String(v).padStart(2, "0")}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function HeroSection() {
  const { days, hours, minutes, seconds } = useCountdown(TARGET_DATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const pts: { x: number; y: number; vx: number; vy: number; r: number }[] = Array.from(
      { length: 60 }, // Reduced slightly for better performance
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      })
    );

    let raf: number;
    let isVisible = true;

    const draw = () => {
      if (!isVisible) return; // Stop rendering when out of viewport
      ctx.clearRect(0, 0, w, h);
      // Draw lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(200,241,53,${0.08 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      // Draw dots
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,241,53,0.4)";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible) {
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className={styles.hero} id="home">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.topo} aria-hidden="true" />

      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.dot} />
          <span className={styles.badgeText}>AUG 15–17, 2026 &nbsp;·&nbsp; 36 HOURS &nbsp;·&nbsp; INDIA</span>
        </div>


        <p className={styles.sub}>
          Singularity Hack is a 36-hour national inter-college hackathon where the
          brightest minds compete, collaborate, and create solutions that matter.
        </p>

        {/* Countdown */}
        <div className={styles.countdown}>
          <Pad v={mounted ? days : 0} label="DAYS" />
          <span className={styles.colon}>:</span>
          <Pad v={mounted ? hours : 0} label="HRS" />
          <span className={styles.colon}>:</span>
          <Pad v={mounted ? minutes : 0} label="MIN" />
          <span className={styles.colon}>:</span>
          <Pad v={mounted ? seconds : 0} label="SEC" />
        </div>

        {/* CTAs */}
        <div className={styles.ctas}>
          <Link href="/register" className="btn btn-primary">
            INIT_REGISTER →
          </Link>
          <a href="#about" className="btn btn-outline">
            LEARN MORE
          </a>
        </div>

        {/* Stats strip */}
        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statNum}>₹1L+</span><span className={styles.statLabel}>Prize Pool</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>500+</span><span className={styles.statLabel}>Participants</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>50+</span><span className={styles.statLabel}>Colleges</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>4</span><span className={styles.statLabel}>Tracks</span></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>SCROLL</span>
      </div>
    </section>
  );
}
