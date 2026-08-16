"use client";
import { Bot, Link as LinkIcon, Globe } from "lucide-react";
import styles from "./TracksSection.module.css";

const THEME = {
  name: "COMPETITION TRACKS",
  description: "Dive deep into the realm of Artificial Intelligence and explore its frontiers across three core tracks. Participants will be challenged to build innovative solutions that push the boundaries of modern technology. The exact problem statements for each track will be exclusively revealed on the day of the hackathon."
};

const TRACKS = [
  {
    id: "ps1",
    name: "Coastal Intelligence",
    icon: <Globe size={32} />,
    color: "#00d2ff",
    description:
      "Explore AI's potential in protecting and monitoring our oceans. This track challenges you to tackle critical issues in marine ecosystems and coastal environments.",
    tags: ["Marine AI", "Sustainability", "Oceanography"],
  },
  {
    id: "ps2",
    name: "Supply Chain Intelligence",
    icon: <LinkIcon size={32} />,
    color: "#ffb830",
    description:
      "Dive into the complex world of global logistics. This track focuses on leveraging data and AI to solve challenges in forecasting and optimization.",
    tags: ["Logistics", "Optimization", "Forecasting"],
  },
  {
    id: "ps3",
    name: "Industrial Intelligence",
    icon: <Bot size={32} />,
    color: "#c8f135",
    description:
      "Step into the future of manufacturing. This track challenges participants to find innovative ways to apply AI in smart automation and industrial processes.",
    tags: ["Automation", "Predictive Maintenance", "Smart Manufacturing"],
  },
];

export default function TracksSection() {
  return (
    <section id="tracks" className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.header}>
          <div className="section-label">{"//"} {THEME.name}</div>
          <h2 className="section-title">
            HACKATHON <br />
            <span className="text-lime">TRACKS</span>
          </h2>
          <p className={`section-sub ${styles.trackDesc}`}>
            {THEME.description}
          </p>
        </div>

        <div className={styles.grid}>
          {TRACKS.map((track, i) => (
            <div
              key={track.id}
              className={styles.card}
              style={{ "--track-color": track.color } as React.CSSProperties}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>{track.icon}</span>
                <span className={styles.cardNum}>0{i + 1}</span>
              </div>
              <div className={styles.colorBar} />
              <h3 className={styles.cardName}>{track.name}</h3>
              <p className={styles.cardDesc}>{track.description}</p>
              <div className={styles.tags}>
                {track.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
