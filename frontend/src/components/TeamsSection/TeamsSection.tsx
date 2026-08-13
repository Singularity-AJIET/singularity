"use client";
import { useState, useEffect } from "react";
import styles from "./TeamsSection.module.css";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationInfoSection from "./RegistrationInfoSection";

type TeamPhase = "registration" | "selected";

const TRACKS = [
  {
    id: "ai",
    name: "AI & ML",
    color: "#c8f135",
    teams: [
      { name: "Neural Ninjas", college: "IIT Bombay" },
      { name: "Synapse Squad", college: "BITS Pilani" },
      { name: "DeepMinds", college: "NIT Trichy" },
      { name: "TensorFlowers", college: "Delhi Technological University" },
      { name: "GPT Geniuses", college: "IIIT Hyderabad" },
      { name: "Visionaries", college: "VIT Vellore" },
      { name: "Data Demons", college: "SRM Institute" },
      { name: "Byte Brains", college: "Jadavpur University" },
      { name: "Logic Lords", college: "RV College of Engineering" },
      { name: "AI Alchemists", college: "Manipal Institute of Technology" }
    ]
  },
  {
    id: "web3",
    name: "Web3 & Blockchain",
    color: "#a78bfa",
    teams: [
      { name: "Block Builders", college: "IIT Delhi" },
      { name: "Crypto Crafters", college: "BITS Pilani, Goa" },
      { name: "Chain Gang", college: "NIT Surathkal" },
      { name: "Decentralized", college: "PEC Chandigarh" },
      { name: "Token Titans", college: "IIIT Allahabad" },
      { name: "Smart Contracters", college: "Thapar Institute" },
      { name: "Node Knights", college: "NIT Warangal" },
      { name: "Ether Eagles", college: "Anna University" },
      { name: "Ledger Legends", college: "VJTI Mumbai" },
      { name: "Hash Hustlers", college: "COEP Pune" }
    ]
  },
  {
    id: "social",
    name: "Social Impact",
    color: "#38bdf8",
    teams: [
      { name: "Tech For Good", college: "IIT Madras" },
      { name: "Eco Innovators", college: "NIT Calicut" },
      { name: "Change Makers", college: "BITS Pilani, Hyderabad" },
      { name: "Green Hackers", college: "IIIT Delhi" },
      { name: "Civic Coders", college: "PSG Tech Coimbatore" },
      { name: "Health Heroes", college: "BMS College of Engineering" },
      { name: "EduTech Pioneers", college: "MS Ramaiah Institute" },
      { name: "Global Grid", college: "KIIT Bhubaneswar" },
      { name: "Kindred Spirits", college: "Nirma University" },
      { name: "Impact Engine", college: "Amrita Vishwa Vidyapeetham" }
    ]
  }
];

export default function TeamsSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="teams" className={styles.section}>
      <RegistrationInfoSection />

      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// finalists</div>
          <h2 className="section-title">SELECTED <span className="text-lime">TEAMS</span></h2>
          <p className="section-sub">
            Out of 5,000+ applications, these 30 teams have been selected to compete at Singularity Hack 2026.
          </p>
        </div>

        <div className={styles.tabs}>
          {TRACKS.map((track, i) => (
            <button
              key={track.id}
              onClick={() => setActiveTab(i)}
              className={`${styles.tabBtn} ${activeTab === i ? styles.tabActive : ""}`}
              style={{
                borderColor: activeTab === i ? track.color : "var(--border)",
                color: activeTab === i ? "#111010" : "var(--text-muted)",
                backgroundColor: activeTab === i ? track.color : "transparent"
              }}
            >
              {track.name}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={styles.teamGrid}
              style={{ "--track-color": TRACKS[activeTab].color } as React.CSSProperties}
            >
              {TRACKS[activeTab].teams.map((team, i) => (
                <div key={team.name} className={styles.teamCard}>
                  <div className={styles.teamRankWrapper}>
                    <span className={styles.teamRank}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{team.name}</span>
                    <span className={styles.teamCollege}>{team.college}</span>
                  </div>
                  <div className={styles.teamBadge} style={{ color: TRACKS[activeTab].color, borderColor: TRACKS[activeTab].color + '44', background: TRACKS[activeTab].color + '11' }}>
                    TRACK: {TRACKS[activeTab].id.toUpperCase()}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
