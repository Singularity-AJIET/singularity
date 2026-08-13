"use client";
import { useState } from "react";
import styles from "./ScheduleSection.module.css";

const SCHEDULE = [
  {
    day: "Day 1",
    date: "Sep 17",
    events: [
      { time: "8:30 AM – 9:30 AM", title: "Registration & Check-in", color: "#00d2ff", label: "LOGISTICS", desc: ["Participant registration & verification", "Hackathon kit distribution"] },
      { time: "8:30 AM – 9:30 AM", title: "Breakfast", color: "#ffb830", label: "SOCIAL", desc: ["Networking breakfast for all participants"] },
      { time: "9:30 AM", title: "Official Hackathon Kickoff", color: "#c8f135", label: "HACK", desc: ["Coding officially begins", "Team workspace setup"] },
      { time: "10:30 AM – 11:00 AM", title: "Inauguration Ceremony", color: "#ff2a6d", label: "CEREMONY", desc: ["Welcome Address & Chief Guest Address", "Hackathon Brief & Rules"] },
      { time: "11:00 AM – 1:00 PM", title: "Development Continues", color: "#c8f135", label: "HACK", desc: ["Focus on core functionalities"] },
      { time: "1:00 PM – 2:00 PM", title: "Lunch Break", color: "#ff7b00", label: "SOCIAL", desc: ["Lunch and informal networking"] },
      { time: "2:00 PM – 4:00 PM", title: "Development & Mentor Interactions", color: "#a78bfa", label: "MENTOR", desc: ["Technical mentorship & guidance"] },
      { time: "4:00 PM – 5:00 PM", title: "Phase 1 Evaluation", color: "#05d550", label: "JUDGING", desc: ["Progress Check by Judges & Mentors", "Initial idea validation"] },
      { time: "5:00 PM – 5:30 PM", title: "Coffee & Snacks Break", color: "#38bdf8", label: "SOCIAL", desc: ["Evening refreshments"] },
      { time: "5:30 PM – 8:00 PM", title: "Development Continues", color: "#c8f135", label: "HACK", desc: ["Working on implementation feedback"] },
      { time: "8:00 PM – 9:00 PM", title: "Dinner Break", color: "#888580", label: "SOCIAL", desc: ["Dinner and refreshment session"] },
      { time: "9:00 PM – 10:00 PM", title: "Phase 2 Evaluation", color: "#ff2a6d", label: "JUDGING", desc: ["Prototype Review & Feedback"] },
      { time: "10:00 PM – 12:00 AM", title: "Development & Mentor Support", color: "#a78bfa", label: "MENTOR", desc: ["Late night hacking & support"] },
    ],
  },
  {
    day: "Day 2",
    date: "Sep 18",
    events: [
      { time: "12:00 AM – 12:30 AM", title: "Midnight Coffee Break", color: "#ffb830", label: "SOCIAL", desc: ["Midnight refreshment session"] },
      { time: "12:30 AM – 7:30 AM", title: "Overnight Development", color: "#c8f135", label: "HACK", desc: ["Uninterrupted coding sprint"] },
      { time: "7:30 AM – 8:30 AM", title: "Breakfast", color: "#ff7b00", label: "SOCIAL", desc: ["Morning refreshment & networking"] },
      { time: "8:30 AM – 10:00 AM", title: "Final Development", color: "#c8f135", label: "HACK", desc: ["Final testing & Project submission"] },
      { time: "10:00 AM", title: "Hackathon Ends", color: "#ff2a6d", label: "DEADLINE", desc: ["Code Freeze & Final Submission"] },
      { time: "10:00 AM – 11:00 AM", title: "Final Evaluation – Round 1", color: "#00d2ff", label: "JUDGING", desc: ["All teams demonstrate completed projects to judges"] },
      { time: "11:00 AM – 11:15 AM", title: "Judges' Deliberation", color: "#a78bfa", label: "LOGISTICS", desc: ["Announcement of Top 10 Finalists"] },
      { time: "11:15 AM – 12:00 PM", title: "Final Evaluation – Round 2", color: "#05d550", label: "JUDGING", desc: ["Top 10 Stage Presentations", "Live Demo & Q&A"] },
      { time: "12:00 PM – 1:00 PM", title: "Valedictory Function", color: "#ffb830", label: "CEREMONY", desc: ["Winner Announcement & Prize Distribution"] },
      { time: "1:00 PM – 2:00 PM", title: "Lunch", color: "#ff7b00", label: "SOCIAL", desc: ["Lunch for participants, mentors, judges"] },
    ],
  }
];

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="schedule" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// event timeline</div>
          <h2 className="section-title">THE <span className="text-lime">SCHEDULE</span></h2>
          <p className="section-sub">
            36 hours structured for maximum output — workshops, mentors, and milestones keeping you on track.
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
                      <h3 className={styles.eventTitle}>{ev.title}</h3>
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
