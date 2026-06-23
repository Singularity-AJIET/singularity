import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
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
