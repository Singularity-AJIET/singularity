"use client";
import Link from "next/link";
import { Bot, Link as LinkIcon, Globe, Banknote } from "lucide-react";
import styles from "./TracksSection.module.css";

const TRACKS = [
  {
    id: "aiml",
    name: "AI / ML",
    icon: <Bot size={32} />,
    color: "#c8f135",
    description:
      "Build intelligent systems — from LLM-powered apps to computer vision, NLP, and predictive analytics that reshape industries.",
    tags: ["Machine Learning", "LLMs", "Computer Vision", "NLP"],
  },
  {
    id: "web3",
    name: "Web3",
    icon: <LinkIcon size={32} />,
    color: "#ff2d6f",
    description:
      "Decentralized apps, smart contracts, DAOs, DeFi, and the future of trustless, permissionless systems on blockchain.",
    tags: ["Smart Contracts", "DeFi", "NFTs", "DAOs"],
  },
  {
    id: "social",
    name: "Social Impact",
    icon: <Globe size={32} />,
    color: "#ffb830",
    description:
      "Tech for good — solutions tackling climate change, healthcare access, education equity, and civic accessibility.",
    tags: ["Climate Tech", "EdTech", "HealthTech", "GovTech"],
  },
  {
    id: "fintech",
    name: "FinTech",
    icon: <Banknote size={32} />,
    color: "#a78bfa",
    description:
      "Reimagine finance — payments, lending, wealth management, insurance, and financial inclusion for the next billion.",
    tags: ["Payments", "Lending", "InsurTech", "WealthTech"],
  },
];

export default function TracksSection() {
  return (
    <section id="tracks" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// choose your battlefield</div>
          <h2 className="section-title">
            HACKATHON <span className="text-lime">TRACKS</span>
          </h2>
          <p className="section-sub">
            Four tracks. One mission: build something that matters in 36 hours.
            Pick your domain and go all in.
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
              <Link href="/register" className={styles.cardCta}>
                PICK THIS TRACK →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
