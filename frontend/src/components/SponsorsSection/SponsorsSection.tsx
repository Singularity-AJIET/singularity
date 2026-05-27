"use client";
import { Diamond, Circle, Square } from "lucide-react";
import styles from "./SponsorsSection.module.css";

const SPONSORS = {
  platinum: [
    { 
      name: "TechCorp India", 
      desc: "Leading cloud infrastructure and AI solutions provider powering the next generation of scalable tech.",
      link: "techcorp.in", 
      icon: <Diamond size={28} color="#4ecdc4" fill="#4ecdc4" /> 
    },
    { 
      name: "NovaSystems", 
      desc: "Enterprise cybersecurity and data protection platform. Building secure systems for modern enterprises.",
      link: "novasystems.io", 
      icon: <Diamond size={28} color="#4ecdc4" fill="#4ecdc4" /> 
    },
  ],
  gold: [
    { name: "BuildFast", desc: "The ultimate CI/CD deployment platform.", link: "buildfast.dev", icon: <Circle size={24} color="#ffb830" fill="#ffb830" /> },
    { name: "CloudStack", desc: "Serverless databases and auth for rapid MVPs.", link: "cloudstack.co", icon: <Circle size={24} color="#ffb830" fill="#ffb830" /> },
    { name: "DataPulse", desc: "Real-time analytics and monitoring.", link: "datapulse.ai", icon: <Circle size={24} color="#ffb830" fill="#ffb830" /> },
  ],
  community: [
    { name: "HackerEarth", desc: "Developer assessment platform.", link: "hackerearth.com", icon: <Square size={20} color="#a78bfa" fill="#a78bfa" /> },
    { name: "Devfolio", desc: "Hackathon hosting platform.", link: "devfolio.co", icon: <Square size={20} color="#a78bfa" fill="#a78bfa" /> },
    { name: "GitHub Education", desc: "Student developer packs and tools.", link: "education.github.com", icon: <Square size={20} color="#a78bfa" fill="#a78bfa" /> },
    { name: "JetBrains", desc: "Professional IDEs for developers.", link: "jetbrains.com", icon: <Square size={20} color="#a78bfa" fill="#a78bfa" /> },
  ],
};

export default function SponsorsSection() {
  return (
    <section id="sponsors" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// made possible by</div>
          <h2 className="section-title">
            OUR <span className="text-lime">SPONSORS</span>
          </h2>
          <p className="section-sub">
            Singularity Hack is proudly supported by industry leaders who believe
            in the next generation of builders.
          </p>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>Platinum Sponsors</div>
          <div className={`${styles.tierGrid} ${styles.gridPlatinum}`}>
            {SPONSORS.platinum.map((s) => (
              <div key={s.name} className={`${styles.card} ${styles.platinum}`}>
                <div className={styles.sTop}>
                  <span className={styles.sEmoji}>{s.icon}</span>
                  <span className={styles.sName}>{s.name}</span>
                </div>
                <p className={styles.sDesc}>{s.desc}</p>
                <a href={`https://${s.link}`} target="_blank" rel="noopener noreferrer" className={styles.sLink}>{s.link} ↗</a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>Gold Sponsors</div>
          <div className={`${styles.tierGrid} ${styles.gridGold}`}>
            {SPONSORS.gold.map((s) => (
              <div key={s.name} className={`${styles.card} ${styles.gold}`}>
                <div className={styles.sTop}>
                  <span className={styles.sEmoji}>{s.icon}</span>
                  <span className={styles.sName}>{s.name}</span>
                </div>
                <p className={styles.sDesc}>{s.desc}</p>
                <a href={`https://${s.link}`} target="_blank" rel="noopener noreferrer" className={styles.sLink}>{s.link} ↗</a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>Community Partners</div>
          <div className={`${styles.tierGrid} ${styles.gridCommunity}`}>
            {SPONSORS.community.map((s) => (
              <div key={s.name} className={`${styles.card} ${styles.community}`}>
                <div className={styles.sTop}>
                  <span className={styles.sEmoji}>{s.icon}</span>
                  <span className={styles.sName}>{s.name}</span>
                </div>
                <p className={styles.sDesc}>{s.desc}</p>
                <a href={`https://${s.link}`} target="_blank" rel="noopener noreferrer" className={styles.sLink}>{s.link} ↗</a>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
