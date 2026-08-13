"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WebLaunchPage() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  // Basic auth check
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/nexus/login");
    }
  }, [router]);

  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full bg-[#030611] text-white font-sans flex items-center justify-center overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-yellow-500/10 blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Cyberpunk Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) scale(2.5) translateY(-100px)',
            transformOrigin: 'top center'
          }}
        />
        
        {/* Grid Fade Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030611] via-[#030611]/80 to-transparent" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-lg p-10 sm:p-14 text-center">
        
        {/* Glassmorphism Container */}
        <div className="absolute inset-0 rounded-[2rem] bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl overflow-hidden transition-all duration-700 hover:border-yellow-400/30 group">
          {/* Edge Glow */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent transition-all duration-700 ${isHovering ? 'w-3/4 opacity-100' : 'w-1/4 opacity-30'}`} />
        </div>

        <div className="relative z-20 flex flex-col items-center">
          
          {/* Header Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/5 border border-yellow-400/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <svg className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12.75l-3-3m0 0l-3 3m3-3v7.5" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-md">
            System Launch
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-sm mb-12 leading-relaxed">
            Initialize the primary event infrastructure. Authorized administrators only.
          </p>

          {/* Start Button */}
          <button
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => console.log("Web Launch initiated")}
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 px-10 py-5 text-sm sm:text-base font-black uppercase tracking-[0.2em] text-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] cursor-pointer"
          >
            {/* Button Glitch/Shine Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:translate-x-full" />
            
            <span>Initialize</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </div>
      </div>
      
    </div>
  );
}
