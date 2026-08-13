"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Prizes", href: "/#prizes" },
  { label: "Schedule", href: "/#schedule" },
  { label: "Coordinators", href: "/#coordinators" },
  { label: "FAQ", href: "/#faq" },
];

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const SOCIAL = [
  { label: "Twitter / X", href: "https://x.com", icon: <XIcon size={20} />, tooltip: "Twitter / X" },
  { label: "Instagram", href: "https://instagram.com", icon: <InstagramIcon size={20} />, tooltip: "Instagram" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: <LinkedinIcon size={20} />, tooltip: "LinkedIn" },
  { label: "Discord", href: "https://discord.com", icon: <DiscordIcon size={20} />, tooltip: "Discord" },
];

const TARGET = new Date("2026-09-17T09:00:00+05:30").getTime();

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
          <div className="section-label" style={{ marginBottom: 16 }}>{"//"} ready to build?</div>
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
              <Image src="/logo.webp" alt="Singularity" width={40} height={40} draggable={false} />
              <span>SINGULARITY</span>
            </div>
            <p className={styles.logoSub}>
              [sys.log]: Building tomorrow&apos;s solutions<br />
              today — one idea at a time.
            </p>
            <a href="https://mail.google.com/mail/?view=cm&to=singularity@ajiet.edu.in" target="_blank" rel="noopener noreferrer" className={styles.emailLink}>
              singularity@ajiet.edu.in
            </a>
            <div className={styles.social}>
              {SOCIAL.map((s) => {
                const isMailLink = s.href.startsWith("mailto:");

                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={isMailLink ? undefined : "_blank"}
                    rel={isMailLink ? undefined : "noopener noreferrer"}
                    className={styles.socialBtn}
                    aria-label={s.label}
                    data-label={s.tooltip ?? s.label}
                  >
                    {s.icon}
                  </a>
                );
              })}
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
            <span className={styles.copyrightSymbol}>©</span> 2026 Singularity — All rights reserved.
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
