"use client";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/#prizes", label: "Prizes" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#coordinators", label: "Coordinators" },
  { href: "/#faq", label: "FAQ" },
];

// TODO: replace with your actual Unstop event registration URL
const UNSTOP_URL = "https://unstop.com/";

const STATS = ["24HRS", "HACKATHON", "AJIET", "MANGALORE"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";

export default function Navbar({ hideLogo }: { hideLogo?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [display, setDisplay] = useState(STATS[0]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cycle stats — paused while hovered
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setStatIdx((i) => (i + 1) % STATS.length);
    }, 2400);
    return () => clearInterval(id);
  }, [paused]);

  // Scramble text on stat change — skipped while paused
  useEffect(() => {
    if (paused) return;
    const target = STATS[statIdx];
    let frame = 0;
    const total = 10;
    const id = setInterval(() => {
      if (frame >= total) {
        setDisplay(target);
        clearInterval(id);
        return;
      }
      setDisplay(
        target
          .split("")
          .map((ch, i) =>
            frame > total - i - 2
              ? ch
              : ch === " " || ch === "_" || ch === "+" || ch === "₹"
              ? ch
              : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join("")
      );
      frame++;
    }, 32);
    return () => clearInterval(id);
  }, [statIdx, paused]);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className={styles.logo}
          style={hideLogo ? { opacity: 0 } : { transition: "opacity 0.5s ease" }}
        >
          <Image src="/logo.webp" alt="Singularity" width={40} height={40} className={styles.logoIcon} />
          <span>SINGULARITY</span>
        </a>

        {/* Desktop links */}
        <ul className={styles.links}>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={styles.link}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Right side: scramble stat + register button */}
        <div className={styles.navActions}>
          {/* Scramble display — pauses on hover */}
          <div
            className={styles.termDisplay}
            onMouseEnter={() => {
              setDisplay(STATS[statIdx]); // snap to the clean word immediately, even mid-scramble
              setPaused(true);
            }}
            onMouseLeave={() => setPaused(false)}
          >
            <span className={styles.termPrefix}>&gt;_&nbsp;</span>
            <span className={styles.termText}>{display}</span>
          </div>

          {/* Register button — links out to Unstop */}
          <a
            href={UNSTOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.registerBtn}
          >
            INIT_REGISTER
          </a>
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.barOpen : styles.bar} />
          <span className={menuOpen ? styles.barOpen2 : styles.bar} />
          <span className={menuOpen ? styles.barOpen3 : styles.bar} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={UNSTOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileRegisterBtn}
            onClick={() => setMenuOpen(false)}
          >
            INIT_REGISTER
          </a>
        </div>
      )}
    </nav>
  );
}