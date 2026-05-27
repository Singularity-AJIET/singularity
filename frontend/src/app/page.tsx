"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar/Navbar";
import HeroSection from "@/components/HeroSection/HeroSection";
import AboutSection from "@/components/AboutSection/AboutSection";
import TracksSection from "@/components/TracksSection/TracksSection";
import PrizesSection from "@/components/PrizesSection/PrizesSection";
import ScheduleSection from "@/components/ScheduleSection/ScheduleSection";
import CoordinatorsSection from "@/components/CoordinatorsSection/CoordinatorsSection";
import TeamsSection from "@/components/TeamsSection/TeamsSection";
import FAQSection from "@/components/FAQSection/FAQSection";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";
import Footer from "@/components/Footer/Footer";
import SplashScreen from "@/components/SplashScreen/SplashScreen";
import TickerTape from "@/components/TickerTape/TickerTape";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showSplash]);

  useEffect(() => {
    // Ensure we start at the top on reload
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Navbar hideLogo={showSplash} />
        <main>
          <HeroSection />
          <TickerTape />
          <AboutSection />
          <TracksSection />
          <PrizesSection />
          <ScheduleSection />
          <CoordinatorsSection />
          <FAQSection />
          <SponsorsSection />
          <TeamsSection />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}
