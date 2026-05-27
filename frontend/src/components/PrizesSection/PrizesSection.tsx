"use client";
import { Trophy, Medal, Award, Globe, Star } from "lucide-react";
import styles from "./PrizesSection.module.css";

const PRIZES = [
  {
    rank: "Grand Prize",
    amount: "₹50,000",
    color: "#c8f135",
    icon: <Trophy size={48} color="#c8f135" />,
    perks: ["Champion Trophy", "1:1 Industry Mentorship", "Fast-track Interviews", "Media Coverage"],
  },
  {
    rank: "1st Runner-Up",
    amount: "₹25,000",
    color: "#e0e0e0",
    icon: <Medal size={32} color="#e0e0e0" />,
    perks: ["Silver Trophy", "Certificate of Excellence", "Swag Pack"],
  },
  {
    rank: "2nd Runner-Up",
    amount: "₹15,000",
    color: "#cd7f32",
    icon: <Award size={32} color="#cd7f32" />,
    perks: ["Bronze Trophy", "Certificate of Excellence", "Swag Pack"],
  },
  {
    rank: "Best Social Impact",
    amount: "₹5,000",
    color: "#ffb830",
    icon: <Globe size={32} color="#ffb830" />,
    perks: ["Special Category Trophy", "NGO Partnership Opportunity"],
  },
  {
    rank: "Best Rookie Team",
    amount: "₹5,000",
    color: "#a78bfa",
    icon: <Star size={32} color="#a78bfa" />,
    perks: ["Rookie Champion Badge", "Mentorship Access"],
  },
];

export default function PrizesSection() {
  return (
    <section id="prizes" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// why compete</div>
          <h2 className="section-title">
            WIN CASH.<br />
            <span className="text-lime">GET GLORY.</span>
          </h2>
          <p className="section-sub">
            Over ₹1,00,000 in prizes across 5 categories. The stakes are high.
            Build something great and take it home.
          </p>
        </div>

        {/* Grand prize hero card */}
        <div className={styles.grandCard}>
          <div className={styles.grandLeft}>
            <span className={styles.grandIcon}><Trophy size={48} color="#c8f135" /></span>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Grand Prize</div>
              <div className={styles.grandAmount}>₹50,000</div>
              <p className={styles.grandNote}>+ Trophy + Industry Mentorship + Media Coverage</p>
            </div>
          </div>
          <div className={styles.grandRight}>
            {["Champion Trophy", "1:1 Industry Mentorship", "Fast-track Interviews", "Media Coverage"].map((p) => (
              <div key={p} className={styles.grandPerk}>
                <span className={styles.check}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>

        {/* Other prizes */}
        <div className={styles.grid}>
          {PRIZES.slice(1).map((p) => (
            <div
              key={p.rank}
              className={styles.card}
              style={{ "--prize-color": p.color } as React.CSSProperties}
            >
              <span className={styles.cardIcon}>{p.icon}</span>
              <div className={styles.cardRank}>{p.rank}</div>
              <div className={styles.cardAmount}>{p.amount}</div>
              <div className={styles.perks}>
                {p.perks.map((perk) => (
                  <div key={perk} className={styles.perk}>
                    <span className={styles.perkDot} style={{ background: p.color }} />
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
