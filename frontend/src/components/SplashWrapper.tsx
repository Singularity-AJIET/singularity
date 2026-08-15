"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SplashScreen from "@/components/SplashScreen/SplashScreen";
import Navbar from "@/components/Navbar/Navbar";

export default function SplashWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </motion.div>
    </>
  );
}