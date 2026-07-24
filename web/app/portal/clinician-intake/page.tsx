"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClinicianIntakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [patientId, setPatientId] = useState("");
  const [surgery, setSurgery] = useState("Total Knee Replacement (Left)");
  const [surgeryDate, setSurgeryDate] = useState(new Date().toISOString().split("T")[0]);
  const [balanceDue, setBalanceDue] = useState("0");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePreAuth, setInsurancePreAuth] = useState("");

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
          dob,
          patientId,
          surgery,
          surgeryDate,
          balanceDue: parseFloat(balanceDue) || 0,
          insuranceProvider,
          insurancePreAuth,
          pin,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`Patient ${name} successfully synced to Portal!`);
        // Reset form
        setName("");
        setEmail("");
        setDob("");
        setPatientId("");
        setBalanceDue("0");
        setInsuranceProvider("");
        setInsurancePreAuth("");
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

          {/* Clinician helpful note */}
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
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
            <span className="text-[10px] text-clinical-teal font-semibold">Theatre & Clinic Registry Flow</span>
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
      <main className="max-w-md w-full p-4 space-y-4">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm font-medium flex items-center space-x-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm font-medium flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h2 className="font-serif font-bold text-slate-950 text-base">New Patient Registration</h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-bold">Mobile View</span>
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
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
              />
            </div>

            {/* Patient Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address (Login Username) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. patient@example.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
              />
            </div>

            {/* DOB & Patient ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">DOB (DD/MM/YYYY)</label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="01/01/1980"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. LKC-90211"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
            </div>

            {/* Surgery/Pathway Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Treatment Pathway *</label>
              <select
                value={surgery}
                onChange={(e) => setSurgery(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950 font-sans"
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

            {/* Date of Surgery & Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Treatment Date</label>
                <input
                  type="date"
                  value={surgeryDate}
                  onChange={(e) => setSurgeryDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Outstanding Balance (£)</label>
                <input
                  type="number"
                  value={balanceDue}
                  onChange={(e) => setBalanceDue(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
            </div>

            {/* Insurance details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. Bupa"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pre-Auth Reference</label>
                <input
                  type="text"
                  value={insurancePreAuth}
                  onChange={(e) => setInsurancePreAuth(e.target.value)}
                  placeholder="e.g. BI-992019"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
            >
              {isSubmitting ? "Writing Registry..." : "Register & Sync Portal"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
