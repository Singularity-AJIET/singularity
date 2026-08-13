"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import { Html5Qrcode } from "html5-qrcode";

interface CounterSession {
  id: string;
  name: string;
  isOpen: boolean;
}

interface ScanLog {
  id: string;
  name: string;
  email?: string;
  teamName?: string;
  teamNumber?: string;
  college?: string;
  role?: string;
  status: "OK" | "ALREADY_CLAIMED" | "ERROR" | "CLOSED";
  message?: string;
  timestamp: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  
  // State variables
  const [counters, setCounters] = useState<CounterSession[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<string>("");
  const [isLoadingCounters, setIsLoadingCounters] = useState(true);
  const [error, setError] = useState("");
  
  // Scan result state
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "processing" | "success" | "warning" | "error" | "closed">("idle");
  const [scanResult, setScanResult] = useState<{
    name?: string;
    email?: string;
    teamName?: string;
    teamNumber?: string;
    college?: string;
    role?: string;
    message?: string;
    time?: string;
  } | null>(null);
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);
  const [scanFlash, setScanFlash] = useState<"success" | "warning" | "error" | null>(null);

  // Camera settings
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>("");
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  // References
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningActive = useRef(false);
  const scanInProgress = useRef(false);
  const lastScannedToken = useRef<string>("");
  const lastScannedTime = useRef<number>(0);

