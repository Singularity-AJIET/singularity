"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";

interface ImportedParticipant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  team_id: number | null;
}

interface AdminUser {
  id: number;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin] = useState<Record<string, unknown> | null>(null);
  
  // Navigation tabs: 'feed' | 'admins'
  const [activeTab, setActiveTab] = useState<"feed" | "admins">("admins");

  // Global State Notification
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // === Tab 1: CSV Import Feed State ===
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [successList, setSuccessList] = useState<ImportedParticipant[] | null>(null);

  // === Tab 2: Admin Management State ===
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  
  // Form Create admin
  const [createUsername, setCreateUsername] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("admin");
  const [createLoading, setCreateLoading] = useState(false);

  // Form Change password
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [updatePasswordValue, setUpdatePasswordValue] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Authenticate Admin
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const profile = localStorage.getItem("admin_profile");

    if (!token || !profile) {
      router.push("/nexus/login");
      return;
    }

    const parsedProfile = JSON.parse(profile);
    // Volunteers cannot access Settings
    if (parsedProfile.role === 'volunteer') {
      router.push("/nexus/scanner");
      return;
    }

    setAdmin(parsedProfile);
  }, [router]);

  // Load admins list when tab changes
  useEffect(() => {
    if (activeTab === "admins") {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Toast Auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    router.push("/nexus/login");
  };

  const fetchAdmins = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setAdminsLoading(true);
    setError("");

    try {
      const API_BASE = getApiBaseUrl();
      const res = await fetch(`${API_BASE}/api/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) return handleLogout();
      if (!res.ok) throw new Error("Failed to load administrator accounts.");
      const data = await res.json();
      setAdminsList(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAdminsLoading(false);
    }
  };

  // === CSV Import actions ===
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    const name = selectedFile.name.toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) {
      setFile(selectedFile);
      setSuccessList(null);
    } else {
      setError("Unsupported file format. Please upload a .csv, .xlsx, or .xls file.");
      setFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setSuccessList(null);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/nexus/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/participants/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to process import file.");
      }

      setSuccessList(data.added || []);
      setToast({
        message: `Import complete! Successfully added ${data.insertedCount || 0} participants and ${data.teamsCreatedCount || 0} teams.`,
        type: "success"
      });

      // Clear selected file after successful upload
      setFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during file import.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently wipe all participants, teams, staff members, and claims logs? This resets all counters and cannot be undone."
    );
    if (!confirmed) return;

    setIsClearing(true);
    setError("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/nexus/login");
      return;
    }

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/participants/clear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to reset database.");
      }

      setToast({ message: "All database tables successfully wiped!", type: "success" });
      setSuccessList(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while clearing data.");
    } finally {
      setIsClearing(false);
    }
  };

  // === Admin Management actions ===
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername || !createPassword) return;

    setCreateLoading(true);
    setError("");

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/admin/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: createUsername,
          name: createName || null,
          password: createPassword,
          role: createRole
        })
      });

      const data = await response.json();

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to register new administrator.");
      }

      setToast({ message: `Successfully registered admin "${createUsername}"!`, type: "success" });
      setCreateUsername("");
      setCreateName("");
      setCreatePassword("");
      setCreateRole("admin");
      
      // Reload administrator accounts list
      await fetchAdmins();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration request failed.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdatePassword = async (id: number, username: string) => {
    if (!updatePasswordValue) return;

    setUpdateLoading(true);
    setError("");

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/admin/${id}/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: updatePasswordValue })
      });

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update password.");
      }

      setToast({ message: `Successfully updated password for "${username}"!`, type: "success" });
      setEditingAdminId(null);
      setUpdatePasswordValue("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password update failed.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number, username: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete administrator account "${username}"?`);
    if (!confirmed) return;

    setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const API_BASE = getApiBaseUrl();
      const response = await fetch(`${API_BASE}/api/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) return handleLogout();
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete administrator.");
      }

      setToast({ message: `Successfully deleted admin account "${username}"!`, type: "success" });
      await fetchAdmins();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
    }
  };



  if (!admin) return null;

  return (
    <div className="relative overflow-hidden flex-1 w-full bg-[#050A18] text-white font-sans">
      {/* Decorative ambient glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-400/5 blur-[120px]" />



      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-4 sm:p-8 space-y-8">
        
        {/* Floating Toast Notification Banner */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-2xl max-w-md animate-fade-in ${
            toast.type === "success" 
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 backdrop-blur-md" 
              : "bg-red-950/80 border-red-500/30 text-red-400 backdrop-blur-md"
          }`}>
            {toast.type === "success" ? (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header Intro */}
        <div className="border-b border-slate-900 pb-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Settings</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Import roster files, reset event logs, or manage administrator access credentials.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs sm:text-sm text-red-400 mb-6 animate-fade-in">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Two-Column Grid Sidebar Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <aside className="w-full md:w-60 shrink-0 flex flex-row md:flex-col gap-2 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-900 md:pr-6">
            <button
              onClick={() => {
                setActiveTab("admins");
                setError("");
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border-l-2 ${
                activeTab === "admins"
                  ? "bg-yellow-400/10 text-yellow-400 border-yellow-400"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/30 border-transparent"
              }`}
            >
              Admin Management
            </button>
            <button
              onClick={() => {
                setActiveTab("feed");
                setError("");
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border-l-2 ${
                activeTab === "feed"
                  ? "bg-yellow-400/10 text-yellow-400 border-yellow-400"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/30 border-transparent"
              }`}
            >
              Import Feed
            </button>
          </aside>

          {/* Right Panel Content */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === "feed" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <h3 className="text-lg font-bold text-slate-200">Bulk Import & Reset</h3>
              
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="shrink-0 rounded-lg border border-red-500/30 hover:border-red-500 bg-red-950/20 hover:bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isClearing ? "Wiping..." : "Wipe All Data"}
              </button>
            </div>

            {/* CSV Uploader */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 sm:p-8 backdrop-blur-md shadow-xl border-dashed">
              <form onSubmit={handleUpload} className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
                    isDragging
                      ? "border-yellow-400 bg-yellow-400/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                      : file
                      ? "border-yellow-400/60 bg-slate-900/40"
                      : "border-slate-800 hover:border-yellow-400/30 hover:bg-slate-900/20"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />

                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 mb-4 border transition-all ${file ? 'border-yellow-400 text-yellow-400' : 'border-slate-800 text-slate-400'}`}>
                    {file ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>

                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-white max-w-xs truncate mx-auto">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB &bull; Ready to upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drag and drop file here, or <span className="text-yellow-400 underline decoration-dashed">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Supports CSV, XLSX, and XLS formats (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Clear File
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-lg bg-yellow-400 text-black px-6 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:bg-yellow-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? "Importing..." : "Upload and Sync"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* CSV Reference Guide */}
              <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-5 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Expected CSV Column Header Names</h4>
                <p className="text-xs text-slate-400 mb-4">
                  The CSV parsing engine checks columns based on name references. Ensure your CSV has columns matching these names.
                  <br /><span className="text-yellow-400 font-semibold mt-1 inline-block">Pro Tip:</span> To import Faculty or Volunteers instead of Participants, simply set their <code className="bg-slate-900 text-yellow-400 px-1.5 py-0.5 rounded border border-slate-800">role</code> column to <code className="text-slate-300">faculty</code>, <code className="text-slate-300">volunteer</code>, or <code className="text-slate-300">hod</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs text-yellow-400/80">
                <div className="bg-black/30 p-2 rounded">&bull; name (Full Name)</div>
                <div className="bg-black/30 p-2 rounded">&bull; email (Unique Email)</div>
                <div className="bg-black/30 p-2 rounded">&bull; phone (Optional)</div>
                <div className="bg-black/30 p-2 rounded">&bull; team_name (or teamName)</div>
                <div className="bg-black/30 p-2 rounded">&bull; team_number (Optional)</div>
                <div className="bg-black/30 p-2 rounded">&bull; college (College Name)</div>
              </div>
            </div>

            {/* Uploaded Success Listing */}
            {successList && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-bold">Successfully Imported {successList.length} Participants</h3>
                </div>

                <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {successList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/20">
                          <td className="p-4 font-semibold text-white">{p.name}</td>
                          <td className="p-4 text-slate-400">{p.email}</td>
                          <td className="p-4 text-slate-400">{p.phone || "N/A"}</td>
                          <td className="p-4 text-left">
                            <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 uppercase border border-yellow-400/25">
                              {p.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden space-y-3">
                  {successList.map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 uppercase border border-yellow-400/25">
                          {p.role}
                        </span>
                      </div>
                      <p className="text-slate-400 truncate"><span className="text-slate-500 font-medium">Email:</span> {p.email}</p>
                      <p className="text-slate-400"><span className="text-slate-550 font-medium">Phone:</span> {p.phone || "N/A"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // === Admin Management Tab Content ===
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Manage Administrator Accounts</h3>

            {/* Create Administrator Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 sm:p-6 backdrop-blur-md shadow-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Register New Administrator</h4>
              
              <form onSubmit={handleCreateAdmin} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username</label>
                  <input
                    type="text"
                    required
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="admin" className="bg-slate-900 text-white">Administrator</option>
                    <option value="volunteer" className="bg-slate-900 text-white">Volunteer</option>
                    {admin?.role === 'superadmin' && <option value="superadmin" className="bg-slate-900 text-white">Superadmin</option>}
                  </select>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 text-xs font-bold uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0 h-[38px] cursor-pointer"
                  >
                    {createLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>

            {/* Admins Table/List */}
            {adminsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                  <span className="text-xs">Loading administrators...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Existing Administrators</h4>
                
                {/* Desktop View Table */}
                <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-4">Username</th>
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {adminsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/10">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <span>{item.username}</span>
                            {item.username === "admin" && (
                              <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 border border-yellow-400/20 uppercase tracking-wide">
                                Root
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-300">{item.name || "N/A"}</td>
                          <td className="p-4 text-slate-300 capitalize">{item.role}</td>
                          <td className="p-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right space-x-2">
                            {editingAdminId === item.id ? (
                              <div className="inline-flex items-center gap-2">
                                <input
                                  type="password"
                                  value={updatePasswordValue}
                                  onChange={(e) => setUpdatePasswordValue(e.target.value)}
                                  placeholder="New password..."
                                  className="rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-white focus:border-yellow-400 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleUpdatePassword(item.id, item.username)}
                                  disabled={updateLoading}
                                  className="rounded bg-yellow-400 hover:bg-yellow-300 text-black px-2.5 py-1 text-xs font-bold uppercase transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingAdminId(null);
                                    setUpdatePasswordValue("");
                                  }}
                                  className="rounded border border-slate-850 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingAdminId(item.id)}
                                  className="rounded border border-slate-800 hover:border-yellow-400/35 bg-slate-900/40 hover:text-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                                >
                                  Change Password
                                </button>
                                {item.username !== "admin" && admin.username !== item.username && (
                                  <button
                                    onClick={() => handleDeleteAdmin(item.id, item.username)}
                                    className="rounded border border-red-950 bg-red-950/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="sm:hidden space-y-3">
                  {adminsList.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{item.username}</span>
                            {item.username === "admin" && (
                              <span className="rounded bg-yellow-400/10 px-1 py-0.5 text-[9px] font-bold text-yellow-400 border border-yellow-400/20 uppercase">
                                Root
                              </span>
                            )}
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {item.name || "No Full Name"} • <span className="capitalize">{item.role}</span>
                          </p>
                        </div>
                        <p className="text-slate-550 text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>

                      {editingAdminId === item.id ? (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-900/50">
                          <label className="block text-xs font-bold text-slate-400">Change Password</label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={updatePasswordValue}
                              onChange={(e) => setUpdatePasswordValue(e.target.value)}
                              placeholder="New password..."
                              className="flex-1 rounded border border-slate-800 bg-slate-900/60 px-2 py-1.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdatePassword(item.id, item.username)}
                              disabled={updateLoading}
                              className="rounded bg-yellow-400 text-black px-3 py-1.5 text-xs font-bold uppercase transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingAdminId(null);
                                setUpdatePasswordValue("");
                              }}
                              className="rounded border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-900/50">
                          <button
                            onClick={() => setEditingAdminId(item.id)}
                            className="rounded border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                          >
                            Change Password
                          </button>
                          {item.username !== "admin" && admin.username !== item.username && (
                            <button
                              onClick={() => handleDeleteAdmin(item.id, item.username)}
                              className="rounded border border-red-950 bg-red-950/20 text-red-400 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}
          </div>
        </div>

      </main>
    </div>
  );
}
