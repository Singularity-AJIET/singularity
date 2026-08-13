"use client";

import { Bot, Link as LinkIcon, Globe, Banknote } from "lucide-react";
import styles from "./TracksSection.module.css";

const THEME = {
  name: "Artificial Intelligence",
  description: "Explore the frontiers of AI across three core domains. The exact problem statements for each domain will be revealed on the day of the hackathon."
};

const TRACKS = [
  {
    id: "ps1",
    name: "Generative AI Solutions",
    icon: <Bot size={32} />,
    color: "#c8f135",
    description:
      "Build applications leveraging Large Language Models (LLMs) or multimodal GenAI.",
    tags: ["GenAI", "LLMs", "Multimodal"],
  },
  {
    id: "ps2",
    name: "Computer Vision",
    icon: <Globe size={32} />,
    color: "#ff2d6f",
    description:
      "Develop models that interpret and process visual data from the real world.",
    tags: ["Computer Vision", "Image Processing", "Object Detection"],
  },
  {
    id: "ps3",
    name: "Predictive Analytics",
    icon: <LinkIcon size={32} />,
    color: "#a78bfa",
    description:
      "Create data-driven AI solutions for forecasting trends and optimization.",
    tags: ["Machine Learning", "Forecasting", "Data Models"],
  },
];

export default function TracksSection() {
  return (
    <section id="tracks" className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.header}>
          <div className="section-label">// {THEME.name}</div>
          <h2 className="section-title">
            HACKATHON <span className="text-lime">DOMAINS</span>
          </h2>
          <p className="section-sub">
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
