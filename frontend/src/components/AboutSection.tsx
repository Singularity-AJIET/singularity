"use client";
import { useEffect, useRef, useState } from "react";
import { Zap, Target, Users, Trophy } from "lucide-react";
import styles from "./AboutSection.module.css";

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
  { icon: <Zap size={28} color="#c8f135" />, title: "Build Fast", desc: "36 hours of non-stop hacking, fuelled by caffeine, code, and community." },
  { icon: <Target size={28} color="#c8f135" />, title: "Real Problems", desc: "Pick a track that matters and build something the world actually needs." },
  { icon: <Users size={28} color="#c8f135" />, title: "Connect", desc: "Network with peers from 50+ colleges, mentors, and industry professionals." },
  { icon: <Trophy size={28} color="#c8f135" />, title: "Win Big", desc: "Over ₹1,00,000 in prizes across multiple categories and tracks." },
];

export default function AboutSection() {
  return (
    <section id="about" className={styles.about}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// about the event</div>
          <h2 className="section-title">
            WHAT IS<br />
            <span className="text-lime">SINGULARITY HACK?</span>
          </h2>
          <p className="section-sub">
            Singularity Hack is a national inter-college hackathon where students
            from across India converge to solve real-world problems in 36 hours.
            It&apos;s not just a competition — it&apos;s a movement.
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNum}><CountUp target={500} suffix="+" /></span>
            <span className={styles.statLabel}>Participants</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}><CountUp target={50} suffix="+" /></span>
            <span className={styles.statLabel}>Colleges</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}><CountUp target={36} /></span>
            <span className={styles.statLabel}>Hours of Hacking</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>₹<CountUp target={100000} />+</span>
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
