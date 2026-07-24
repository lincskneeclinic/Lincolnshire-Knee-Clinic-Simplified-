"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type TabId = "register" | "patients" | "today";

interface PatientRecord {
  name: string;
  patientId: string;
  surgery: string;
  surgeryDate: string;
  daysPostOp: number;
  surgeon: string;
  accessTier: string;
  dob?: string;
  balanceDue?: number;
}

export default function ClinicianIntakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("register");

  // Register form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [surgery, setSurgery] = useState("Total Knee Replacement (Left)");
  const [surgeryDate, setSurgeryDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Patient list state
  const [patients, setPatients] = useState<Record<string, PatientRecord>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const fetchPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    try {
      const res = await fetch("/api/portal/patients");
      const data = await res.json();
      setPatients(data || {});
    } catch {
      // silently fail
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  // Fetch patients when switching to list/today tabs
  useEffect(() => {
    if (isAuthenticated && (activeTab === "patients" || activeTab === "today")) {
      fetchPatients();
    }
  }, [isAuthenticated, activeTab, fetchPatients]);

  // PIN authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "230670") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid Pin. Please check your credentials.");
      setPin("");
    }
  };

  // Register patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/portal/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, surgery, surgeryDate, pin }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`✓ ${name} registered — portal invite ready.`);
        setName("");
        setEmail("");
        // Refresh patient list in background
        fetchPatients();
      } else {
        setErrorMsg(data.error || "Failed to register patient");
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers
  const todayISO = new Date().toISOString().split("T")[0];

  const patientEntries = Object.entries(patients);

  const filteredPatients = patientEntries.filter(([emailKey, p]) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      emailKey.toLowerCase().includes(q) ||
      p.surgery?.toLowerCase().includes(q) ||
      p.patientId?.toLowerCase().includes(q)
    );
  });

  const todaysPatients = patientEntries.filter(
    ([, p]) => p.surgeryDate === todayISO
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Surgery":
        return "bg-blue-100 text-blue-700";
      case "Injection":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ─── PIN Lock Screen ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center space-y-3 mb-6">
            <img
              src="/brand/lkc-logo-k-transparent.png"
              alt="Logo"
              className="h-16 w-auto mx-auto"
            />
            <h1 className="text-xl font-bold text-slate-950 font-serif">Clinician Access</h1>
            <p className="text-xs text-slate-500">
              Enter your 6-digit Security PIN to open the Theatre Intake portal
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-slate-200 rounded-xl focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
              />
              {pinError && (
                <p className="text-xs text-rose-500 text-center mt-2">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/portal"
              className="text-xs text-clinical-teal hover:underline font-semibold"
            >
              Return to Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Authenticated View ───
  const tabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "register", label: "Register", icon: "➕" },
    { id: "patients", label: "Patients", icon: "👥", count: patientEntries.length },
    { id: "today", label: "Today", icon: "📅", count: todaysPatients.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      {/* Header bar */}
      <header className="w-full bg-slate-950 text-white p-3 sm:p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <img
            src="/brand/lkc-logo-k-transparent.png"
            alt="Logo"
            className="h-9 w-auto"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider font-serif">
              Lincolnshire Knee Clinic
            </h1>
            <span className="text-[10px] text-clinical-teal font-semibold">
              Clinician Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs border border-slate-800 bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Lock
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-colors relative ${
                activeTab === tab.id
                  ? "text-slate-950 border-b-2 border-clinical-teal"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full w-5 h-5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="w-full sm:max-w-lg mx-auto p-3 sm:p-4 flex-1">
        {/* ─── Register Tab ─── */}
        {activeTab === "register" && (
          <div className="space-y-4">
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-sm font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-serif font-bold text-slate-950 text-base">
                  Register Patient
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  Patient completes remaining details on first portal login.
                </p>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4 text-slate-900">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Henderson"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. patient@example.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Treatment Pathway *
                  </label>
                  <select
                    value={surgery}
                    onChange={(e) => setSurgery(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950 font-sans"
                  >
                    <option value="Total Knee Replacement (Left)">Total Knee Replacement (Left)</option>
                    <option value="Total Knee Replacement (Right)">Total Knee Replacement (Right)</option>
                    <option value="ACL Reconstruction (Left)">ACL Reconstruction (Left)</option>
                    <option value="ACL Reconstruction (Right)">ACL Reconstruction (Right)</option>
                    <option value="Patellar Stabilisation (Left)">Patellar Stabilisation (Left)</option>
                    <option value="Patellar Stabilisation (Right)">Patellar Stabilisation (Right)</option>
                    <option value="Arthrosamid® Injection (Left)">Arthrosamid® Injection (Left)</option>
                    <option value="Arthrosamid® Injection (Right)">Arthrosamid® Injection (Right)</option>
                    <option value="Knee Pain Assessment">Knee Pain Assessment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Treatment Date *
                  </label>
                  <input
                    type="date"
                    value={surgeryDate}
                    onChange={(e) => setSurgeryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm mt-2"
                >
                  {isSubmitting ? "Registering..." : "Register Patient"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── Patient List Tab ─── */}
        {activeTab === "patients" && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or procedure..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-clinical-teal focus:outline-none bg-white text-slate-950 text-sm"
              />
            </div>

            {isLoadingPatients ? (
              <div className="text-center py-12 text-slate-400 text-sm">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="text-3xl mb-3">👥</div>
                <p className="text-sm font-semibold text-slate-600">
                  {patientEntries.length === 0
                    ? "No patients registered yet"
                    : "No patients match your search"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {patientEntries.length === 0
                    ? "Use the Register tab to add your first patient."
                    : "Try a different search term."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold px-1">
                  {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
                </p>
                {filteredPatients.map(([emailKey, p]) => (
                  <div
                    key={emailKey}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-950 truncate">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">{emailKey}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getTierBadge(
                          p.accessTier
                        )}`}
                      >
                        {p.accessTier}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span className="font-medium">{p.surgery}</span>
                      <span>
                        {formatDate(p.surgeryDate)}
                      </span>
                      <span className="font-mono text-slate-400">{p.patientId}</span>
                    </div>
                    {p.daysPostOp > 0 && (
                      <p className="text-[10px] text-clinical-teal font-semibold">
                        Day {p.daysPostOp} post-op
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Today's List Tab ─── */}
        {activeTab === "today" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-slate-950 text-base">
                    Today&apos;s List
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={fetchPatients}
                  className="text-[11px] text-clinical-teal font-bold hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>

            {isLoadingPatients ? (
              <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
            ) : todaysPatients.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="text-3xl mb-3">📅</div>
                <p className="text-sm font-semibold text-slate-600">
                  No procedures scheduled for today
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Patients registered with today&apos;s date will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold px-1">
                  {todaysPatients.length} procedure{todaysPatients.length !== 1 ? "s" : ""} today
                </p>
                {todaysPatients.map(([emailKey, p], idx) => (
                  <div
                    key={emailKey}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-950 truncate">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">{p.surgery}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getTierBadge(
                          p.accessTier
                        )}`}
                      >
                        {p.accessTier}
                      </span>
                    </div>
                    <div className="mt-2 pl-11 text-[11px] text-slate-400">
                      <span className="font-mono">{p.patientId}</span>
                      <span className="mx-2">·</span>
                      <span>{emailKey}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
