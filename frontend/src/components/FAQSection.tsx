"use client";
import { useState } from "react";
import styles from "./FAQSection.module.css";

const FAQS = [
  { q: "Who can participate?", a: "Any currently enrolled undergraduate or postgraduate student from any college across India. Students from any discipline are welcome — not just CS/IT!" },
  { q: "Is it free to participate?", a: "Yes! Singularity Hack is completely free to enter. There are no registration fees whatsoever." },
  { q: "How big can a team be?", a: "Teams can have 2 to 4 members. Solo participants are welcome too, though we encourage collaboration." },
  { q: "Can I team up with students from other colleges?", a: "Absolutely! Cross-college teams are not only allowed but encouraged. Bring your best team from wherever they are." },
  { q: "What should I build?", a: "A working prototype solving a real-world problem within your chosen track. Creativity and impact matter most." },
  { q: "Do I need to know how to code?", a: "Coding skills are needed to build the prototype, but designers, product thinkers, and business strategists are equally valuable in a team." },
  { q: "Will food and accommodation be provided?", a: "Yes! All registered on-site participants get meals and refreshments throughout the 36-hour event. Accommodation details will be shared post-registration." },
  { q: "How are projects judged?", a: "Evaluated on Innovation (30%), Technical Complexity (25%), Impact & Feasibility (25%), and Presentation (20%) by a panel of industry experts." },
  { q: "When is the registration deadline?", a: "Registration closes on August 10, 2026. Register early — spots are limited!" },
  { q: "Will there be internet access?", a: "Yes, high-speed Wi-Fi will be provided throughout the venue. Bring your own hotspot as backup just in case." },
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
              <a href="mailto:hello@singularityhack.in" className={styles.email}>
                hello@singularityhack.in
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
