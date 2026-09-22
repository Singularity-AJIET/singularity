"use client";
import { useState, useEffect } from "react";
import styles from "./TeamsSection.module.css";
import { motion, AnimatePresence } from "framer-motion";

const TEAMS = [
  // Track 1: Coastal Intelligence (12 teams)
  { name: "Neural Ninjas", college: "IIT Bombay", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Synapse Squad", college: "BITS Pilani", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "DeepMinds", college: "NIT Trichy", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "TensorFlowers", college: "Delhi Technological University", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "GPT Geniuses", college: "IIIT Hyderabad", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Visionaries", college: "VIT Vellore", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Data Demons", college: "SRM Institute", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Byte Brains", college: "Jadavpur University", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Logic Lords", college: "RV College of Engineering", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "AI Alchemists", college: "Manipal Institute of Technology", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "AquaThinkers", college: "Cochin University of Science & Tech", track: "Coastal Intelligence", color: "#00d2ff" },
  { name: "Marine Matrix", college: "College of Engineering Guindy", track: "Coastal Intelligence", color: "#00d2ff" },

  // Track 2: Supply Chain Intelligence (12 teams)
  { name: "Block Builders", college: "IIT Delhi", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Crypto Crafters", college: "BITS Pilani, Goa", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Chain Gang", college: "NIT Surathkal", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Decentralized", college: "PEC Chandigarh", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Token Titans", college: "IIIT Allahabad", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Smart Contracters", college: "Thapar Institute", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Node Knights", college: "NIT Warangal", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Ether Eagles", college: "Anna University", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Ledger Legends", college: "VJTI Mumbai", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Hash Hustlers", college: "COEP Pune", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Route Optimizers", college: "IIIT Bangalore", track: "Supply Chain Intelligence", color: "#ffb830" },
  { name: "Fleet Forward", college: "PSG Tech Coimbatore", track: "Supply Chain Intelligence", color: "#ffb830" },

  // Track 3: Industrial Intelligence (12 teams)
  { name: "Tech For Good", college: "IIT Madras", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Eco Innovators", college: "NIT Calicut", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Change Makers", college: "BITS Pilani, Hyderabad", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Green Hackers", college: "IIIT Delhi", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Civic Coders", college: "PSG Tech Coimbatore", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Health Heroes", college: "BMS College of Engineering", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "EduTech Pioneers", college: "MS Ramaiah Institute", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Global Grid", college: "KIIT Bhubaneswar", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Kindred Spirits", college: "Nirma University", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "Impact Engine", college: "Amrita Vishwa Vidyapeetham", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "CyberForge", college: "IIT Roorkee", track: "Industrial Intelligence", color: "#c8f135" },
  { name: "RoboDynamics", college: "NIT Rourkela", track: "Industrial Intelligence", color: "#c8f135" },
];

export default function TeamsSection() {
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(TEAMS.length / itemsPerPage);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize(); // Check immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const currentTeams = isMobile ? TEAMS.slice((page - 1) * itemsPerPage, page * itemsPerPage) : TEAMS;

  return (
    <section id="teams" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} finalists</div>
          <h2 className="section-title">SELECTED <span className="text-lime">TEAMS</span></h2>
          <p className="section-sub">
            Out of 500+ applications, these 36 teams have been selected to compete at Singularity 2026 across 3 tracks (12 teams per track).
          </p>
        </div>

        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={styles.teamGrid}
            >
              {currentTeams.map((team, i) => {
                const actualRank = isMobile ? (page - 1) * itemsPerPage + i + 1 : i + 1;
                return (
                  <div
                    key={team.name}
                    className={styles.teamCard}
                    style={{ "--track-color": team.color } as React.CSSProperties}
                  >
                    <div className={styles.teamRankWrapper}>
                      <span className={styles.teamRank}>{String(actualRank).padStart(2, "0")}</span>
                    </div>
                    <div className={styles.teamInfo}>
                      <span className={styles.teamName}>{team.name}</span>
                      <span className={styles.teamCollege}>{team.college}</span>
                    </div>
                    <div
                      className={styles.teamBadge}
                      style={{ borderColor: team.color, color: team.color }}
                    >
                      {team.track}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {isMobile && totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ opacity: page === 1 ? 0.3 : 1, pointerEvents: page === 1 ? "none" : "auto", padding: "8px 16px", fontSize: "0.8rem" }}
              >
                &lt; BACK
              </button>
              <span className={styles.pageInfo}>
                {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ opacity: page === totalPages ? 0.3 : 1, pointerEvents: page === totalPages ? "none" : "auto", padding: "8px 16px", fontSize: "0.8rem" }}
              >
                NEXT &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

