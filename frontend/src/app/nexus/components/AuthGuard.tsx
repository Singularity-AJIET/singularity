"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Exclude the login page itself from the auth check
    if (pathname === "/nexus/login") {
      setStatus("authenticated");
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setStatus("unauthenticated");
      router.push("/nexus/login");
    } else {
      setStatus("authenticated");
    }
  }, [router, pathname]);

  // Show a sleek loading screen while checking auth to prevent UI flicker/latency
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#111010" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#c8f135", borderTopColor: "transparent" }}
          />
          <span
            className="text-xs uppercase tracking-widest text-[#888580]"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  // If unauthenticated and not on login page, don't render content
  if (status === "unauthenticated" && pathname !== "/nexus/login") {
    return null; 
  }

  return <>{children}</>;
}
