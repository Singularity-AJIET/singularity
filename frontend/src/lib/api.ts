import axios from "axios";

/**
 * Returns the base API URL for the backend.
 * Priority:
 *  1. NEXT_PUBLIC_API_URL env var (set this in production)
 *  2. Dynamically resolved from browser hostname (for local-network devices)
 *  3. Fallback to http://localhost:3001
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
}

/** Returns the stored admin role ('superadmin' | 'admin' | 'volunteer') or null if not logged in. */
export function getAdminRole(): string | null {
  if (typeof window === "undefined") return null;
  const profile = localStorage.getItem("admin_profile");
  if (!profile) return null;
  try {
    return JSON.parse(profile)?.role || null;
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

export interface RegistrationPayload {
  full_name: string;
  email: string;
  phone: string;
  college: string;
  year_of_study: string;
  team_name?: string;
  team_size: number;
  is_team_lead: boolean;
  team_lead_email?: string;
  track: string;
  experience_level: string;
  project_idea?: string;
}

export const submitRegistration = (data: RegistrationPayload) =>
  api.post("/api/registrations/", data).then((r) => r.data);

export const fetchEventInfo = () =>
  api.get("/api/event-info").then((r) => r.data);

export const fetchFAQ = () =>
  api.get("/api/faq/").then((r) => r.data);

export const fetchStats = () =>
  api.get("/api/registrations/stats").then((r) => r.data);

export default api;
