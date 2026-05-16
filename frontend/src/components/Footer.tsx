"use client";
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

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.cta}>
        <div className="section" style={{ textAlign: "center", alignItems: "center" }}>
          <div className="section-label" style={{ marginBottom: 16 }}>// ready to build?</div>
          <h2 className={styles.ctaTitle}>
            THE CLOCK IS<br />
            <span className="text-lime">ALREADY TICKING.</span>
          </h2>
          <p className={styles.ctaSub}>
            36 hours. 4 tracks. ₹1,00,000+ in prizes. No excuses.
          </p>
          <Link href="/register" className={`btn btn-primary ${styles.ctaBtn}`}>
            INIT_REGISTER →
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

          {/* System links */}
          <div className={styles.col}>
            <div className={styles.colTitle}>SYSTEM</div>
            <a href="#" className={styles.footerLink}># Privacy Policy</a>
            <a href="#" className={styles.footerLink}># Terms of Service</a>
            <a href="#" className={styles.footerLink}># Code of Conduct</a>
            <a href="mailto:hello@singularityhack.in" className={styles.footerLink}>
              # Contact Us
            </a>
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

      {/* MASSIVE ANIMATION SECTION */}
      <div className={styles.animationSection}>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
            <span>SINGULARITY</span>
            <span className={styles.marqueeOutline}>SINGULARITY</span>
          </div>
          <div className={styles.marqueeContent}>
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
