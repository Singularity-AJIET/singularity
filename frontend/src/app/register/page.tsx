"use client";
import { useState } from "react";
import Link from "next/link";
import { submitRegistration } from "@/lib/api";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar/Navbar";

const TRACKS = ["AI/ML", "Web3", "Social Impact", "FinTech"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  college: string;
  year_of_study: string;
  team_name: string;
  team_size: number;
  is_team_lead: boolean;
  team_lead_email: string;
  track: string;
  experience_level: string;
  project_idea: string;
}

const INIT: FormData = {
  full_name: "", email: "", phone: "", college: "", year_of_study: "",
  team_name: "", team_size: 1, is_team_lead: true, team_lead_email: "",
  track: "", experience_level: "", project_idea: "",
};

const STEPS = ["Personal Info", "Team Info", "Track & Level", "Review"];

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.full_name.trim()) errs.full_name = "Name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
      if (!form.phone.trim()) errs.phone = "Phone is required";
      if (!form.college.trim()) errs.college = "College is required";
      if (!form.year_of_study) errs.year_of_study = "Year of study is required";
    }
    if (step === 2) {
      if (!form.is_team_lead && !form.team_lead_email.trim())
        errs.team_lead_email = "Team lead email required";
    }
    if (step === 3) {
      if (!form.track) errs.track = "Select a track";
      if (!form.experience_level) errs.experience_level = "Select experience level";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4) as Step); };
  const prevStep = () => { setFieldErrors({}); setStep((s) => Math.max(s - 1, 1) as Step); };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await submitRegistration({
        ...form,
        year_of_study: form.year_of_study,
        team_lead_email: form.team_lead_email || undefined,
        team_name: form.team_name || undefined,
      } as Parameters<typeof submitRegistration>[0]);
      setSuccess(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <div className="section-label" style={{ marginBottom: 8, textAlign: "center" }}>registration complete</div>
            <h1 className={styles.successTitle}>YOU&apos;RE IN!</h1>
            <p className={styles.successSub}>
              Welcome to Singularity Hack, <strong>{form.full_name}</strong>!<br />
              Confirmation details sent to <strong>{form.email}</strong>.
            </p>
            <div className={styles.successDetails}>
              <div className={styles.successRow}><span>Track</span><span className="text-lime">{form.track}</span></div>
              <div className={styles.successRow}><span>Team</span><span>{form.team_name || "Solo"}</span></div>
              <div className={styles.successRow}><span>Date</span><span>Aug 15–17, 2026</span></div>
            </div>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
              BACK TO HOME
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* ── Left Panel ── */}
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <div className="section-label">// registration portal</div>
            <h1 className={styles.leftTitle}>
              JOIN<br />
              THE <span className="text-lime">HACK.</span>
            </h1>
            <p className={styles.leftSub}>
              Secure your spot at Singularity Hack 2026. Limited seats — register early.
            </p>

            <div className={styles.highlights}>
              {["Free to enter", "36 hours of hacking", "₹1L+ prize pool", "Food & stay included"].map((h) => (
                <div key={h} className={styles.highlight}>
                  <span className={styles.hlCheck}>✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Step indicator */}
            <div className={styles.stepList}>
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`${styles.stepItem} ${step === i + 1 ? styles.stepActive : step > i + 1 ? styles.stepDone : ""}`}
                >
                  <span className={styles.stepNum}>{step > i + 1 ? "✓" : `0${i + 1}`}</span>
                  <span className={styles.stepName}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel — Form ── */}
        <div className={styles.right}>
          <div className={styles.formCard}>
            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${(step / 4) * 100}%` }} />
            </div>

            <div className={styles.formHeader}>
              <span className={styles.stepBadge}>Step {step} of 4</span>
              <h2 className={styles.formTitle}>{STEPS[step - 1]}</h2>
            </div>

            {/* Step 1 — Personal Info */}
            {step === 1 && (
              <div className={styles.fields}>
                {[
                  { key: "full_name" as keyof FormData, label: "Full Name *", placeholder: "Arjun Mehta", type: "text" },
                  { key: "email" as keyof FormData, label: "Email Address *", placeholder: "you@college.edu.in", type: "email" },
                  { key: "phone" as keyof FormData, label: "Phone Number *", placeholder: "+91 98765 43210", type: "tel" },
                  { key: "college" as keyof FormData, label: "College / University *", placeholder: "IIT Bombay", type: "text" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key} className={styles.field}>
                    <label className={styles.label}>{label}</label>
                    <input
                      className={`${styles.input} ${fieldErrors[key] ? styles.inputError : ""}`}
                      type={type}
                      placeholder={placeholder}
                      value={form[key] as string}
                      onChange={(e) => { set(key, e.target.value); setFieldErrors(p => ({ ...p, [key]: "" })); }}
                    />
                    {fieldErrors[key] && <span className={styles.fieldError}>{fieldErrors[key]}</span>}
                  </div>
                ))}
                <div className={styles.field}>
                  <label className={styles.label}>Year of Study *</label>
                  <select
                    className={`${styles.input} ${fieldErrors.year_of_study ? styles.inputError : ""}`}
                    value={form.year_of_study}
                    onChange={(e) => { set("year_of_study", e.target.value); setFieldErrors(p => ({ ...p, year_of_study: "" })); }}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {fieldErrors.year_of_study && <span className={styles.fieldError}>{fieldErrors.year_of_study}</span>}
                </div>
              </div>
            )}

            {/* Step 2 — Team Info */}
            {step === 2 && (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Team Name (optional)</label>
                  <input className={styles.input} placeholder="Team Singularity" value={form.team_name} onChange={(e) => set("team_name", e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Team Size *</label>
                  <div className={styles.sizeRow}>
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} type="button"
                        className={`${styles.sizeBtn} ${form.team_size === n ? styles.sizeBtnActive : ""}`}
                        onClick={() => set("team_size", n)}
                      >{n}</button>
                    ))}
                  </div>
                  <span className={styles.hint}>Max 4 members per team</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Are you the team lead?</label>
                  <div className={styles.radioRow}>
                    <label className={`${styles.radio} ${form.is_team_lead ? styles.radioActive : ""}`}>
                      <input type="radio" checked={form.is_team_lead} onChange={() => set("is_team_lead", true)} />
                      <span>Yes, I&apos;m the lead</span>
                    </label>
                    <label className={`${styles.radio} ${!form.is_team_lead ? styles.radioActive : ""}`}>
                      <input type="radio" checked={!form.is_team_lead} onChange={() => set("is_team_lead", false)} />
                      <span>No, someone else is</span>
                    </label>
                  </div>
                </div>
                {!form.is_team_lead && (
                  <div className={styles.field}>
                    <label className={styles.label}>Team Lead&apos;s Email *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.team_lead_email ? styles.inputError : ""}`}
                      type="email"
                      placeholder="lead@college.edu.in"
                      value={form.team_lead_email}
                      onChange={(e) => { set("team_lead_email", e.target.value); setFieldErrors(p => ({ ...p, team_lead_email: "" })); }}
                    />
                    {fieldErrors.team_lead_email && <span className={styles.fieldError}>{fieldErrors.team_lead_email}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — Track & Level */}
            {step === 3 && (
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Choose Your Track *</label>
                  <div className={styles.trackGrid}>
                    {TRACKS.map((t) => (
                      <button key={t} type="button"
                        className={`${styles.trackBtn} ${form.track === t ? styles.trackBtnActive : ""}`}
                        onClick={() => { set("track", t); setFieldErrors(p => ({ ...p, track: "" })); }}
                      >{t}</button>
                    ))}
                  </div>
                  {fieldErrors.track && <span className={styles.fieldError}>{fieldErrors.track}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Experience Level *</label>
                  <div className={styles.levelRow}>
                    {LEVELS.map((l) => (
                      <button key={l} type="button"
                        className={`${styles.levelBtn} ${form.experience_level === l ? styles.levelBtnActive : ""}`}
                        onClick={() => { set("experience_level", l); setFieldErrors(p => ({ ...p, experience_level: "" })); }}
                      >{l}</button>
                    ))}
                  </div>
                  {fieldErrors.experience_level && <span className={styles.fieldError}>{fieldErrors.experience_level}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Project Idea (optional)</label>
                  <textarea className={`${styles.input} ${styles.textarea}`}
                    placeholder="Briefly describe what you plan to build..."
                    value={form.project_idea}
                    onChange={(e) => set("project_idea", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {step === 4 && (
              <div className={styles.fields}>
                <div className={styles.reviewGrid}>
                  {[
                    ["Name", form.full_name], ["Email", form.email], ["Phone", form.phone],
                    ["College", form.college], ["Year", form.year_of_study],
                    ["Team", form.team_name || "Solo"], ["Team Size", String(form.team_size)],
                    ["Track", form.track], ["Level", form.experience_level],
                  ].map(([k, v]) => (
                    <div key={k} className={styles.reviewRow}>
                      <span className={styles.reviewKey}>{k}</span>
                      <span className={styles.reviewVal}>{v || "—"}</span>
                    </div>
                  ))}
                </div>
                {form.project_idea && (
                  <div className={styles.reviewIdea}>
                    <div className={styles.reviewKey}>Project Idea</div>
                    <div className={styles.reviewIdeaText}>{form.project_idea}</div>
                  </div>
                )}
                {error && <div className={styles.error}>{error}</div>}
                <p className={styles.consent}>
                  By registering you agree to the Code of Conduct and confirm all information is accurate.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.nav}>
              {step > 1 && (
                <button className="btn btn-outline" onClick={prevStep} disabled={loading}>
                  ← BACK
                </button>
              )}
              {step < 4 ? (
                <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={nextStep}>
                  NEXT →
                </button>
              ) : (
                <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={handleSubmit} disabled={loading}>
                  {loading ? "SUBMITTING..." : "CONFIRM REGISTRATION ✓"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
