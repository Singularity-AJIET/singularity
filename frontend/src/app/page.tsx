"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TracksSection from "@/components/TracksSection";
import PrizesSection from "@/components/PrizesSection";
import ScheduleSection from "@/components/ScheduleSection";
import CoordinatorsSection from "@/components/CoordinatorsSection";
import TeamsSection from "@/components/TeamsSection";
import FAQSection from "@/components/FAQSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";

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
