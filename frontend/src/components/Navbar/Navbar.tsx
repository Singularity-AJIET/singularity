"use client";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/#prizes", label: "Prizes" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/#coordinators", label: "Coordinators" },
  { href: "/#faq", label: "FAQ" },
];

const STATS = ["36 HRS", "₹1L+ PRIZES", "4 TRACKS", "AUG 15", "HACK_ON"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";

export default function Navbar({ hideLogo }: { hideLogo?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [display, setDisplay] = useState(STATS[0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cycle stats
  useEffect(() => {
    const id = setInterval(() => {
      setStatIdx((i) => (i + 1) % STATS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Scramble text on stat change
  useEffect(() => {
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
  }, [statIdx]);

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
          <span className={styles.logoIcon}>&gt;_</span>
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

        {/* Scramble display — no container, pure terminal text */}
        <div className={styles.termDisplay}>
          <span className={styles.termPrefix}>&gt;_&nbsp;</span>
          <span className={styles.termText}>{display}</span>
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
        </div>
      )}
    </nav>
  );
}
