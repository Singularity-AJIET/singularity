"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./AboutSection.module.css";
import { Rocket, Lightbulb, Handshake, Trophy } from "lucide-react";


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
  return (
    <section id="about" className={styles.about}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// about the event</div>
          <h2 className="section-title">
            WHAT IS <br />
            <span className="text-lime">SINGULARITY?</span>
          </h2>
          <p className={`section-sub ${styles.description}`}>
            <b>Singularity</b> — A <span className="font-family-serif">24-hour</span> national-level hackathon
            bringing students together to solve real-world problems, build innovative solutions,
            and turn ideas into working prototypes, organised by the
            <b> Computer Science and Engineering Dept.</b> in collaboration with
            <b> IEEE Computer Society</b>, <b>IEEE Mangalore Subsection</b>, and the
            <b> Placement Cell</b> at
            <b> A.J. Institute of Engineering and Technology, Mangalore</b>.
            {/* <b> 24 Hours. One campus. Endless possibilities.</b> */}
          </p>
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
    </section>
  );
}
