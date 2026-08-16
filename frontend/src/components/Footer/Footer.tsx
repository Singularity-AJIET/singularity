"use client";
import { useState, useEffect } from "react";

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


const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/singularity__2026?igsh=dndmMDFlMmxjeGY0", icon: <InstagramIcon size={20} />, tooltip: "Instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/enigma-cse", icon: <LinkedinIcon size={20} />, tooltip: "LinkedIn" },
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
        <div className={styles.ctaInner}>
          <div className={styles.ctaLabel}>{"//"} ready to build?</div>
          <p className={styles.ctaTitle}>THE CLOCK IS</p>
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
          <a href="https://unstop.com/o/6Y45JWH?lb=useYshOh&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Singuaji95983" target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${styles.ctaBtn}`} aria-label="INIT_REGISTER - Register for Singularity 2026 hackathon on Unstop">
            INIT_REGISTER
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          {/* Logo */}
          <div className={styles.logoCol}>
            <div className={styles.logo}>
              <Image src="/logo.webp" alt="Singularity" width={40} height={40} />
              <span>SINGULARITY</span>
            </div>
            <p className={styles.logoSub}>
              [sys.log]: Building tomorrow&apos;s solutions<br />
              today — one idea at a time.
            </p>
            <a href="mailto:singularity@ajiet.edu.in" className={styles.emailLink}>
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
          <nav className={styles.col} aria-label="Footer navigation">
            <div className={styles.colTitle}>DIRECTORY</div>
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className={styles.footerLink}>
                &gt; {l.label}
              </a>
            ))}
          </nav>

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