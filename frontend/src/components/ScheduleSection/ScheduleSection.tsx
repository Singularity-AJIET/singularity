"use client";
import { useState } from "react";
import styles from "./ScheduleSection.module.css";

const SCHEDULE = [
  {
    day: "Day 1",
    date: "Sep 17",
    events: [
      { time: "8:30 AM onwards", title: "Registration & Check-in", color: "#00d2ff", label: "LOGISTICS", desc: ["Participant registration & verification", "ID card distribution", "Hackathon kit distribution", "Team check-in & onboarding", "Venue guidance"] },
      { time: "9:00 AM - 10:00 AM", title: "Breakfast Session", color: "#ffb830", label: "SOCIAL", desc: ["Networking breakfast for all participants"] },
      { time: "10:00 AM - 11:30 AM", title: "Inauguration Ceremony", color: "#ff2a6d", label: "KEYNOTE", desc: ["Welcome address & speeches", "Briefing & rules announcement", "Track & problem statement intro"] },
      { time: "12:00 PM", title: "Official Hackathon Kickoff", color: "#c8f135", label: "HACK", desc: ["Development officially begins", "Team workspace allocation", "Mentor interaction starts"] },
      { time: "1:00 PM - 2:00 PM", title: "Lunch Break", color: "#ff7b00", label: "SOCIAL", desc: ["Lunch and informal networking"] },
      { time: "4:00 PM", title: "Round 1 Evaluation", color: "#a78bfa", label: "MENTOR", desc: ["Initial idea validation", "Progress & implementation review", "Mentor feedback session"] },
      { time: "5:00 PM", title: "Coffee & Snacks Break", color: "#38bdf8", label: "SOCIAL", desc: ["Evening refreshments & networking", "Coffee and snacks served"] },
      { time: "8:00 PM - 9:30 PM", title: "Dinner Break", color: "#888580", label: "SOCIAL", desc: ["Dinner and refreshment session"] },
      { time: "8:30 PM", title: "Round 2 Evaluation", color: "#05d550", label: "MENTOR", desc: ["Intermediate prototype review", "Technical mentorship feedback", "Debugging & optimization guidance"] },
    ],
  },
  {
    day: "Day 2",
    date: "Sep 18",
    events: [
      { time: "12:00 AM", title: "Midnight Coffee Break", color: "#a78bfa", label: "SOCIAL", desc: ["Midnight refreshment session", "Coffee and snacks served"] },
      { time: "8:00 AM - 9:00 AM", title: "Breakfast (Day 2)", color: "#ffb830", label: "SOCIAL", desc: ["Morning refreshment & networking"] },
      { time: "12:00 PM", title: "Final Evaluation & Demo", color: "#ff2a6d", label: "JUDGING", desc: ["Final product demonstration", "Jury technical assessment", "Innovation & scalability review"] },
      { time: "1:00 PM - 2:00 PM", title: "Lunch Break", color: "#c8f135", label: "SOCIAL", desc: ["Lunch for participants, mentors, judges"] },
      { time: "2:00 PM onwards", title: "Results & Prize Distribution", color: "#00d2ff", label: "CEREMONY", desc: ["Winner announcement & prizes", "Closing remarks & networking"] },
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
