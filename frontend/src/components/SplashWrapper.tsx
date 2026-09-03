"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountDown from "@/components/CountDown/CountDown";
import SplashScreen from "@/components/SplashScreen/SplashScreen";
import Navbar from "@/components/Navbar/Navbar";

export default function SplashWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCountdown, setShowCountdown] = useState(true);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (showCountdown || showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showCountdown, showSplash]);

  useEffect(() => {
    // Ensure we start at the top on reload
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const isIntroActive = showCountdown || showSplash;

  return (
    <>
      <AnimatePresence mode="wait">
        {showCountdown && (
          <motion.div
            key="countdown-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#000000" }}
          >
            <CountDown
              onComplete={() => {
                setShowCountdown(false);
                setShowSplash(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntroActive ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Navbar hideLogo={isIntroActive} />
        {children}
      </motion.div>
    </>
  );
}