"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Exclude the login page itself from the auth check
    if (pathname === "/nexus/login") {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/nexus/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  // Don't render protected content until authentication is verified
  if (!isAuthenticated) {
    return null; 
  }

  return <>{children}</>;
}
