"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClinicianIntakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Only strictly required fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [surgery, setSurgery] = useState("Total Knee Replacement (Left)");
  const [surgeryDate, setSurgeryDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle PIN Pad authentication
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

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/portal/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          surgery,
          surgeryDate,
          pin,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`✓ ${name} registered — portal invite ready.`);
        // Reset form for next patient
        setName("");
        setEmail("");
      } else {
        setErrorMsg(data.error || "Failed to register patient");
      }
    } catch (err: any) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-xs text-slate-500">Enter your 6-digit Security PIN to open the Theatre Intake portal</p>
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
              {pinError && <p className="text-xs text-rose-500 text-center mt-2">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/portal" className="text-xs text-clinical-teal hover:underline font-semibold">
              Return to Patient Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center w-full">
      {/* Header bar */}
      <header className="w-full bg-slate-950 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <img
            src="/brand/lkc-logo-k-transparent.png"
            alt="Logo"
            className="h-9 w-auto"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider font-serif">Lincolnshire Knee Clinic</h1>
            <span className="text-[10px] text-clinical-teal font-semibold">Quick Patient Registration</span>
          </div>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs border border-slate-800 bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Lock
        </button>
      </header>

      {/* Main Form container */}
      <main className="w-full sm:max-w-md p-3 sm:p-4 space-y-4">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm font-medium flex items-center space-x-2">
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm font-medium flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-serif font-bold text-slate-950 text-base">Register Patient</h2>
            <p className="text-[11px] text-slate-400 mt-1">Patient completes remaining details on first portal login.</p>
          </div>

          <form onSubmit={handleRegisterPatient} className="space-y-4 text-slate-900">
            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Patient Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Henderson"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
              />
            </div>

            {/* Patient Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. patient@example.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
              />
            </div>

            {/* Treatment Pathway */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Treatment Pathway *</label>
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

            {/* Treatment Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Treatment Date *</label>
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
      </main>
    </div>
  );
}
