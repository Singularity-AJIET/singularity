"use client";
import { useState } from "react";
import styles from "./ScheduleSection.module.css";

const SCHEDULE = [
  {
    day: "Day 1",
    date: "Aug 15",
    events: [
      { time: "09:00 AM", title: "Participant Check-In & Networking", type: "logistics", desc: "Arrive, get your kit, meet your fellow hackers." },
      { time: "11:00 AM", title: "Opening Ceremony & Keynote", type: "keynote", desc: "Official kickoff with keynote speakers from industry." },
      { time: "12:00 PM", title: "Hacking Begins!", type: "hack", desc: "The clock starts — 36 hours of non-stop building." },
      { time: "06:00 PM", title: "Workshop: AI APIs for Hackers", type: "workshop", desc: "Hands-on session covering modern AI API integration." },
      { time: "09:00 PM", title: "Midnight Snack & Progress Check", type: "social", desc: "Fuel up, check in with mentors, share progress." },
    ],
  },
  {
    day: "Day 2",
    date: "Aug 16",
    events: [
      { time: "09:00 AM", title: "Mentor Sessions Begin", type: "mentor", desc: "Expert mentors available for one-on-one sessions." },
      { time: "12:00 PM", title: "Workshop: Pitch Perfect", type: "workshop", desc: "Learn how to present your project to the judges." },
      { time: "03:00 PM", title: "Mid-point Check-in with Mentors", type: "mentor", desc: "Halfway mark — refine your direction and scope." },
      { time: "06:00 PM", title: "Fun Activity & Networking Hour", type: "social", desc: "Decompress, connect, and recharge for the final push." },
      { time: "11:00 PM", title: "Submission Reminder — T-1 Hour", type: "deadline", desc: "Final hour notice before submission gates close." },
    ],
  },
  {
    day: "Day 3",
    date: "Aug 17",
    events: [
      { time: "12:00 AM", title: "Submission Deadline", type: "deadline", desc: "All projects must be submitted. No extensions." },
      { time: "10:00 AM", title: "Project Presentations Begin", type: "keynote", desc: "Teams present to judges in 5-minute slots." },
      { time: "02:00 PM", title: "Judge Deliberations", type: "logistics", desc: "Judges evaluate projects across all tracks." },
      { time: "04:00 PM", title: "Awards Ceremony & Closing", type: "keynote", desc: "Winners announced, prizes awarded, goodbye hugs." },
    ],
  },
];

const TYPE_META: Record<string, { color: string; label: string }> = {
  hack:      { color: "#c8f135", label: "HACK" },
  keynote:   { color: "#ff2d6f", label: "KEYNOTE" },
  workshop:  { color: "#ffb830", label: "WORKSHOP" },
  mentor:    { color: "#a78bfa", label: "MENTOR" },
  social:    { color: "#38bdf8", label: "SOCIAL" },
  logistics: { color: "#888580", label: "LOGISTICS" },
  deadline:  { color: "#ff2d6f", label: "DEADLINE" },
};

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0);
  const day = SCHEDULE[activeDay];

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

        {/* Day tabs */}
        <div className={styles.tabs}>
          {SCHEDULE.map((d, i) => (
            <button
              key={d.day}
              className={`${styles.tab} ${activeDay === i ? styles.tabActive : ""}`}
              onClick={() => setActiveDay(i)}
            >
              <span className={styles.tabDay}>{d.day}</span>
              <span className={styles.tabDate}>{d.date}</span>
            </button>
          ))}
        </div>

        {/* Event cards grid */}
        <div className={styles.eventGrid}>
          {day.events.map((ev, i) => {
            const meta = TYPE_META[ev.type];
            return (
              <div
                key={i}
                className={styles.eventCard}
                style={{ "--ev-color": meta.color } as React.CSSProperties}
              >
                {/* Colored left border accent */}
                <div className={styles.accentBar} style={{ background: meta.color }} />

                <div className={styles.cardInner}>
                  <div className={styles.cardTop}>
                    <span className={styles.time}>{ev.time}</span>
                    <span className={styles.badge} style={{ color: meta.color, borderColor: meta.color + "44", background: meta.color + "11" }}>
                      {meta.label}
                    </span>
                  </div>
                  <h3 className={styles.eventTitle}>{ev.title}</h3>
                  <p className={styles.eventDesc}>{ev.desc}</p>
                </div>

                {/* Step number */}
                <div className={styles.stepNum} style={{ color: meta.color + "40" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
