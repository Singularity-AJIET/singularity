"use client";

import {
  Trophy,
  Briefcase,
  Users,
  Gift,
  Award,
  type LucideIcon,
} from "lucide-react";
import styles from "./PrizesSection.module.css";
import { withRupee } from "../Rupee/Rupee";

type Prize = {
  rank: string;
  amount: string;
  color: string;
  Icon: LucideIcon;
  perks: string[];
};

const PRIZES: Prize[] = [
  {
    rank: "Grand Prize",
    amount: "Upto ₹1,00,000",
    color: "#c8f135",
    Icon: Trophy,
    perks: [
      "Industry Mentorship",
      "Fast-Track Interview Opportunities",
      "Media & Project Exposure",
      "Certificate of Excellence",
    ],  
  },
  {
    rank: "Track Winner",
    amount: "₹20k+",
    color: "#ffb830",
    Icon: Award,
    perks: [
      "Recognition and rewards for the best project in each track",
      "First Runner-Up receives a cash prize of ₹10,000",
    ],
  },
  {
    rank: "Network",
    amount: "Connect & Collaborate",
    color: "#60a5fa",
    Icon: Users,
    perks: ["Meet fellow builders, mentors, and industry professionals"],
  },
  {
    rank: "Career Opportunities",
    amount: "Internships",
    color: "#a78bfa",
    Icon: Briefcase,
    perks: ["Opportunities to connect with companies and explore internships"],
  },
  {
    rank: "Goodies",
    amount: "Exclusive Swag",
    color: "#cd7f32",
    Icon: Gift,
    perks: ["Take home some exciting goodies from the event", "Custom Domains for Top 10 Teams"],
  },
];

export default function PrizesSection() {
  const grandPrize = PRIZES[0];

  return (
    <section id="prizes" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} why compete</div>

          <h2 className="section-title">
            WIN CASH.
            <br />
            <span className="text-lime">GET GLORY.</span>
          </h2>
         <p className={styles.sectionSub}>
          Up to <b>{withRupee("₹1,00,000")}</b> in cash prizes, along with custom domains, track-wise rewards,
          internship opportunities, industry networking, exclusive goodies, and recognition.
          Compete across diverse tracks, showcase your skills, connect with mentors and
          industry professionals, and turn your ideas into solutions that go beyond the
          hackathon.
        </p>
        </div>

        {/* Grand Prize */}
        <div className={styles.grandCard}>
          <div className={styles.grandLeft}>
            <span className={styles.grandIcon}>
              <grandPrize.Icon size={48} color={grandPrize.color} aria-hidden="true" />
            </span>

            <div>
              <div className={styles.grandRank}>
                {grandPrize.rank}
              </div>

              <div className={styles.grandAmountWrap}>
                {grandPrize.amount.startsWith("Upto ") && (
                  <span className={styles.amountPrefix}>UPTO</span>
                )}
                <div className={styles.grandAmount}>
                  {withRupee(
                    grandPrize.amount.startsWith("Upto ")
                      ? grandPrize.amount.replace("Upto ", "")
                      : grandPrize.amount
                  )}
                </div>
              </div>

              <p className={styles.grandNote}>+ Trophy + Exciting Swags + 1-1 Mentorship</p>
            </div>
          </div>

          <ul className={styles.grandRight}>
            {grandPrize.perks.map((perk) => (
              <li key={perk} className={styles.grandPerk}>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
                <span>{withRupee(perk)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.grid}>
          {PRIZES.slice(1).map((p) => (
            <div
              key={p.rank}
              className={styles.card}
              style={{ "--prize-color": p.color } as React.CSSProperties}
            >
              <span className={styles.cardIcon}>
                <p.Icon size={26} color={p.color} aria-hidden="true" />
              </span>

              <h3 className={styles.cardRank}>{p.rank}</h3>

              <div className={styles.cardAmount}>{withRupee(p.amount)}</div>

              <ul className={styles.perks}>
                {p.perks.map((perk) => (
                  <li key={perk} className={styles.perk}>
                    <span
                      className={styles.perkDot}
                      style={{ background: p.color }}
                      aria-hidden="true"
                    />
                    <span>{withRupee(perk)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}