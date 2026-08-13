"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Camera, Briefcase, Gamepad2 } from "lucide-react";
import styles from "./Footer.module.css";

const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Prizes", href: "/#prizes" },
  { label: "Schedule", href: "/#schedule" },
  { label: "Coordinators", href: "/#coordinators" },
  { label: "FAQ", href: "/#faq" },
];

const SOCIAL = [
  { label: "Twitter / X", href: "https://x.com", icon: <MessageCircle size={20} /> },
  { label: "Instagram", href: "https://instagram.com", icon: <Camera size={20} /> },
  { label: "LinkedIn", href: "https://linkedin.com", icon: <Briefcase size={20} /> },
  { label: "Discord", href: "https://discord.com", icon: <Gamepad2 size={20} /> },
];

const TARGET = new Date("2026-08-15T09:00:00").getTime();

function computeTimeLeft() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function Footer() {
  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(computeTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <footer className={styles.footer}>
      <div className={styles.cta}>
        <div className="section" style={{ textAlign: "center", alignItems: "center" }}>
          <div className="section-label" style={{ marginBottom: 16 }}>// ready to build?</div>
          <h2 className={styles.ctaTitle}>THE CLOCK IS</h2>
          <div className={styles.countdown}>
            <div className={styles.unit}><span className={styles.num} suppressHydrationWarning>{pad(timeLeft.d)}</span><span className={styles.unitLabel}>DAYS</span></div>
            <span className={styles.colon}>:</span>
            <div className={styles.unit}><span className={styles.num} suppressHydrationWarning>{pad(timeLeft.h)}</span><span className={styles.unitLabel}>HRS</span></div>
            <span className={styles.colon}>:</span>
            <div className={styles.unit}><span className={styles.num} suppressHydrationWarning>{pad(timeLeft.m)}</span><span className={styles.unitLabel}>MIN</span></div>
            <span className={styles.colon}>:</span>
            <div className={styles.unit}><span className={styles.num} suppressHydrationWarning>{pad(timeLeft.s)}</span><span className={styles.unitLabel}>SEC</span></div>
          </div>
          <p className={styles.ctaSub}>
            24 hours. 3 tracks. ₹60,000+ in prizes. No excuses.
          </p>
          <Link href="/register" className={`btn btn-primary ${styles.ctaBtn}`}>
            INIT_REGISTER
          </Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          {/* Logo */}
          <div className={styles.logoCol}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>&gt;_</span>
              <span>SINGULARITY</span>
            </div>
            <p className={styles.logoSub}>
              [sys.log]: Building tomorrow&apos;s solutions<br />
              today — one hack at a time.
            </p>
            <div className={styles.social}>
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={styles.socialBtn} aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className={styles.col}>
            <div className={styles.colTitle}>DIRECTORY</div>
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className={styles.footerLink}>
                &gt; {l.label}
              </a>
            ))}
          </div>

          {/* Polaroid Window Art */}
          <div className={styles.artCol}>
            <div className={styles.polaroid}>
              <div className={styles.polaroidInner}>
                {/* Glowing black hole animation */}
                <div className={styles.blackHole}>
                  <div className={styles.accretionDisk}></div>
                  <div className={styles.eventHorizon}></div>
                  <div className={styles.photonRing}></div>
                </div>
              </div>
              <div className={styles.polaroidCaption}>
                <span className={styles.captionDot}></span>
                SYS_SINGULARITY
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bar}>
          <span className={styles.barLeft}>
            @singularity-hack:~# 2026 copyright initialized.
          </span>
          <span className={styles.barRight}>
            status: <span className={styles.statusDot}>operational_</span>
          </span>
        </div>
      </div>

      {/* FOOTER ANIMATION SECTION */}
      <div className={styles.animationSection}>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
          </div>
          <div className={styles.marqueeContent} aria-hidden>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
