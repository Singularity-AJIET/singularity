"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./CoordinatorsSection.module.css";

// Inline SVG social icons
const GithubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const COORDINATORS = [
  { name: "Dr. John Smith", role: "Faculty Coordinator", seed: "John", color: "#a78bfa", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Prof. Emily Davis", role: "Faculty Coordinator", seed: "Emily", color: "#a78bfa", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Alex Mercer", role: "Lead Organizer", seed: "Alex", color: "#c8f135", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Sarah Chen", role: "Lead Organizer", seed: "Sarah", color: "#ff6b6b", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "David Kim", role: "Lead Organizer", seed: "David", color: "#4ecdc4", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Maya Patel", role: "Lead Organizer", seed: "Maya", color: "#ffe66d", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "James Wilson", role: "Technical Head", seed: "James", color: "#ff8ed4", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Elena Rodriguez", role: "Community Lead", seed: "Elena", color: "#845ec2", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Michael Chang", role: "Sponsorship Lead", seed: "Michael", color: "#ffb830", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Sophia Martinez", role: "Design Lead", seed: "Sophia", color: "#ff2d6f", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Daniel Lee", role: "Web Developer", seed: "Daniel", color: "#c8f135", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Olivia Taylor", role: "Marketing Executive", seed: "Olivia", color: "#ff6b6b", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "William Brown", role: "Logistics Coordinator", seed: "William", color: "#4ecdc4", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Ava Wilson", role: "Event Manager", seed: "Ava", color: "#ffe66d", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Matthew Evans", role: "Social Media Manager", seed: "Matthew", color: "#ff8ed4", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Emma Thomas", role: "Content Writer", seed: "Emma", color: "#845ec2", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Joshua Garcia", role: "Security Lead", seed: "Joshua", color: "#ffb830", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Mia Robinson", role: "PR Executive", seed: "Mia", color: "#ff2d6f", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Christopher Clark", role: "Hospitality Head", seed: "Christopher", color: "#c8f135", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Isabella Lewis", role: "Speaker Coordinator", seed: "Isabella", color: "#ff6b6b", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Andrew Walker", role: "Videographer", seed: "Andrew", color: "#4ecdc4", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
  { name: "Amelia Hall", role: "Volunteer Lead", seed: "Amelia", color: "#ffe66d", github: "https://github.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com" },
];

export default function CoordinatorsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastScrollTime = useRef(0);

  // Drag state for the active polaroid
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: dragPos.x,
      startY: dragPos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setDragPos({ x: dragStartRef.current.startX + dx, y: dragStartRef.current.startY + dy });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // Snap back to stand position
    setDragPos({ x: 0, y: 0 });
    dragStartRef.current = null;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? COORDINATORS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % COORDINATORS.length);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    // 500ms debounce to prevent rapid scrolling through everyone at once
    if (now - lastScrollTime.current < 500) return;
    
    if (e.deltaY > 30 || e.deltaX > 30) {
      handleNext();
      lastScrollTime.current = now;
    } else if (e.deltaY < -30 || e.deltaX < -30) {
      handlePrev();
      lastScrollTime.current = now;
    }
  };

  // Calculates the relative offset from the current index with infinite wrap-around
  const getOffset = (index: number) => {
    const diff = index - currentIndex;
    const half = COORDINATORS.length / 2;
    if (diff > half) return diff - COORDINATORS.length;
    if (diff < -half) return diff + COORDINATORS.length;
    return diff;
  };

  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % COORDINATORS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isDragging]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <section className={styles.section} id="coordinators">
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// the team</div>
          <h2 className="section-title">MEET THE <span className="text-lime">CREW</span></h2>
          <p className="section-sub" style={{ textTransform: "lowercase", opacity: 0.7 }}>interact to explore the roster.</p>
        </div>

        <div className={styles.carouselContainer}>
          {/* Screen Area */}
          <div className={styles.screen} onWheel={handleWheel}>
            {/* Background elements */}
            <div className={styles.uiOverlay}>
               <div className={styles.uiTopLeft}>SYS.ADMIN // CREW_ROSTER</div>
               <div className={styles.uiTopRight}>V 1.0.4</div>
               <div className={styles.uiBottomLeft}>LNK_ESTABLISHED</div>
               <div className={styles.uiBottomRight}>[ REC ] <span className={styles.blinker}></span></div>
               <div className={styles.crosshair}>+</div>
            </div>

            {COORDINATORS.map((coord, index) => {
              const offset = getOffset(index);
              const absOffset = Math.abs(offset);
              
              // Render only the immediate surrounding items to save DOM performance
              // Since it's infinite, anything further away than 2 units is hidden anyway
              if (absOffset > 2) return null;

              return (
                <div 
                  key={coord.name} 
                  className={styles.slideInner} 
                  style={{ 
                    "--offset": offset,
                    "--scale": offset === 0 ? 1 : Math.max(0.7, 0.85 - (absOffset * 0.1)),
                    "--opacity": offset === 0 ? 1 : Math.max(0, 0.4 - (absOffset * 0.2)),
                    "--zIndex": 100 - absOffset,
                    "--pointerEvents": offset === 0 ? "all" : "none",
                    "--accent": coord.color 
                  } as React.CSSProperties}
                >
                  <div className={styles.avatarWrapper}>
                  {/* Floating polaroid card — draggable */}
                    <div
                      className={`${styles.polaroid} ${isDragging && offset === 0 ? styles.polaroidDragging : ""}`}
                      data-label={coord.name.toUpperCase()}
                      style={offset === 0 ? {
                        transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
                        cursor: isDragging ? "grabbing" : "grab",
                        transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        userSelect: "none",
                      } : {}}
                      onPointerDown={offset === 0 ? handlePointerDown : undefined}
                      onPointerMove={offset === 0 ? handlePointerMove : undefined}
                      onPointerUp={offset === 0 ? handlePointerUp : undefined}
                      onPointerCancel={offset === 0 ? handlePointerUp : undefined}
                    >
                      <img
                        src={`https://api.dicebear.com/8.x/micah/svg?seed=${coord.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`}
                        alt={coord.name}
                        className={styles.avatar}
                        draggable={false}
                      />
                    </div>
                    {/* 3D Platform */}
                    <div className={`${styles.platform} ${isDragging && offset === 0 ? styles.platformOff : ""}`}></div>
                    {/* Ground glow */}
                    <div className={`${styles.groundGlow} ${isDragging && offset === 0 ? styles.groundGlowOff : ""}`}></div>
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.name}>{coord.name}</h3>
                    <p className={styles.role}>{coord.role}</p>
                    <div className={styles.socials}>
                      <a href={coord.github} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="GitHub" onClick={e => e.stopPropagation()}>
                        <GithubIcon />
                      </a>
                      <a href={coord.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram" onClick={e => e.stopPropagation()}>
                        <InstagramIcon />
                      </a>
                      <a href={coord.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="LinkedIn" onClick={e => e.stopPropagation()}>
                        <LinkedinIcon />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Dots inside Screen */}
            <div className={styles.pagination}>
              {COORDINATORS.map((coord, index) => (
                <button
                  key={`dot-${index}`}
                  className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
                  style={{ "--accent-lime": coord.color } as React.CSSProperties}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  aria-label={`Go to ${coord.name}`}
                  title={coord.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
