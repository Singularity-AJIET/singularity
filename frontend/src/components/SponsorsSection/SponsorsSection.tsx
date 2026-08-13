"use client";
import { ImageUp } from "lucide-react";
import styles from "./SponsorsSection.module.css";

interface Sponsor {
  name: string;
  desc: string;
  link: string; // full URL or bare domain, e.g. "https://unstop.com/" or "techcorp.in"
  buttonText: string; // text shown on the button, e.g. "Visit Website"
  logo: string; // e.g. "/sponsors/techcorp.png" — leave "" to show upload placeholder
}

function getHref(link: string) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

const SPONSORS: { sponsors: Sponsor[]; inKind: Sponsor[] } = {
  sponsors: [
    {
      name: "Gears of Excel",
      desc: "Leading cloud infrastructure and AI solutions provider powering the next generation of scalable tech.",
      link: "techcorp.in",
      buttonText: "Visit Website",
      logo: "/GOE.webp",
    },
    {
      name: "NovaSystems",
      desc: "Enterprise cybersecurity and data protection platform. Building secure systems for modern enterprises.",
      link: "novasystems.io",
      buttonText: "Visit Website",
      logo: "/novasystems.webp",
    },
    {
      name: "BuildFast",
      desc: "The ultimate CI/CD deployment platform.",
      link: "buildfast.dev",
      buttonText: "Visit Website",
      logo: "/buildfast.webp",
    },
  ],
  inKind: [
    {
      name: "Unstop",
      desc: "Unstop is a career and hiring platform that connects students and freshers with opportunities such as jobs, internships, hackathons, competitions, courses, and mentorships.",
      link: "https://unstop.com/",
      buttonText: "Visit Website",
      logo: "/Unstop.webp",
    },
    {
      name: ".xyz",
      desc: "XYZ (.xyz) is a technology company that provides domain name extensions, with .xyz being its flagship and widely used domain.",
      link: "https://gen.xyz/",
      buttonText: "Visit Website",
      logo: "/xyzLogo.webp",
    },
  ],
};

function SponsorLogo({ name, logo }: { name: string; logo: string }) {
  if (logo) {
    return (
      <div className={styles.logoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${name} logo`} className={styles.logoImg} />
      </div>
    );
  }
  return (
    <div className={styles.logoWrap}>
      <div className={styles.logoPlaceholder}>
        <ImageUp size={22} />
        <span>Upload logo</span>
      </div>
    </div>
  );
}

function SponsorCard({ sponsor, variant }: { sponsor: Sponsor; variant: "sponsor" | "inKind" }) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <SponsorLogo name={sponsor.name} logo={sponsor.logo} />
      <span className={styles.sName}>{sponsor.name}</span>
      <p className={styles.sDesc}>{sponsor.desc}</p>
      <a
        href={getHref(sponsor.link)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.sLink}
      >
        {sponsor.buttonText} ↗
      </a>
    </div>
  );
}

export default function SponsorsSection() {
  return (
    <section id="sponsors" className={styles.section}>
      <div className="section">
        <div className={styles.header}>
          <div className="section-label">// made possible by</div>
          <h2 className="section-title">
            OUR <span className="text-lime">SPONSORS</span>
          </h2>
          <p className="section-sub">
            Singularity is proudly supported by industry leaders who believe
            in the next generation of builders.
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