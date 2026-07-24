"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type TabId = "register" | "upload" | "patients" | "today";

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

interface UploadRow {
  name: string;
  email: string;
  surgery: string;
  date: string;
  selected: boolean;
}

const PATHWAY_OPTIONS = [
  "Total Knee Replacement (Left)",
  "Total Knee Replacement (Right)",
  "ACL Reconstruction (Left)",
  "ACL Reconstruction (Right)",
  "Patellar Stabilisation (Left)",
  "Patellar Stabilisation (Right)",
  "Arthrosamid® Injection (Left)",
  "Arthrosamid® Injection (Right)",
  "Knee Pain Assessment",
];

export default function ClinicianIntakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("register");

  // Register form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [surgery, setSurgery] = useState("Total Knee Replacement (Left)");
  const [surgeryDate, setSurgeryDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Patient list state
  const [patients, setPatients] = useState<Record<string, PatientRecord>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // Upload state
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  // ─── Upload / OCR handlers ───

  const parseCSV = (text: string): UploadRow[] => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];

    // Try to detect header
    const header = lines[0].toLowerCase();
    const hasHeader =
      header.includes("name") ||
      header.includes("email") ||
      header.includes("patient");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const todayStr = new Date().toISOString().split("T")[0];

    return dataLines.map((line) => {
      // Support both comma and tab delimited
      const parts = line.includes("\t")
        ? line.split("\t").map((p) => p.trim())
        : line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));

      return {
        name: parts[0] || "",
        email: parts[1] || "",
        surgery: matchPathway(parts[2] || ""),
        date: parts[3] || todayStr,
        selected: true,
      };
    }).filter((r) => r.name);
  };

  const matchPathway = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("tkr") || t.includes("total knee") || t.includes("replacement"))
      return t.includes("right")
        ? "Total Knee Replacement (Right)"
        : "Total Knee Replacement (Left)";
    if (t.includes("acl") || t.includes("anterior cruciate"))
      return t.includes("right")
        ? "ACL Reconstruction (Right)"
        : "ACL Reconstruction (Left)";
    if (t.includes("patel") || t.includes("stabilisation") || t.includes("mpfl"))
      return t.includes("right")
        ? "Patellar Stabilisation (Right)"
        : "Patellar Stabilisation (Left)";
    if (t.includes("arthrosamid") || t.includes("injection"))
      return t.includes("right")
        ? "Arthrosamid® Injection (Right)"
        : "Arthrosamid® Injection (Left)";
    if (t.includes("assessment") || t.includes("consult"))
      return "Knee Pain Assessment";
    return "Total Knee Replacement (Left)";
  };

  const handleImageOCR = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setUploadError("");
    setUploadMsg("");

    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      if (!text.trim()) {
        setUploadError(
          "Could not read any text from the image. Try a clearer photo."
        );
        setIsProcessing(false);
        return;
      }

      // Parse OCR text into rows
      const lines = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 3);

      const todayStr = new Date().toISOString().split("T")[0];
      const rows: UploadRow[] = [];

      for (const line of lines) {
        // Skip common header/noise lines
        if (
          /^(date|name|patient|theatre|list|hospital|procedure|time|anaes)/i.test(
            line
          )
        )
          continue;
        if (/^\d{1,2}[:/]\d{2}/.test(line)) continue; // time entries

        // Try to extract a name (first meaningful text) and procedure
        const parts = line.split(/\s{2,}|\t|,|;|\|/).filter(Boolean);
        if (parts.length >= 1 && parts[0].length > 2) {
          const potentialName = parts[0].replace(/^\d+[.\s)]+/, "").trim();
          const potentialProcedure = parts.slice(1).join(" ");

          if (potentialName && /[a-zA-Z]/.test(potentialName)) {
            rows.push({
              name: potentialName,
              email: "",
              surgery: potentialProcedure
                ? matchPathway(potentialProcedure)
                : "Total Knee Replacement (Left)",
              date: todayStr,
              selected: true,
            });
          }
        }
      }

      if (rows.length === 0) {
        setUploadError(
          "Could not extract patient names from the image. Try uploading a CSV instead."
        );
      } else {
        setUploadRows(rows);
        setUploadMsg(
          `Extracted ${rows.length} patient${rows.length !== 1 ? "s" : ""} from image. Please review and add email addresses before registering.`
        );
      }
    } catch (err: any) {
      setUploadError("Failed to process image: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadMsg("");
    setUploadRows([]);

    const fileName = file.name.toLowerCase();

    if (
      file.type.startsWith("image/") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".webp")
    ) {
      await handleImageOCR(file);
    } else if (
      fileName.endsWith(".csv") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".tsv")
    ) {
      setIsProcessing(true);
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setUploadError(
          "Could not parse any rows from the file. Ensure columns are: Name, Email, Pathway, Date"
        );
      } else {
        setUploadRows(rows);
        setUploadMsg(
          `Parsed ${rows.length} patient${rows.length !== 1 ? "s" : ""} from file. Review and confirm.`
        );
      }
      setIsProcessing(false);
    } else {
      setUploadError(
        "Unsupported file type. Please upload a CSV, TXT, or image file (JPG, PNG)."
      );
    }

    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const updateUploadRow = (
    index: number,
    field: keyof UploadRow,
    value: string | boolean
  ) => {
    setUploadRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeUploadRow = (index: number) => {
    setUploadRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkRegister = async () => {
    const selectedRows = uploadRows.filter((r) => r.selected && r.name && r.email);
    if (selectedRows.length === 0) {
      setUploadError("No valid rows selected. Each row needs a name and email.");
      return;
    }

    setIsBulkSubmitting(true);
    setUploadError("");
    setUploadMsg("");

    let successCount = 0;
    let failCount = 0;

    for (const row of selectedRows) {
      try {
        const response = await fetch("/api/portal/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            surgery: row.surgery,
            surgeryDate: row.date,
            pin,
          }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsBulkSubmitting(false);
    setUploadRows([]);
    fetchPatients();

    if (failCount === 0) {
      setUploadMsg(`✓ All ${successCount} patients registered successfully!`);
    } else {
      setUploadMsg(
        `Registered ${successCount} patient${successCount !== 1 ? "s" : ""}. ${failCount} failed.`
      );
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
            <h1 className="text-xl font-bold text-slate-950 font-serif">
              Clinician Access
            </h1>
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
                <p className="text-xs text-rose-500 text-center mt-2">
                  {pinError}
                </p>
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
    { id: "upload", label: "Upload", icon: "📷" },
    {
      id: "patients",
      label: "Patients",
      icon: "👥",
      count: patientEntries.length,
    },
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
              className={`flex-1 py-3 text-[11px] sm:text-sm font-bold text-center transition-colors relative ${
                activeTab === tab.id
                  ? "text-slate-950 border-b-2 border-clinical-teal"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="mr-0.5 sm:mr-1">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[9px] font-bold bg-slate-100 text-slate-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 sm:text-[10px]">
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

              <form
                onSubmit={handleRegisterPatient}
                className="space-y-4 text-slate-900"
              >
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
                    {PATHWAY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
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

        {/* ─── Upload Tab ─── */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            {uploadMsg && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm font-medium">
                {uploadMsg}
              </div>
            )}
            {uploadError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-sm font-medium">
                ⚠️ {uploadError}
              </div>
            )}

            {/* Upload Area */}
            {uploadRows.length === 0 && !isProcessing && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-serif font-bold text-slate-950 text-base">
                    Upload Patient List
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Take a photo of your theatre list or upload a CSV file.
                  </p>
                </div>

                {/* Camera Capture */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-clinical-teal/30 rounded-xl hover:border-clinical-teal/60 hover:bg-clinical-teal/5 transition-colors group"
                >
                  <div className="w-12 h-12 bg-clinical-teal/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-clinical-teal/20 transition-colors">
                    <svg
                      className="w-6 h-6 text-clinical-teal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Take Photo of Theatre List
                    </p>
                    <p className="text-[11px] text-slate-400">
                      OCR extracts patient names &amp; procedures automatically
                    </p>
                  </div>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                    <svg
                      className="w-6 h-6 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">
                      Upload CSV / Text File
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Columns: Name, Email, Pathway, Date
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Upload from gallery (for images saved on phone) */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] text-slate-400 text-center">
                    📷 Photos use OCR to extract text — best with printed lists.
                    <br />
                    📄 CSV format: <span className="font-mono">Name, Email, Pathway, Date</span>
                  </p>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-clinical-teal/20 border-t-clinical-teal rounded-full animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Processing image...
                  </p>
                  {ocrProgress > 0 && (
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-clinical-teal h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">
                    {ocrProgress > 0
                      ? `Recognising text... ${ocrProgress}%`
                      : "Loading OCR engine..."}
                  </p>
                </div>
              </div>
            )}

            {/* Editable Results Table */}
            {uploadRows.length > 0 && !isProcessing && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-serif font-bold text-slate-950 text-base">
                      Review Patients
                    </h2>
                    <button
                      onClick={() => {
                        setUploadRows([]);
                        setUploadMsg("");
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  {uploadRows.map((row, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl p-3 space-y-2 transition-colors ${
                        row.selected
                          ? "border-slate-200 bg-white"
                          : "border-slate-100 bg-slate-50 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) =>
                              updateUploadRow(idx, "selected", e.target.checked)
                            }
                            className="rounded border-slate-300 accent-clinical-teal"
                          />
                          <span className="text-xs font-bold text-slate-600">
                            #{idx + 1}
                          </span>
                        </label>
                        <button
                          onClick={() => removeUploadRow(idx)}
                          className="text-[10px] text-slate-400 hover:text-rose-500"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) =>
                          updateUploadRow(idx, "name", e.target.value)
                        }
                        placeholder="Patient Name"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                      />
                      <input
                        type="email"
                        value={row.email}
                        onChange={(e) =>
                          updateUploadRow(idx, "email", e.target.value)
                        }
                        placeholder="Email address (required)"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950 ${
                          !row.email && row.selected
                            ? "border-amber-300"
                            : "border-slate-200"
                        }`}
                      />
                      <select
                        value={row.surgery}
                        onChange={(e) =>
                          updateUploadRow(idx, "surgery", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                      >
                        {PATHWAY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) =>
                          updateUploadRow(idx, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
                      />
                    </div>
                  ))}
                </div>

                {/* Bulk Register Button */}
                <button
                  onClick={handleBulkRegister}
                  disabled={
                    isBulkSubmitting ||
                    uploadRows.filter((r) => r.selected && r.name && r.email)
                      .length === 0
                  }
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isBulkSubmitting
                    ? "Registering..."
                    : `Register ${
                        uploadRows.filter((r) => r.selected && r.name && r.email)
                          .length
                      } Patient${
                        uploadRows.filter((r) => r.selected && r.name && r.email)
                          .length !== 1
                          ? "s"
                          : ""
                      }`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Patient List Tab ─── */}
        {activeTab === "patients" && (
          <div className="space-y-3">
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
              <div className="text-center py-12 text-slate-400 text-sm">
                Loading patients...
              </div>
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
                    ? "Use the Register or Upload tab to add patients."
                    : "Try a different search term."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold px-1">
                  {filteredPatients.length} patient
                  {filteredPatients.length !== 1 ? "s" : ""}
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
                        <p className="text-[11px] text-slate-400 truncate">
                          {emailKey}
                        </p>
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
                      <span>{formatDate(p.surgeryDate)}</span>
                      <span className="font-mono text-slate-400">
                        {p.patientId}
                      </span>
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
              <div className="text-center py-12 text-slate-400 text-sm">
                Loading...
              </div>
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
                  {todaysPatients.length} procedure
                  {todaysPatients.length !== 1 ? "s" : ""} today
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
                        <p className="text-[11px] text-slate-500">
                          {p.surgery}
                        </p>
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
