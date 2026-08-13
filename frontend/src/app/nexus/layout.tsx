import "./nexus.css";
import Navbar from "./components/Navbar";
import React from "react";

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#050A18]">
      <Navbar />
      {children}
    </div>
  );
}

