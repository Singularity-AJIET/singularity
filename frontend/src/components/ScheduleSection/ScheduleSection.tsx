"use client";
import { useState } from "react";
import styles from "./ScheduleSection.module.css";

const SCHEDULE = [
  {
    day: "Day 1",
    date: "Oct 8",
    events: [
      { time: "8:15 AM – 9:15 AM", title: "Registration & Breakfast", color: "#00d2ff", label: "KICK-OFF", desc: ["Check-in and distribution of event materials. Breakfast is served upon arrival."] },
      { time: "9:15 AM – 10:00 AM", title: "Problem Statement Reveal", color: "#ff2a6d", label: "REVEAL", desc: ["Official disclosure of hackathon problem statements. Teams are advised to review all statements before ideation."] },
      { time: "10:00 AM – 10:30 AM", title: "Inauguration Ceremony", color: "#a78bfa", label: "CEREMONY", desc: ["Formal inauguration featuring a welcome address, chief guest address, and hackathon overview."] },
      { time: "10:30 AM", title: "Official Hackathon Commencement", color: "#c8f135", label: "HACK", desc: ["Development officially begins. All teams are requested to commence work on their solutions."] },
      { time: "1:00 PM", title: "Lunch Service Begins", color: "#ff7b00", label: "SOCIAL", desc: ["Lunch is served for all participants and organisers."] },
      { time: "4:00 PM – 5:00 PM", title: "Phase 1 Evaluation", color: "#05d550", label: "JUDGING", desc: ["Progress assessment by judges and mentors. Teams must present their prototype and development roadmap."] },
      { time: "5:00 PM", title: "Coffee & Snacks Distribution", color: "#38bdf8", label: "SOCIAL", desc: ["Evening refreshments distributed to all participants."] },
      { time: "5:00 PM – 8:00 PM", title: "Development Continues", color: "#c8f135", label: "HACK", desc: ["Continued development. Teams are encouraged to incorporate Phase 1 evaluation feedback."] },
      { time: "8:00 PM", title: "Dinner Service Begins", color: "#888580", label: "SOCIAL", desc: ["Dinner is served for all participants, mentors, and staff."] },
      { time: "9:00 PM – 10:00 PM", title: "Phase 2 Evaluation", color: "#ff2a6d", label: "JUDGING", desc: ["Second formal evaluation. Teams must present a functional prototype and progress summary."] },
      { time: "10:00 PM – 1:00 AM", title: "Development Continues", color: "#a78bfa", label: "HACK", desc: ["Overnight development session focused on functionality and project refinement."] },
    ],
  },
  {
    day: "Day 2",
    date: "Oct 9",
    events: [
      { time: "1:00 AM", title: "Midnight Coffee Distribution", color: "#ffb830", label: "SOCIAL", desc: ["Midnight refreshments distributed to sustain overnight development efforts."] },
      { time: "1:00 AM – 7:30 AM", title: "Overnight Development", color: "#c8f135", label: "HACK", desc: ["Uninterrupted development sprint. Teams are expected to make significant progress on final deliverables."] },
      { time: "7:30 AM", title: "Breakfast Service Begins", color: "#ff7b00", label: "SOCIAL", desc: ["Breakfast is served. Teams are advised to rest briefly before the final sprint."] },
      { time: "8:30 AM – 10:30 AM", title: "Final Development Sprint", color: "#c8f135", label: "HACK", desc: ["Concluding development phase. All features must be finalised and tested before the submission deadline."] },
      { time: "10:30 AM", title: "Hackathon Concludes", color: "#ff2a6d", label: "DEADLINE", desc: ["Development officially ceases. Final project submissions are due at this time."] },
      { time: "10:30 AM – 12:00 PM", title: "Final Evaluation", color: "#00d2ff", label: "JUDGING", desc: ["All teams demonstrate their completed projects to the judging panel for final assessment."] },
      { time: "12:30 PM – 1:00 PM", title: "Valedictory Ceremony", color: "#ffb830", label: "CEREMONY", desc: ["Announcement of results, felicitation of winners, prize distribution, and closing remarks."] },
    ],
  }
];

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="schedule" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} event timeline</div>
          <h2 className="section-title">THE <span className="text-lime">SCHEDULE</span></h2>
          <p className={`section-sub ${styles.scheduleDesc}`}>
            Prepare for an intense 24-hour sprint of continuous building, learning, and collaborating. Our meticulously crafted schedule is designed to maximize your potential—from intense coding sprints and live evaluations to crucial development milestones. Stay focused, stay energized, and let the timeline guide your team to success.
          </p>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabGroup}>
            {SCHEDULE.map((dayData, index) => (
              <button
                key={index}
                className={`${styles.tabBtn} ${activeDay === index ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveDay(index)}
              >
                {dayData.day}
              </button>
            ))}
          </div>
          <span className={styles.tabDate}>{"//"} {SCHEDULE[activeDay].date}</span>
        </div>

        {/* Event cards grid */}
        <div className={styles.scheduleWrapper}>
          {SCHEDULE.map((dayData, dayIndex) => (
            <div 
              key={dayIndex} 
              className={`${styles.dayGroup} ${activeDay === dayIndex ? styles.dayActive : ""}`}
            >
              <h3 className={styles.dayHeading}>
                <span className={styles.dayName}>{dayData.day}</span>
                <span className={styles.dayDate}>{"//"} {dayData.date}</span>
              </h3>
              <div className={styles.eventGrid}>
                {dayData.events.map((ev, i) => (
                  <div
                    key={i}
                    className={styles.eventCard}
                    style={{ "--ev-color": ev.color } as React.CSSProperties}
                  >
                    {/* Colored left border accent */}
                    <div className={styles.accentBar} style={{ background: ev.color }} />

                    <div className={styles.cardInner}>
                      <div className={styles.cardTop}>
                        <span className={styles.time}>{ev.time}</span>
                        <span className={styles.badge} style={{ color: ev.color, borderColor: ev.color + "44", background: ev.color + "11" }}>
                          {ev.label}
                        </span>
                      </div>
                      <h4 className={styles.eventTitle}>{ev.title}</h4>
                      <ul className={styles.eventDesc}>
                        {ev.desc.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Step number */}
                    <div className={styles.stepNum} style={{ color: ev.color + "40" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
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
