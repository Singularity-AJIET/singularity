"use client";
import { ImageUp } from "lucide-react";
import styles from "./SponsorsSection.module.css";

interface Sponsor {
  name: string;
  desc: string;
  link: string; // full URL or bare domain, e.g. "https://unstop.com/" or "techcorp.in"
  buttonText: string; // text shown on the button, e.g. "Visit Website"
  logo: string; // e.g. "/sponsors/techcorp.png" — leave "" to show upload placeholder
  smallLogo?: boolean; // if true, renders the logo box slightly smaller
}

const SPONSORS: { sponsors: Sponsor[]; inKind: Sponsor[] } = {
  sponsors: [
    {
      name: "Gears of Excel",
      desc: "Gears of Excel is an edtech training and tech consultancy company focused on industry-oriented, AI-integrated learning. They bridge the gap between academic knowledge and industry demands through project-based training and expert guidance. They support innovation, mentorship, and real-world opportunities for aspiring technologists.  ",
      link: "https://gearsofexcel.com",
      buttonText: "Visit Website",
      logo: "/GOE.webp",
    },
    {
      name: "Bravynex",
      desc: "Bravynex Engineering LLP is a production-first engineering and technology company based in Mangalore. They combine commercial product development with technical training and career support across software, embedded systems, VLSI design, cybersecurity, SAP consulting, and DevOps. They bridge real-world industry projects with education, offering internships and placement support to empower the next generation of engineers.",
      link: "https://www.bravynex.com",
      buttonText: "Visit Website",
      logo: "/Bravynex.webp",
      smallLogo: true,
    },
    {
      name: "IEEE Mangalore Subsection",
      desc: "IEEE Mangalore Subsection is a regional IEEE community connecting students, professionals, and technology enthusiasts. It promotes technical learning, collaboration, innovation, and professional development through various activities.  ",
      link: "https://ieee-mangalore.org/",
      buttonText: "Visit Website",
      logo: "/IMS.webp",
      smallLogo: true,
    },
    {
      name: "IEEE Computer Society",
      desc: "IEEE Computer Society is a global community advancing computer science, engineering, and technology through innovation and education. It supports students and professionals through research, technical resources, conferences, and industry opportunities.",
      link: "https://www.computer.org",
      buttonText: "Visit Website",
      logo: "/ICS.webp",
      smallLogo: true,
    },
    
  ],
  inKind: [
    {
      name: ".xyz",
      desc: "XYZ is a domain registry company that operates the .xyz domain and other domain extensions. It helps creators, startups, developers, and businesses build flexible digital identities and establish an online presence. XYZ focuses on making domain names accessible, innovative, and suitable for the next generation of internet users.   ",
      link: "https://gen.xyz/",
      buttonText: "Visit Website",
      logo: "/xyzLogo.webp",
      smallLogo: true,
    },
    {
      name: "Unstop",
      desc: "Unstop is a leading platform connecting students and professionals with opportunities to learn, compete, and grow. It provides access to internships, jobs, competitions, and industry-driven opportunities for career development.  ",
      link: "https://unstop.com/",
      buttonText: "Visit Website",
      logo: "/Unstop.webp",
      smallLogo: true,
    },
    
  ],
};

function SponsorLogo({ name, logo, small }: { name: string; logo: string; small?: boolean }) {
  const wrapClass = `${styles.logoWrap}${small ? ` ${styles.logoWrapSmall}` : ''}`;
  if (logo) {
    return (
      <div className={wrapClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${name} logo`} className={styles.logoImg} width={250} height={100} style={{ objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div className={wrapClass}>
      <div className={styles.logoPlaceholder}>
        <ImageUp size={22} />
        <span>Upload logo</span>
      </div>
    </div>
  );
}

function SponsorCard({ sponsor, variant }: { sponsor: Sponsor; variant: "sponsor" | "inKind" }) {
  return (
    <a
      href={sponsor.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${styles[variant]}`}
      aria-label={`${sponsor.name} - Visit Website`}
    >
      <SponsorLogo name={sponsor.name} logo={sponsor.logo} small={sponsor.smallLogo} />
      <span className={styles.sName}>{sponsor.name}</span>
      <p className={styles.sDesc}>{sponsor.desc}</p>
    </a>
  );
}

export default function SponsorsSection() {
  return (
    <section id="sponsors" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">{"//"} made possible by</div>
          <h2 className="section-title">
            OUR <span className="text-lime">SPONSORS</span>
          </h2>
          <p className="section-sub">
            Singularity is proudly supported by industry leaders who share our commitment to fostering innovation and developing future-ready talent. Their support enables us to create meaningful opportunities for aspiring builders and technologists. Together, we aim to empower the next generation to transform ideas into impactful solutions.  
          </p>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>Sponsors</div>
          <div className={`${styles.tierGrid} ${styles.gridSponsors}`}>
            {SPONSORS.sponsors.map((s) => (
              <SponsorCard key={s.name} sponsor={s} variant="sponsor" />
            ))}
          </div>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>In-Kind Sponsors</div>
          <div className={`${styles.tierGrid} ${styles.gridInKind}`}>
            {SPONSORS.inKind.map((s) => (
              <SponsorCard key={s.name} sponsor={s} variant="inKind" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}