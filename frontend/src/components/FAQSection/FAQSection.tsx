"use client";
import { useState } from "react";
import styles from "./FAQSection.module.css";

const FAQS = [
  { q: "Who can participate?", a: "The hackathon is open to all UG and PG students pursuing B.E./B.Tech, M.Tech, BCA, MCA, B.Sc. in Computer Science, and M.Sc. in Computer Science. Participants from colleges across India are welcome to take part." },
  { q: "Is it free to participate?", a: "There is no fee required to submit your registration or participate in the selection process. A registration fee will be applicable only to the teams that are selected for the hackathon." },
  { q: "How big can a team be?", a: "Teams can consist of 2 to 4 members. You can form a team with friends or other eligible participants who share your interest in building innovative solutions." },
  { q: "Can I team up with students from other colleges?", a: "Yes! You can team up with eligible students from other colleges across India. Collaborate with different skill sets and build a stronger team for the hackathon." },
  { q: "What should I build?", a: "Build an innovative solution that addresses a real-world problem using technology. You are encouraged to think creatively and develop something impactful, practical, and scalable." },
  { q: "Do I need to know how to code?", a: "Coding skills are needed to build the prototype, but designers, product thinkers, and business strategists are equally valuable in a team. Participants with diverse skills and backgrounds are welcome to contribute to their team's ideas and solutions." },
  { q: "Will food and accommodation be provided?", a: "Food will be provided to all participants throughout the hackathon. Accommodation details will be conveyed to the participants before the event." },
  { q: "Will there be internet access?", a: "Yes, internet access will be available throughout the hackathon venue. Participants can use the available connectivity as needed, and are encouraged to keep a personal hotspot as a backup." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className={styles.section}>
      <div className="section">
        <div className={styles.layout}>
          <div className={styles.left}>
            <div className="section-label">// got questions?</div>
            <h2 className="section-title">
              FREQUENTLY<br />
              <span className="text-lime">ASKED</span>
            </h2>
            <p className="section-sub">
              Can&apos;t find your answer? Reach out at{" "}
              <a href="https://mail.google.com/mail/?view=cm&to=singularity@ajiet.edu.in"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.email}
>
  singularity@ajiet.edu.in
</a>
            </p>
          </div>

          <div className={styles.right}>
            {FAQS.map((faq, i) => (
              <div key={i} className={styles.item}>
                <button
                  className={styles.question}
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className={styles.qText}>{faq.q}</span>
                  <span className={`${styles.icon} ${open === i ? styles.iconOpen : ""}`}>+</span>
                </button>
                {open === i && (
                  <div className={styles.answer}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