  // Haptic Vibration feedback for mobile scanning (No audio, vibration only)
  const vibrate = (type: "success" | "warning" | "error") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (type === "success") {
          navigator.vibrate(150); // Single crisp haptic pulse for approved scan
        } else if (type === "warning") {
          navigator.vibrate([100, 60, 100]); // Double buzz for already claimed
        } else {
          navigator.vibrate([200, 80, 200]); // Heavy double buzz for error
        }
      } catch (e) {
        // Ignore if vibration isn't supported/allowed on client
      }
    }
  };

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const profile = localStorage.getItem("admin_profile");

    if (!token || !profile) {
      router.push("/nexus/login");
      return;
    }
    setAdmin(JSON.parse(profile));
  }, [router]);

  // Real-time counter updates via SSE — scanner unlocks/locks instantly when admin toggles a counter
  useEffect(() => {
    const API_BASE = getApiBaseUrl();
    const eventSource = new EventSource(`${API_BASE}/api/counters/events`);

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        // Map snake_case API response to camelCase interface
        const data: CounterSession[] = rawData.map((c: any) => ({
          id: c.id,
          name: c.name,
          isOpen: c.is_open,
        }));

        setCounters(data);
        setIsLoadingCounters(false);

        // Auto-select an open counter
        setSelectedCounter(prev => {
          const currentCounter = data.find(c => c.id === prev);
          if (currentCounter && currentCounter.isOpen) return prev; // keep current if still open
          const openCounter = data.find(c => c.isOpen);
          if (openCounter) return openCounter.id;
          if (!prev && data.length > 0) return data[0].id;
          return prev;
        });
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection lost, will auto-reconnect...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Setup Cameras — automatically prefer the back/rear camera for scanning QR codes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);

            // Search for back / rear / environment camera in device labels
            const rearCamera = devices.find((d) =>
              /back|rear|environment|main|primary|facing back/i.test(d.label)
            );

            // On mobile, back camera is usually the last device if labels aren't available yet
            const selected = rearCamera || (devices.length > 1 ? devices[devices.length - 1] : devices[0]);
            setActiveCameraId(selected.id);
          } else {
            setIsCameraSupported(false);
          }
        })
        .catch((err) => {
          console.error("Failed to query cameras:", err);
          setIsCameraSupported(false);
        });
    }
  }, []);

  const isInitializing = useRef(false);

  // Compute whether selected counter is open
  const selectedCounterObj = counters.find((c) => c.id === selectedCounter);
  const isSelectedCounterOpen = selectedCounterObj ? selectedCounterObj.isOpen : false;

  // Control scanner lifecycle
  useEffect(() => {
    if (!selectedCounter) return;

    if (!isSelectedCounterOpen) {
      stopScanner();
      setScanStatus("closed");
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [activeCameraId, selectedCounter, isSelectedCounterOpen]);

  const startScanner = async () => {
    if (isScanningActive.current || isInitializing.current) {
      return; // Camera is already running or initializing
    }
    isInitializing.current = true;

    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const cameraConfig = activeCameraId ? activeCameraId : { facingMode: "environment" };

      const readerEl = document.getElementById("reader");
      if (!readerEl) {
        isInitializing.current = false;
        return;
      }

      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        onScanSuccess,
        onScanError
      );

      isScanningActive.current = true;
      setScanStatus("scanning");
    } catch (err: any) {
      const isBusyErr = err?.name === "NotReadableError" || String(err).includes("NotReadableError");
      
      // Auto-retry silently if camera hardware was momentarily busy
      if (isBusyErr) {
        setTimeout(() => {
          isInitializing.current = false;
          if (!isScanningActive.current) {
            startScanner();
          }
        }, 500);
        return;
      }

      console.error("Scanner start error:", err?.message || err);
      setScanStatus("error");
    } finally {
      isInitializing.current = false;
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    const scanner = scannerRef.current;
    scannerRef.current = null;
    isScanningActive.current = false;

    try {
      const state = (scanner as any).getState ? (scanner as any).getState() : null;
      if (state === 2 || state === 3) {
        await scanner.stop();
      }
    } catch (err) {
      // Ignored
    }
  };

  const triggerFlash = (type: "success" | "warning" | "error") => {
    setScanFlash(type);
    setTimeout(() => setScanFlash(null), 800);
  };

  const handleNextScan = () => {
    setScanResult(null);
    setScanFlash(null);
    if (isSelectedCounterOpen) {
      setScanStatus("scanning");
    }
    lastScannedToken.current = "";
    scanInProgress.current = false;
  };

  const onScanSuccess = async (decodedText: string) => {
    // If a scan result is currently showing or an API call is in progress, block new scans
    if (scanInProgress.current || scanResult) return;
    
    scanInProgress.current = true;
    lastScannedToken.current = decodedText;
    
    setScanStatus("processing");

    try {
      const API_BASE = getApiBaseUrl();
      const res = await fetch(`${API_BASE}/api/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: decodedText,
          itemType: selectedCounter
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_profile");
        router.push("/nexus/login");
        return;
      }
      if (!res.ok) {
        // Validation / Auth errors
        vibrate("error");
        triggerFlash("error");
        setScanStatus("error");
        setScanResult({
          message: data.detail || "Invalid access pass signature."
        });
        addScanLog("Invalid Token", "ERROR", data.detail || "Verification failed");
      } else {
        const timeStr = new Date().toLocaleTimeString();
        if (data.status === "OK") {
          vibrate("success");
          triggerFlash("success");
          setScanStatus("success");
          setScanResult({
            name: data.participantName,
            email: data.email,
            teamName: data.teamName,
            teamNumber: data.teamNumber,
            college: data.college,
            role: data.role,
            time: timeStr
          });
          addScanLog(data.participantName, "OK", undefined, {
            email: data.email,
            teamName: data.teamName,
            teamNumber: data.teamNumber,
            college: data.college,
            role: data.role
          });
        } else if (data.status === "ALREADY_CLAIMED") {
          vibrate("warning");
          triggerFlash("warning");
          setScanStatus("warning");
          setScanResult({
            name: data.participantName,
            email: data.email,
            teamName: data.teamName,
            teamNumber: data.teamNumber,
            college: data.college,
            role: data.role,
            message: "Double claim blocked.",
            time: new Date(data.claimedAt).toLocaleTimeString()
          });
          addScanLog(data.participantName, "ALREADY_CLAIMED", "Already claimed", {
            email: data.email,
            teamName: data.teamName,
            teamNumber: data.teamNumber,
            college: data.college,
            role: data.role
          });
        } else if (data.status === "CLOSED") {
          vibrate("error");
          triggerFlash("error");
          setScanStatus("closed");
          setScanResult({
            message: "Counter is closed."
          });
          addScanLog("Kiosk Access", "CLOSED", "Counter closed");
          scanInProgress.current = false;
        }
      }
    } catch (err: any) {
      vibrate("error");
      triggerFlash("error");
      setScanStatus("error");
      setScanResult({
        message: "Failed to connect to backend server."
      });
    }
    // scanInProgress.current remains true while scanResult is displayed!
    // The volunteer MUST click "Next Scan ➔" to clear the message and unlock scanning!
  };

  const onScanError = (errorMessage: string) => {
    // Silent errors are normal since camera streams constantly fail to parse non-QR frames
  };

  const addScanLog = (
    name: string,
    status: ScanLog["status"],
    message?: string,
    extraDetails?: {
      email?: string;
      teamName?: string;
      teamNumber?: string;
      college?: string;
      role?: string;
    }
  ) => {
    const newLog: ScanLog = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      status,
      message,
      email: extraDetails?.email,
      teamName: extraDetails?.teamName,
      teamNumber: extraDetails?.teamNumber,
      college: extraDetails?.college,
      role: extraDetails?.role,
      timestamp: new Date().toLocaleTimeString()
    };
    setRecentScans((prev) => [newLog, ...prev.slice(0, 9)]);
  };



  return (
    <div className="relative overflow-hidden flex-1 w-full bg-[#050A18] text-white font-sans">
      {/* Background Glow effects */}
      <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />



      {/* Main Scanner Container */}
      <main className="mx-auto max-w-7xl p-6 sm:p-8 space-y-8">
        
        {/* Header Intro */}
        <div className="border-b border-slate-900 pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Access Pass Scanner</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Use your camera to scan participant QR passes, verify ticket signatures, and checkout meal tokens.
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs sm:text-sm text-red-400 animate-fade-in">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Viewfinder & Camera Controls (7/12 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Viewfinder Container */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-md shadow-xl text-center">
              
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-200">Viewfinder Screen</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Point camera at QR access pass</p>
                </div>

                {/* Camera Selector Dropdown (Hidden on mobile, always locks to rear camera on phones) */}
                {cameras.length > 1 && (
                  <select
                    value={activeCameraId}
                    onChange={(e) => setActiveCameraId(e.target.value)}
                    className="hidden sm:block rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-white focus:border-yellow-400 focus:outline-none cursor-pointer w-full sm:w-auto"
                  >
                    {cameras.map((c, i) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Viewfinder Element Wrapper */}
              <div className={`relative mx-auto aspect-square w-full max-w-sm rounded-xl overflow-hidden bg-black border transition-all duration-300 shadow-inner ${
                scanFlash === "success"
                  ? "border-emerald-500 ring-4 ring-emerald-500/30"
                  : scanFlash === "warning"
                  ? "border-yellow-400 ring-4 ring-yellow-400/30"
                  : scanFlash === "error"
                  ? "border-red-500 ring-4 ring-red-500/30"
                  : "border-slate-900/60"
              }`}>
                
                {/* HTML5 Qrcode Render Target — sized via CSS, not absolute, so the library can read dimensions */}
                <div id="reader" style={{ width: '100%', height: '100%' }} />

                {/* Scanner Viewfinder Targets Overlay (Always active while scanning) */}
                {scanStatus !== "closed" && (
                  <div className="absolute inset-0 z-[5] pointer-events-none flex flex-col items-center justify-center">
                    
                    {/* Viewfinder Neon Box Frame */}
                    <div className={`w-[65%] h-[65%] border-2 rounded-2xl relative transition-all duration-200 ${
                      scanFlash === "success"
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        : scanFlash === "warning"
                        ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                        : scanFlash === "error"
                        ? "border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : "border-yellow-400/40"
                    }`}>
                      
                      {/* Viewfinder Corners */}
                      <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />

                      {/* Moving Neon Scan Line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-yellow-400/80 shadow-[0_0_10px_#facc15] animate-scan-line" />
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 mt-6 bg-slate-950/80 border border-yellow-400/20 px-3 py-1 rounded-full animate-pulse">
                      Continuous Scanner Active
                    </span>
                  </div>
                )}

                {/* Closed State Overlay */}
                {scanStatus === "closed" && (
                  <div className="absolute inset-0 z-10 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-500 mb-4 animate-pulse">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 border border-red-500/20 bg-red-950 px-3 py-1 rounded-full mb-3">
                      Scanner Locked
                    </span>
                    <h4 className="font-extrabold text-white text-base">Selected Counter is Closed</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs">
                      Scan checkouts are locked. Please select an active open counter, or activate one in the Console.
                    </p>
                  </div>
                )}

                {/* On-Screen Floating Scan Result Banner (Renders directly ON top of the camera video) */}
                {scanResult && scanStatus !== "closed" && (
                  <div className="absolute inset-x-3 bottom-3 z-10 animate-fade-in">
                    <div className={`rounded-xl border p-3 text-center shadow-2xl backdrop-blur-md transition-all ${
                      scanResult.message === "Double claim blocked."
                        ? "bg-yellow-950/95 border-yellow-500/60 text-yellow-300"
                        : scanResult.message
                        ? "bg-red-950/95 border-red-500/60 text-red-300"
                        : "bg-emerald-950/95 border-emerald-500/60 text-emerald-300"
                    }`}>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
                        scanResult.message === "Double claim blocked."
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse"
                          : scanResult.message
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                      }`}>
                        {scanResult.message === "Double claim blocked."
                          ? "⚠️ ALREADY CLAIMED"
                          : scanResult.message
                          ? "❌ ACCESS DENIED"
                          : "✅ APPROVED"}
                      </span>
                      {scanResult.name && (
                        <p className="text-sm font-black text-white truncate max-w-[260px] mx-auto">{scanResult.name}</p>
                      )}
                      {scanResult.teamName && (
                        <p className="text-[11px] font-bold text-slate-200 truncate max-w-[260px] mx-auto mt-0.5">
                          Team: {scanResult.teamName} {scanResult.teamNumber ? `(${scanResult.teamNumber})` : ''}
                        </p>
                      )}

                      {/* Next Scan Action Button */}
                      <button
                        onClick={handleNextScan}
                        className="mt-2.5 w-full rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-1.5 px-3 text-xs font-black text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <span>Next Scan</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera support error */}
                {!isCameraSupported && (
                  <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <svg className="h-10 w-10 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5h.008v.008H16.5V10.5z" />
                    </svg>
                    <h4 className="font-bold text-slate-300">Camera Access Required</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs">
                      Could not find video capture hardware or permissions were denied. Ensure camera access is allowed.
                    </p>
                  </div>
                )}
              </div>

              {/* Latest Scan Result Card (Rendered below the camera box so camera stays 100% visible) */}
              {scanResult && (
                <div className={`mt-4 rounded-xl border p-4 text-left transition-all duration-300 animate-fade-in ${
                  scanResult.message === "Double claim blocked."
                    ? "bg-yellow-950/40 border-yellow-500/30"
                    : scanResult.message
                    ? "bg-red-950/40 border-red-500/30"
                    : "bg-emerald-950/40 border-emerald-500/30"
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        scanResult.message === "Double claim blocked."
                          ? "bg-yellow-400 animate-ping"
                          : scanResult.message
                          ? "bg-red-500"
                          : "bg-emerald-400 animate-pulse"
                      }`} />
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        scanResult.message === "Double claim blocked."
                          ? "text-yellow-400"
                          : scanResult.message
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}>
                        {scanResult.message === "Double claim blocked."
                          ? "⚠️ ALREADY CLAIMED"
                          : scanResult.message
                          ? "❌ ACCESS DENIED"
                          : "✅ APPROVED"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{scanResult.time}</span>
                  </div>

                  {scanResult.name && (
                    <h4 className="text-base font-extrabold text-white">{scanResult.name}</h4>
                  )}

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    {scanResult.teamName && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Team:</span>
                        <span className="font-semibold text-yellow-300">{scanResult.teamName} {scanResult.teamNumber ? `(${scanResult.teamNumber})` : ''}</span>
                      </div>
                    )}
                    {scanResult.college && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">College:</span>
                        <span className="font-medium text-slate-300 truncate block">{scanResult.college}</span>
                      </div>
                    )}
                    {scanResult.email && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block">Email:</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate block">{scanResult.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Next Scan Action Button */}
                  <button
                    onClick={handleNextScan}
                    className="mt-3.5 w-full rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 py-2 px-4 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Next Scan ➔</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Counter Selector & Recent Scans (5/12 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Counter Selector Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Counter Target</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the active food counter session to verify checkout</p>
              </div>

              {isLoadingCounters ? (
                <div className="h-10 w-full rounded-lg bg-slate-900 animate-pulse" />
              ) : (
                <div className="space-y-3">
                  <select
                    value={selectedCounter}
                    onChange={(e) => setSelectedCounter(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    {counters.length === 0 ? (
                      <option value="" className="bg-slate-900 text-white">No counters defined</option>
                    ) : (
                      counters.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.isOpen ? "🔓" : "🔒"} {c.name} {c.isOpen ? "(OPEN)" : "(CLOSED - LOCKED)"}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Active Counter Status Indicator */}
                  {selectedCounter && (
                    <div className="pt-1">
                      {counters.find(c => c.id === selectedCounter)?.isOpen ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400/90">
                          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
                          <span>Active Counter - Accepting Claims</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-400/90">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Counter Closed - Scans Blocked</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Scans Panel */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Recent Scans</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Logs of active scans in this session</p>
                </div>
                {recentScans.length > 0 && (
                  <button 
                    onClick={() => setRecentScans([])}
                    className="text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {recentScans.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-600 font-semibold italic">
                    No scans registered yet.
                  </div>
                ) : (
                  recentScans.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between rounded-lg border border-slate-900 bg-slate-950/60 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {log.status === "OK" ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            ✓
                          </span>
                        ) : log.status === "ALREADY_CLAIMED" ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                            !
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                            ✕
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{log.name}</p>
                          {log.teamName && (
                            <p className="text-[10px] text-yellow-400/90 font-medium truncate">
                              {log.teamName} {log.teamNumber ? `(${log.teamNumber})` : ''}
                            </p>
                          )}
                          {log.email && !log.teamName && (
                            <p className="text-[10px] text-slate-400 font-mono truncate">{log.email}</p>
                          )}
                          {log.message && <p className="text-[10px] text-slate-500 truncate">{log.message}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
