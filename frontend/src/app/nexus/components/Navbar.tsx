"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem("admin_profile");
    if (profile) {
      setAdmin(JSON.parse(profile));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    router.push("/nexus/login");
  };

  if (pathname === "/nexus/login") {
    return null;
  }

  const isVolunteer = admin?.role === 'volunteer';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        
        {/* Top Line: Brand and Sign Out on mobile */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">Singularity<span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]"> &apos;26</span></span>
            </div>
          </div>

          {/* Mobile Sign Out */}
          <button
            onClick={handleLogout}
            className="sm:hidden rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition-all active:scale-95 cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation Links and Desktop Info */}
        <div className="flex flex-row items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
          <nav className="flex items-center gap-1 sm:gap-2 mr-0 sm:mr-2">
            {!isVolunteer && (
              <button
                onClick={() => router.push("/nexus")}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                  pathname === "/nexus"
                    ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                    : "font-semibold text-slate-400 hover:text-white"
                }`}
              >
                Console
              </button>
            )}
            
            <button
              onClick={() => router.push("/nexus/registration")}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                pathname === "/nexus/registration"
                  ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                  : "font-semibold text-slate-400 hover:text-white"
              }`}
            >
              Registration
            </button>
            
            <button
              onClick={() => router.push("/nexus/scanner")}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                pathname === "/nexus/scanner"
                  ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                  : "font-semibold text-slate-400 hover:text-white"
              }`}
            >
              Scanner
            </button>
            
            <button
              onClick={() => router.push("/nexus/claims")}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                pathname === "/nexus/claims"
                  ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                  : "font-semibold text-slate-400 hover:text-white"
              }`}
            >
              Claims
            </button>
            
            {!isVolunteer && (
              <>
                <button
                  onClick={() => router.push("/nexus/web-launch")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                    pathname === "/nexus/web-launch"
                      ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                      : "font-semibold text-slate-400 hover:text-white"
                  }`}
                >
                  Web Launch
                </button>
              <button
                onClick={() => router.push("/nexus/settings")}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                  pathname === "/nexus/settings"
                    ? "bg-yellow-400/10 border border-yellow-400/25 font-bold text-yellow-400"
                    : "font-semibold text-slate-400 hover:text-white"
                }`}
              >
                Settings
              </button>
              </>
            )}
          </nav>

          <div className="hidden md:block text-right mr-2">
            <p className="text-xs font-bold text-slate-300">{admin?.name || admin?.username || "..."}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              admin?.role === 'superadmin' ? 'bg-yellow-400/20 text-yellow-400' :
              admin?.role === 'volunteer' ? 'bg-teal-400/20 text-teal-400' :
              'bg-slate-700 text-slate-400'
            }`}>{admin?.role || '...'}</span>
          </div>
          
          {/* Desktop Sign Out */}
          <button
            onClick={handleLogout}
            className="hidden sm:block rounded-lg border border-slate-800 hover:border-yellow-400/40 bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-yellow-400 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
