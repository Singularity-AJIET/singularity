"use client";
import { useState, useEffect, useRef } from "react";
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
const UNSTOP_URL = "https://unstop.com/o/6Y45JWH?lb=useYshOh&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Singuaji95983";

const STATS = ["24HRS", "HACKATHON", "AJIET", "MANGALORE","INNOVATE","BUILD"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";

export default function Navbar({ hideLogo }: { hideLogo?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statIdx, setStatIdx] = useState(0);
  const [display, setDisplay] = useState(STATS[0]);
  const [paused, setPaused] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section by observing each section's intersection with the viewport
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("/#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
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

  // Lock body scroll while the mobile overlay is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <a
            href="#"
            draggable={false}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMenuOpen(false);
            }}
            className={styles.logo}
            style={hideLogo ? { opacity: 0 } : { transition: "opacity 0.5s ease" }}
          >
            <Image src="/logo.webp" alt="Singularity" width={40} height={40} className={styles.logoIcon} draggable={false} />
            <span>SINGULARITY</span>
          </a>

          {/* Desktop links */}
          <ul className={styles.links}>
            {NAV_LINKS.map((l) => {
              const sectionId = l.href.replace("/#", "");
              const isActive = activeSection === sectionId;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                    onClick={() => setActiveSection(sectionId)}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right side: system identity + system command (desktop only) */}
          <div className={styles.navActions}>
            <div
              className={styles.termDisplay}
              onMouseEnter={() => {
                setDisplay(STATS[statIdx]);
                setPaused(true);
              }}
              onMouseLeave={() => setPaused(false)}
            >
              <span className={styles.termPrefix}>&gt;__&nbsp;</span>
              <span className={styles.termText}>{display}</span>
            </div>
            <a
              href={UNSTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.registerBtn}
            >
              <span className={styles.registerCornerTR} aria-hidden="true" />
              <span className={styles.registerSweep} aria-hidden="true" />
              <span className={styles.registerLabel}>REGISTER</span>
              <span className={styles.registerCornerBL} aria-hidden="true" />
            </a>
          </div>

          {/* Mobile menu trigger — [☰] morphs into [×] */}
          <button
            className={`${styles.menuTrigger} ${menuOpen ? styles.menuTriggerOpen : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.triggerIconWrap}>
              <span className={`${styles.triggerLine} ${styles.triggerLineTop}`} />
              <span className={`${styles.triggerLine} ${styles.triggerLineMid}`} />
              <span className={`${styles.triggerLine} ${styles.triggerLineBottom}`} />
            </span>
          </button>
        </div>
      </nav>

      {/*
        Mobile full-screen navigation console.
        IMPORTANT: this is a SIBLING of <nav>, not a child.
        .nav has backdrop-filter, which creates a new containing block
        for any position:fixed descendant. If this overlay stayed nested
        inside <nav>, its "inset: 0" would resolve against .nav's own
        (tiny, ~70px) box instead of the viewport — which is why it was
        invisible. Keeping it outside <nav> lets position:fixed work
        against the real viewport again.
      */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ""}`}>
        <div className={styles.mobileOverlayInner}>
          <div className={styles.mobileCenterGroup}>
            <ul className={styles.mobileNavList}>
              {NAV_LINKS.map((l, i) => (
                <li
                  key={l.href}
                  className={styles.mobileNavItem}
                  style={{ transitionDelay: menuOpen ? `${80 + i * 55}ms` : "0ms" }}
                >
                  <a
                    href={l.href}
                    className={styles.mobileNavLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className={styles.mobileNavIndex}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.mobileNavLabel}>{l.label}</span>
                    <span className={styles.mobileNavArrow} aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={UNSTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileRegisterCmd}
              style={{ transitionDelay: menuOpen ? `${140 + NAV_LINKS.length * 55}ms` : "0ms" }}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.mobileRegisterCornerTR} aria-hidden="true" />
              <span className={styles.mobileRegisterLabel}>REGISTER</span>

              <span className={styles.mobileRegisterCornerBL} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.mobileFooter}>SYSTEM&nbsp;//&nbsp;NAVIGATION</div>
        </div>
      </div>
    </>
  );
}