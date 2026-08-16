import styles from "./RegistrationInfoSection.module.css";

const REGISTRATION_ITEMS = [
  {
    title: "Eligibility",
    points: [
      "Open to all UG and PG students pursuing B.E./B.Tech, M.Tech, BCA, MCA, B.Sc. & M.Sc. in Computer Science.",
      "Teams can have 2 to 4 members.",
      "Participants may form teams with members from different colleges.",
    ],
  },
  {
    title: "Rules",
    points: [
      "Each team must register with accurate member details and contact information.",
      "Teams must adhere to the event code of conduct.",
      "All members must be available for the full event timeline.",
    ],
  },
  {
    title: "Resume Screening",
    points: [
      "Selection is based on the team resume and relevant technical background.",
      "GitHub and LinkedIn profiles may be reviewed as part of the background check.",
      "No prototype, PPT, or idea submission is required at this stage.",
    ],
  },
  {
    title: "Selection & Commencement",
    points: [
      "Shortlisted teams will be notified after the review process.",
      "The hack and program kickoff begins on 17th September 2026.",
      "The process focuses on resume-based review and team fit.",
    ],
  },
];

export default function RegistrationInfoSection() {
  return (
    <section id="registration" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} registration</div>
          <h2 className="section-title">
            TEAM <span className="text-lime">REGISTRATION</span>
          </h2>
          <p className="section-sub">
            Apply with your team for Singularity 2026.
          </p>
        </div>

        <div className={styles.registrationCard}>
          <div className={styles.registrationIntro}>
            <div className={styles.ctaRow}>
              <a href="https://unstop.com/o/6Y45JWH?lb=useYshOh&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Singuaji95983" target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${styles.registrationButton}`}>
                INIT_REGISTER
              </a>
            </div>
            <h3>Build with your team. Apply before the deadline.</h3>
            <p>
              Applications are reviewed for eligibility, technical background, and resume quality.
            </p>
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
    </section>
  );
}
