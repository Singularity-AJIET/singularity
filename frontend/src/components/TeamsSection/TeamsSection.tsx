"use client";
import { useState } from "react";
import styles from "./TeamsSection.module.css";
import { motion, AnimatePresence } from "framer-motion";

const TEAMS = [
  { name: "Neural Ninjas", college: "IIT Bombay" },
  { name: "Synapse Squad", college: "BITS Pilani" },
  { name: "DeepMinds", college: "NIT Trichy" },
  { name: "TensorFlowers", college: "Delhi Technological University" },
  { name: "GPT Geniuses", college: "IIIT Hyderabad" },
  { name: "Visionaries", college: "VIT Vellore" },
  { name: "Data Demons", college: "SRM Institute" },
  { name: "Byte Brains", college: "Jadavpur University" },
  { name: "Logic Lords", college: "RV College of Engineering" },
  { name: "AI Alchemists", college: "Manipal Institute of Technology" },
  { name: "Block Builders", college: "IIT Delhi" },
  { name: "Crypto Crafters", college: "BITS Pilani, Goa" },
  { name: "Chain Gang", college: "NIT Surathkal" },
  { name: "Decentralized", college: "PEC Chandigarh" },
  { name: "Token Titans", college: "IIIT Allahabad" },
  { name: "Smart Contracters", college: "Thapar Institute" },
  { name: "Node Knights", college: "NIT Warangal" },
  { name: "Ether Eagles", college: "Anna University" },
  { name: "Ledger Legends", college: "VJTI Mumbai" },
  { name: "Hash Hustlers", college: "COEP Pune" },
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
];

export default function TeamsSection() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(TEAMS.length / itemsPerPage);
  
  const currentTeams = TEAMS.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <section id="teams" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} finalists</div>
          <h2 className="section-title">SELECTED <span className="text-lime">TEAMS</span></h2>
          <p className="section-sub">
            Out of 5,000+ applications, these 30 teams have been selected to compete at Singularity 2026.
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
                const actualRank = (page - 1) * itemsPerPage + i + 1;
                return (
                  <div key={team.name} className={styles.teamCard}>
                    <div className={styles.teamRankWrapper}>
                      <span className={styles.teamRank}>{String(actualRank).padStart(2, "0")}</span>
                    </div>
                    <div className={styles.teamInfo}>
                      <span className={styles.teamName}>{team.name}</span>
                      <span className={styles.teamCollege}>{team.college}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
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

