import styles from "./TeamsSection.module.css";

const REGISTRATION_ITEMS = [
  {
    title: "Eligibility",
    points: [
      "Open to undergraduate and postgraduate students from recognized institutions.",
      "Teams can have 2 to 4 members with at least one technical member.",
      "Students from all disciplines are eligible to apply."
    ]
  },
  {
    title: "Rules",
    points: [
      "Each team must register with accurate member details and contact information.",
      "Teams must adhere to the event code of conduct.",
      "All members must be available for the full event timeline."
    ]
  },
  {
    title: "Resume Screening",
    points: [
      "Selection is based on the team resume and relevant technical background.",
      "A clear and strong resume profile improves selection chances.",
      "No prototype, PPT, or idea submission is required at this stage."
    ]
  },
  {
    title: "Selection & Commencement",
    points: [
      "Shortlisted teams will be notified after the review process.",
      "The hack and program kickoff begins on 17th September 2026.",
      "The process focuses on resume-based review and team fit."
    ]
  }
];

export default function RegistrationInfoSection() {
  return (
    <div className="section">
      <div className={styles.header}>
        <div className="section-label">// registration</div>
        <h2 className="section-title">TEAM <span className="text-lime">REGISTRATION</span></h2>
        <p className="section-sub">
          Join the Singularity Hack 2026 journey by applying with your team. Selected teams will be announced after the resume-based screening process.
        </p>
      </div>

      <div className={styles.registrationCard}>
        <div className={styles.registrationIntro}>
          <span className={styles.statusBadge}>OPEN FOR APPLICATIONS</span>
          <h3>Build with your team. Apply before the deadline.</h3>
          <p>
            Teams are shortlisted based on eligibility, technical background, and resume quality. No project prototype or presentation is required at the application stage.
          </p>
          <div className={styles.ctaRow}>
            <a href="https://unstop.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              INIT_REGISTER
            </a>
          </div>
        </div>

        <div className={styles.registrationGrid}>
          {REGISTRATION_ITEMS.map((item) => (
            <div key={item.title} className={styles.infoCard}>
              <h4>{item.title}</h4>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
