"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./AboutSection.module.css";
import { Rocket, Lightbulb, Handshake, Trophy } from "lucide-react";
import SingularityCore from "./SingularityCore";


function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = target / 60;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(id); }
          else setVal(Math.floor(start));
        }, 16);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

const PILLARS = [
  {
    icon: <Rocket size={28} color="#c8f135" />,
    title: "Build Fast",
    desc: "24 hours of non-stop hacking, fuelled by caffeine, code, and community.",
  },
  {
    icon: <Lightbulb size={28} color="#c8f135" />,
    title: "Real Problems",
    desc: "Pick a track that matters and build something the world actually needs.",
  },
  {
    icon: <Handshake size={28} color="#c8f135" />,
    title: "Connect",
    desc: "Network with peers from 100+ colleges, mentors, and industry professionals.",
  },
  {
    icon: <Trophy size={28} color="#c8f135" />,
    title: "Win Big",
    desc: "Over ₹60k+ in prizes across multiple tracks.",
  },
];

export default function AboutSection() {
  // FIX (visual not lining up with the paragraph): a fixed pixel size
  // for the radar visual can only ever match the header text block by
  // coincidence — the paragraph's rendered height shifts with viewport
  // width, font loading, etc. Instead we measure the header block's
  // actual height and expose it as a CSS custom property, so the
  // visual's height (see .wrap in SingularityCore.module.css) always
  // matches it exactly: top at "// ABOUT THE EVENT", bottom at the end
  // of "...IEEE Mangalore Subsection." — on any screen size.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

 const update = () => {
  const h = Math.round(el.getBoundingClientRect().height);
  setHeaderHeight((prev) => (prev !== null && Math.abs(prev - h) <= 1 ? prev : h));
};
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const gridStyle = headerHeight
    ? ({ "--header-h": `${headerHeight}px` } as CSSProperties)
    : undefined;

  return (
    <section id="about" className={styles.about}>
      <div className="section">
        {/* ===== Everything below is unchanged content, now placed into
            named grid areas so it can be laid out beside (desktop) or
            around (mobile) the new visual — no content was altered. ===== */}
        <div className={styles.aboutGrid} style={gridStyle}>
          <div className={styles.header} ref={headerRef}>
            <div className="section-label">{"//"} about the event</div>
            <h2 className="section-title">
              WHAT IS <br />
              <span className="text-lime">SINGULARITY?</span>
            </h2>
            <p className={`section-sub ${styles.description}`}>
              <b>Singularity</b> is a <span className="font-family-serif">24-hour</span> national-level hackathon
              bringing students together to solve real-world problems, build innovative solutions,
              and turn ideas into working prototypes, organised by the
              <b> Dept. of Computer Science & Engineering</b> along with <b>Placement Cell</b> at
              <b> A J Institute of Engineering and Technology, Mangalore</b> in collaboration with
              <b> IEEE Computer Society</b> and <b>IEEE Mangalore Subsection.</b>
              {/* <b> 24 Hours. One campus. Endless possibilities.</b> */}
            </p>
          </div>

          {/* ===== NEW: right-side interactive visual ===== */}
          <div className={styles.visualWrap}>
            <SingularityCore />
          </div>

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNum}><CountUp target={150} suffix="+" /></span>
              <span className={styles.statLabel}>Participants</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}><CountUp target={100} suffix="+" /></span>
              <span className={styles.statLabel}>Colleges</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}><CountUp target={24} /></span>
              <span className={styles.statLabel}>Hours of Hacking</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNum}>₹<CountUp target={60} />k+</span>
              <span className={styles.statLabel}>Prize Pool</span>
            </div>
          </div>

          {/* Pillars */}
          <div className={`grid-4 ${styles.pillars}`}>
            {PILLARS.map((p) => (
              <div key={p.title} className={`card ${styles.pillar}`}>
                <span className={styles.icon}>{p.icon}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}