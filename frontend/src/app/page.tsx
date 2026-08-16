import HeroSection from "@/components/HeroSection/HeroSection";
import AboutSection from "@/components/AboutSection/AboutSection";
import TracksSection from "@/components/TracksSection/TracksSection";
import PrizesSection from "@/components/PrizesSection/PrizesSection";
import ScheduleSection from "@/components/ScheduleSection/ScheduleSection";
import CoordinatorsSection from "@/components/CoordinatorsSection/CoordinatorsSection";
// import TeamsSection from "@/components/TeamsSection/TeamsSection";
import RegistrationInfoSection from "@/components/RegistrationInfoSection/RegistrationInfoSection";
import FAQSection from "@/components/FAQSection/FAQSection";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";
import Footer from "@/components/Footer/Footer";
import TickerTape from "@/components/TickerTape/TickerTape";
import SplashWrapper from "@/components/SplashWrapper";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Singularity 2026",
  startDate: "2026-09-17",
  endDate: "2026-09-18",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  url: siteUrl,
  image: [`${siteUrl}/og.png`], 
  location: {
    "@type": "Place",
    name: "A J Institute of Engineering and Technology",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kodikal",
      addressLocality: "Mangalore",
      addressRegion: "Karnataka",
      postalCode: "575006",
      addressCountry: "IN",
    },
  },
  description: "24-hour National-Level Inter-college Hackathon at AJIET.",
  organizer: {
    "@type": "Organization",
    name: "Singularity 2026",
    url: siteUrl,
  },
  offers: {
    "@type": "Offer",
    url: "https://unstop.com/o/6Y45JWH?lb=useYshOh",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    validFrom: "2026-08-20", 
    description:
      "Registration is free. Teams selected to participate pay a ₹600 fee.",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <SplashWrapper>
        <main>
          <HeroSection />
          <TickerTape />
          <AboutSection />
          <TracksSection />
          <PrizesSection />
          <RegistrationInfoSection />
          <SponsorsSection />
          <CoordinatorsSection />
          <ScheduleSection />
          {/* <TeamsSection /> */}
          <FAQSection />
        </main>
        <Footer />
      </SplashWrapper>
    </>
  );
}