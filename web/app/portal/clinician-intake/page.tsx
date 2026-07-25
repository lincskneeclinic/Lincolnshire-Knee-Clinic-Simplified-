"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type TabId = "register" | "upload" | "patients" | "today" | "governance";

interface NoteRecord {
  id: string;
  date: string;
  timestamp: string;
  text: string;
  phase: string;
  rom: string;
  clinician: string;
}

interface OKSRecord {
  date: string;
  score: number;
  category: string;
}

interface CertRecord {
  id: string;
  issuedDate: string;
  clearanceType: string;
  effectiveDate: string;
  restrictions: string;
  issuedBy: string;
}

interface PatientRecord {
  name: string;
  email?: string;
  patientId: string;
  surgery: string;
  surgeryDate: string;
  daysPostOp: number;
  surgeon: string;
  accessTier: string;
  dob?: string;
  balanceDue?: number;
  notesHistory?: NoteRecord[];
  oksScore?: number;
  oksHistory?: OKSRecord[];
  certificates?: CertRecord[];
}

interface UploadRow {
  name: string;
  email: string;
  surgery: string;
  date: string;
  selected: boolean;
}

interface InjectionEntry {
  id: string;
  patientName: string;
  patientId: string;
  kneeSide: string;
  product: string;
  batchNumber: string;
  expiryDate: string;
  dose: string;
  adminDate: string;
  clinicLocation: string;
  clinician: string;
  notes: string;
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

const CLINIC_LOCATIONS = [
  "St. Hugh's Hospital",
  "Parkhill Hospital",
  "Lincoln Private Hospital",
  "Inspire Health Clinic",
];

// 12 Validated Oxford Knee Score Questions
const OKS_QUESTIONS = [
  {
    id: "q1",
    question: "1. How would you describe the pain you usually have from your knee?",
    options: [
      { text: "None", score: 4 },
      { text: "Very mild", score: 3 },
      { text: "Mild", score: 2 },
      { text: "Moderate", score: 1 },
      { text: "Severe", score: 0 },
    ],
  },
  {
    id: "q2",
    question: "2. Have you had any trouble washing and drying yourself because of your knee?",
    options: [
      { text: "No trouble at all", score: 4 },
      { text: "Very little trouble", score: 3 },
      { text: "Moderate trouble", score: 2 },
      { text: "Extreme difficulty", score: 1 },
      { text: "Impossible to do", score: 0 },
    ],
  },
  {
    id: "q3",
    question: "3. Have you had any trouble getting in and out of a car or using public transport?",
    options: [
      { text: "No trouble at all", score: 4 },
      { text: "Very little trouble", score: 3 },
      { text: "Moderate trouble", score: 2 },
      { text: "Extreme difficulty", score: 1 },
      { text: "Impossible to do", score: 0 },
    ],
  },
  {
    id: "q4",
    question: "4. For how long have you been able to walk before knee pain becomes severe?",
    options: [
      { text: "No pain / More than 60 mins", score: 4 },
      { text: "16 to 60 minutes", score: 3 },
      { text: "5 to 15 minutes", score: 2 },
      { text: "Around the house only", score: 1 },
      { text: "Not at all / Severe pain immediately", score: 0 },
    ],
  },
  {
    id: "q5",
    question: "5. After a meal, how painful has it been for you to stand up from a chair?",
    options: [
      { text: "Not at all painful", score: 4 },
      { text: "Slightly painful", score: 3 },
      { text: "Moderately painful", score: 2 },
      { text: "Very painful", score: 1 },
      { text: "Unbearable", score: 0 },
    ],
  },
  {
    id: "q6",
    question: "6. Have you been limping when walking because of your knee?",
    options: [
      { text: "Rarely / Never", score: 4 },
      { text: "Sometimes / Initially", score: 3 },
      { text: "Often", score: 2 },
      { text: "Most of the time", score: 1 },
      { text: "All of the time", score: 0 },
    ],
  },
  {
    id: "q7",
    question: "7. Could you kneel down and get up again afterwards?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With little difficulty", score: 3 },
      { text: "With moderate difficulty", score: 2 },
      { text: "With extreme difficulty", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
  {
    id: "q8",
    question: "8. Are you bothered by pain in your knee at night in bed?",
    options: [
      { text: "Not at all", score: 4 },
      { text: "Only 1 or 2 nights", score: 3 },
      { text: "Some nights", score: 2 },
      { text: "Most nights", score: 1 },
      { text: "Every night", score: 0 },
    ],
  },
  {
    id: "q9",
    question: "9. How much has pain interfered with your usual work (including housework)?",
    options: [
      { text: "Not at all", score: 4 },
      { text: "A little bit", score: 3 },
      { text: "Moderately", score: 2 },
      { text: "Greatly", score: 1 },
      { text: "Totally", score: 0 },
    ],
  },
  {
    id: "q10",
    question: "10. Have you felt that your knee might suddenly 'give way' or buckle?",
    options: [
      { text: "Rarely / Never", score: 4 },
      { text: "Sometimes / Initially", score: 3 },
      { text: "Often", score: 2 },
      { text: "Most of the time", score: 1 },
      { text: "All of the time", score: 0 },
    ],
  },
  {
    id: "q11",
    question: "11. Could you do your household shopping on your own?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With little difficulty", score: 3 },
      { text: "With moderate difficulty", score: 2 },
      { text: "With extreme difficulty", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
  {
    id: "q12",
    question: "12. Could you walk down a flight of stairs?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With little difficulty", score: 3 },
      { text: "With moderate difficulty", score: 2 },
      { text: "With extreme difficulty", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
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

  // Injection Governance state
  const [injectionsList, setInjectionsList] = useState<InjectionEntry[]>([]);
  const [injSearch, setInjSearch] = useState("");
  const [injPatientName, setInjPatientName] = useState("");
  const [injPatientId, setInjPatientId] = useState("");
  const [injSide, setInjSide] = useState("Left Knee");
  const [injProduct, setInjProduct] = useState("Arthrosamid® Hydrogel");
  const [injBatch, setInjBatch] = useState("");
  const [injExpiry, setInjExpiry] = useState("2027-12-31");
  const [injDose, setInjDose] = useState("6.0 ml");
  const [injAdminDate, setInjAdminDate] = useState(new Date().toISOString().split("T")[0]);
  const [injLocation, setInjLocation] = useState("St. Hugh's Hospital");
  const [injNotes, setInjNotes] = useState("");
  const [injMsg, setInjMsg] = useState("");

  // Feature Modals
  const [noteModalPatient, setNoteModalPatient] = useState<{ email: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notePhase, setNotePhase] = useState("Outpatient Check");
  const [noteRom, setNoteRom] = useState("0-110°");

  const [oksModalPatient, setOksModalPatient] = useState<{ email: string; name: string } | null>(null);
  const [oksAnswers, setOksAnswers] = useState<Record<string, number>>({});

  const [certModalPatient, setCertModalPatient] = useState<{ email: string; name: string; surgery: string } | null>(null);
  const [certType, setCertType] = useState("Return to Driving & Work");
  const [certEffectiveDate, setCertEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [certRestrictions, setCertRestrictions] = useState("No heavy lifting >15kg for 4 weeks. Fit for light duties & non-emergency driving.");
  const [isPrintCertVisible, setIsPrintCertVisible] = useState(false);

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

  const fetchInjections = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/injections");
      const data = await res.json();
      setInjectionsList(data || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "patients" || activeTab === "today") {
        fetchPatients();
      } else if (activeTab === "governance") {
        fetchInjections();
      }
    }
  }, [isAuthenticated, activeTab, fetchPatients, fetchInjections]);

  // PIN authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "230670") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid Pin. Please check your credentials.");
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
        body: JSON.stringify({ name, email, surgery, surgeryDate, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register patient");
      }

      setSuccessMsg(`✓ Patient ${name} registered successfully!`);
      setName("");
      setEmail("");
      setSurgery("Total Knee Replacement (Left)");
      setSurgeryDate(new Date().toISOString().split("T")[0]);
      fetchPatients();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log Note Submission
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalPatient || !noteText) return;

    try {
      const res = await fetch("/api/portal/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: noteModalPatient.email,
          clinicalNote: { text: noteText, phase: notePhase, rom: noteRom },
          pin
        })
      });
      if (res.ok) {
        setNoteText("");
        setNoteModalPatient(null);
        fetchPatients();
      }
    } catch (_) {}
  };

  // Oxford Knee Score Calculate & Save
  const handleSaveOKS = async () => {
    if (!oksModalPatient) return;
    const totalScore = Object.values(oksAnswers).reduce((a, b) => a + b, 0);

    let category = "Satisfactory Joint Function";
    if (totalScore <= 19) category = "Severe Knee Arthritis";
    else if (totalScore <= 29) category = "Moderate-to-Severe Knee Symptoms";
    else if (totalScore <= 39) category = "Mild-to-Moderate Knee Symptoms";

    try {
      await fetch("/api/portal/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: oksModalPatient.email,
          oksScore: { totalScore, category, answers: oksAnswers },
          pin
        })
      });
      setOksModalPatient(null);
      setOksAnswers({});
      fetchPatients();
    } catch (_) {}
  };

  // Add Injection Record
  const handleAddInjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injPatientName || !injBatch) return;

    try {
      const res = await fetch("/api/portal/injections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: injPatientName,
          patientId: injPatientId || "LKC-REG",
          kneeSide: injSide,
          product: injProduct,
          batchNumber: injBatch,
          expiryDate: injExpiry,
          dose: injDose,
          adminDate: injAdminDate,
          clinicLocation: injLocation,
          notes: injNotes,
          pin
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInjMsg("✓ Injection batch logged under consultant governance!");
        setInjBatch("");
        setInjNotes("");
        setInjectionsList(data.list || []);
        setTimeout(() => setInjMsg(""), 4000);
      }
    } catch (_) {}
  };

  // Parse CSV
  const parseCSV = (text: string): UploadRow[] => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const hasHeader = /name|email|procedure|date/i.test(lines[0] || "");
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const todayStr = new Date().toISOString().split("T")[0];

    return dataLines.map((line) => {
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
      return t.includes("right") ? "Total Knee Replacement (Right)" : "Total Knee Replacement (Left)";
    if (t.includes("acl") || t.includes("anterior cruciate"))
      return t.includes("right") ? "ACL Reconstruction (Right)" : "ACL Reconstruction (Left)";
    if (t.includes("patel") || t.includes("stabilisation") || t.includes("mpfl"))
      return t.includes("right") ? "Patellar Stabilisation (Right)" : "Patellar Stabilisation (Left)";
    if (t.includes("arthrosamid") || t.includes("injection"))
      return t.includes("right") ? "Arthrosamid® Injection (Right)" : "Arthrosamid® Injection (Left)";
    return "Total Knee Replacement (Left)";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setUploadError("");
    setUploadMsg("");

    if (file.type.startsWith("image/")) {
      handleImageOCR(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) setUploadError("Could not parse rows. Columns: Name, Email, Pathway, Date");
        else setUploadRows(rows);
        setIsProcessing(false);
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const handleImageOCR = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);
    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setOcrProgress(Math.round(m.progress * 100));
        },
      });
      const lines = result.data.text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 3);
      const todayStr = new Date().toISOString().split("T")[0];
      const rows: UploadRow[] = [];

      for (const line of lines) {
        if (/^(date|name|patient|theatre|list|hospital|procedure)/i.test(line)) continue;
        const parts = line.split(/\s{2,}|\t|,|;|\|/).filter(Boolean);
        if (parts.length >= 1 && parts[0].length > 2) {
          const potentialName = parts[0].replace(/^\d+[.\s)]+/, "").trim();
          rows.push({
            name: potentialName,
            email: "",
            surgery: matchPathway(parts.slice(1).join(" ")),
            date: todayStr,
            selected: true,
          });
        }
      }
      setUploadRows(rows);
    } catch {
      setUploadError("Failed OCR scan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRegister = async () => {
    const selectedRows = uploadRows.filter((r) => r.selected && r.name && r.email);
    if (selectedRows.length === 0) return;
    setIsBulkSubmitting(true);
    for (const row of selectedRows) {
      try {
        await fetch("/api/portal/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.name, email: row.email, surgery: row.surgery, surgeryDate: row.date, pin }),
        });
      } catch (_) {}
    }
    setIsBulkSubmitting(false);
    setUploadRows([]);
    fetchPatients();
  };

  const todayISO = new Date().toISOString().split("T")[0];
  const patientEntries = Object.entries(patients);

  const filteredPatients = patientEntries.filter(([emailKey, p]) => {
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || emailKey.toLowerCase().includes(q) || p.surgery?.toLowerCase().includes(q) || p.patientId?.toLowerCase().includes(q);
  });

  const filteredInjections = injectionsList.filter((i) => {
    const q = injSearch.toLowerCase();
    return i.patientName?.toLowerCase().includes(q) || i.batchNumber?.toLowerCase().includes(q) || i.product?.toLowerCase().includes(q) || i.clinicLocation?.toLowerCase().includes(q);
  });

  const todaysPatients = patientEntries.filter(([, p]) => p.surgeryDate === todayISO);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Surgery": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Injection": return "bg-amber-100 text-amber-800 border border-amber-200";
      default: return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  // ─── PIN Lock Screen ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center space-y-3 mb-6">
            <img src="/brand/lkc-logo-k-transparent.png" alt="Logo" className="h-16 w-auto mx-auto" />
            <h1 className="text-xl font-bold text-slate-950 font-serif">Clinician Portal</h1>
            <p className="text-xs text-slate-500">Enter Security PIN to unlock terminal (Mr Ricardo J Pacheco)</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-slate-200 rounded-xl focus:border-clinical-teal focus:outline-none bg-slate-50 text-slate-950"
            />
            {pinError && <p className="text-xs text-rose-500 text-center font-medium">{pinError}</p>}
            <button type="submit" className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer text-sm">
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main View ───
  const tabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "register", label: "Register", icon: "➕" },
    { id: "upload", label: "Upload", icon: "📷" },
    { id: "patients", label: "Directory", icon: "👥", count: patientEntries.length },
    { id: "today", label: "Today", icon: "📅", count: todaysPatients.length },
    { id: "governance", label: "Injections Log", icon: "💉", count: injectionsList.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      {/* Header bar */}
      <header className="w-full bg-slate-950 text-white p-3 sm:p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <img src="/brand/lkc-logo-k-transparent.png" alt="Logo" className="h-9 w-auto" />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider font-serif">Lincolnshire Knee Clinic</h1>
            <span className="text-[10px] text-clinical-teal font-semibold">Lead Consultant: Mr Ricardo J Pacheco, FRCS (Tr &amp; Orth)</span>
          </div>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs border border-slate-800 bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
          Lock Terminal
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="flex w-full overflow-x-auto max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold text-center transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? "text-slate-950 border-b-2 border-clinical-teal bg-slate-50/50" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[9px] font-bold bg-slate-100 text-slate-700 rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex-1">
        {/* Register Tab */}
        {activeTab === "register" && (
          <div className="max-w-lg mx-auto space-y-4">
            {successMsg && <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm font-medium">{successMsg}</div>}
            {errorMsg && <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-sm font-medium">⚠️ {errorMsg}</div>}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-serif font-bold text-slate-950 text-base">Register New Patient Pathway</h2>
                <p className="text-xs text-slate-500 mt-1">Setup patient profile under consultant care.</p>
              </div>
              <form onSubmit={handleRegisterPatient} className="space-y-4 text-slate-900">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Henderson" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-clinical-teal focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@example.com" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-clinical-teal focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pathway / Surgical Procedure *</label>
                  <select value={surgery} onChange={(e) => setSurgery(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-clinical-teal focus:outline-none">
                    {PATHWAY_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Surgery / Procedure Date *</label>
                  <input type="date" required value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-clinical-teal focus:outline-none" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl shadow-sm text-sm transition-colors cursor-pointer">
                  {isSubmitting ? "Registering..." : "Confirm Patient Registration"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 text-center">
              <h2 className="font-serif font-bold text-slate-950 text-base">Bulk Theatre List Scan / Import</h2>
              <p className="text-xs text-slate-500">Scan physical theatre list photo or upload CSV/TXT.</p>
              <input ref={fileInputRef} type="file" accept=".csv,.txt,image/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-clinical-teal rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                📷 Upload Photo or File
              </button>
            </div>
          </div>
        )}

        {/* Patients Directory Tab */}
        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, email, ID or procedure..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:border-clinical-teal focus:outline-none shadow-sm"
              />
            </div>

            {isLoadingPatients ? (
              <div className="text-center py-12 text-slate-400 text-sm">Loading patient records...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="text-sm font-semibold text-slate-600">No patient records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map(([emailKey, p]) => (
                  <div key={emailKey} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-950">{p.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{emailKey} · ID: {p.patientId}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getTierBadge(p.accessTier)}`}>
                        {p.accessTier}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div><span className="text-slate-400 block">Procedure:</span> <span className="font-semibold text-slate-800">{p.surgery}</span></div>
                      <div><span className="text-slate-400 block">Date:</span> <span className="font-semibold text-slate-800">{p.surgeryDate}</span></div>
                      <div><span className="text-slate-400 block">Oxford Score:</span> <span className="font-bold text-clinical-teal">{p.oksScore !== undefined ? `${p.oksScore}/48` : "Not assessed"}</span></div>
                    </div>

                    {/* Historical Notes & Certs previews */}
                    {p.notesHistory && p.notesHistory.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recent Clinical Log Note:</span>
                        <div className="bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-lg text-xs text-slate-800 space-y-1">
                          <div className="flex justify-between font-semibold text-amber-900 text-[11px]">
                            <span>{p.notesHistory[0].phase} (ROM: {p.notesHistory[0].rom})</span>
                            <span>{p.notesHistory[0].date}</span>
                          </div>
                          <p className="text-slate-700 italic">&ldquo;{p.notesHistory[0].text}&rdquo;</p>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setNoteModalPatient({ email: emailKey, name: p.name })}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        📝 Log Note
                      </button>
                      <button
                        onClick={() => setOksModalPatient({ email: emailKey, name: p.name })}
                        className="px-3 py-1.5 text-xs font-bold bg-clinical-teal hover:bg-clinical-teal-hover text-white rounded-lg transition-colors cursor-pointer"
                      >
                        📊 Oxford Knee Score
                      </button>
                      <button
                        onClick={() => setCertModalPatient({ email: emailKey, name: p.name, surgery: p.surgery })}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        📄 Fit Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today's List Tab */}
        {activeTab === "today" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-slate-950 text-base">Today&apos;s Clinic List</h2>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <button onClick={fetchPatients} className="text-xs font-bold text-clinical-teal hover:underline">Refresh</button>
            </div>
            {todaysPatients.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-sm">
                No procedures scheduled for today.
              </div>
            ) : (
              todaysPatients.map(([emailKey, p], idx) => (
                <div key={emailKey} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-950 text-white font-bold text-xs flex items-center justify-center">{idx + 1}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.surgery}</p>
                    </div>
                  </div>
                  <button onClick={() => setNoteModalPatient({ email: emailKey, name: p.name })} className="px-3 py-1 text-xs font-bold bg-clinical-teal text-white rounded-lg">
                    Log Note
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Injection Governance Tab */}
        {activeTab === "governance" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-slate-950 text-base">Injection Batch &amp; Governance Log</h2>
                  <p className="text-xs text-slate-500">Record batch numbers and lot tracking for clinical governance compliance.</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Governance Active</span>
              </div>

              {injMsg && <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-bold">{injMsg}</div>}

              <form onSubmit={handleAddInjection} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name *</label>
                  <input type="text" required value={injPatientName} onChange={(e) => setInjPatientName(e.target.value)} placeholder="Margaret Henderson" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Injection *</label>
                  <select value={injProduct} onChange={(e) => setInjProduct(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                    <option value="Arthrosamid® Hydrogel">Arthrosamid® Hydrogel (6.0ml)</option>
                    <option value="Platelet-Rich Plasma (PRP)">Platelet-Rich Plasma (PRP)</option>
                    <option value="Durolane® Hyaluronic Acid">Durolane® Hyaluronic Acid</option>
                    <option value="Ostenil® Plus Hyaluronic Acid">Ostenil® Plus Hyaluronic Acid</option>
                    <option value="Depo-Medrone / Cortisone">Depo-Medrone / Cortisone (40mg)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch / Lot Number *</label>
                  <input type="text" required value={injBatch} onChange={(e) => setInjBatch(e.target.value)} placeholder="ARTH-2026-889B" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Expiry Date *</label>
                  <input type="date" required value={injExpiry} onChange={(e) => setInjExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinic Location *</label>
                  <select value={injLocation} onChange={(e) => setInjLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                    {CLINIC_LOCATIONS.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Knee Side &amp; Dose</label>
                  <div className="flex gap-2">
                    <select value={injSide} onChange={(e) => setInjSide(e.target.value)} className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg bg-slate-50">
                      <option value="Left Knee">Left Knee</option>
                      <option value="Right Knee">Right Knee</option>
                      <option value="Bilateral Knees">Bilateral Knees</option>
                    </select>
                    <input type="text" value={injDose} onChange={(e) => setInjDose(e.target.value)} placeholder="6.0 ml" className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer">
                    Log Injection Batch to Audit File
                  </button>
                </div>
              </form>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-950 text-sm">Governance Audit History ({filteredInjections.length})</h3>
                <input
                  type="text"
                  value={injSearch}
                  onChange={(e) => setInjSearch(e.target.value)}
                  placeholder="Filter batch or patient..."
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 bg-slate-50"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Batch #</th>
                      <th className="py-2.5 px-3">Expiry</th>
                      <th className="py-2.5 px-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredInjections.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-500">{item.adminDate}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-950">{item.patientName} <span className="block text-[10px] text-slate-400 font-normal">{item.kneeSide}</span></td>
                        <td className="py-2.5 px-3 font-semibold text-clinical-teal">{item.product}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.batchNumber}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{item.expiryDate}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{item.clinicLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL 1: Log Consultation Note ─── */}
      {noteModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 text-base">Log Consultation / Post-Op Note</h3>
                <p className="text-xs text-slate-400">Patient: <span className="font-bold text-slate-700">{noteModalPatient.name}</span></p>
              </div>
              <button onClick={() => setNoteModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Phase</label>
                <select value={notePhase} onChange={(e) => setNotePhase(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                  <option value="Outpatient Consultation">Outpatient Consultation</option>
                  <option value="2-Week Post-Op Wound Check">2-Week Post-Op Wound Check</option>
                  <option value="6-Week Clinical Review">6-Week Clinical Review</option>
                  <option value="3-Month Milestone Review">3-Month Milestone Review</option>
                  <option value="Injection Follow-Up">Injection Follow-Up</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Range of Motion (Flexion / Extension)</label>
                <input type="text" value={noteRom} onChange={(e) => setNoteRom(e.target.value)} placeholder="0-115°" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Note Text *</label>
                <textarea required rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Wound dry and healed. Good quad activation. Cleared for driving at 6 weeks..." className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setNoteModalPatient(null)} className="w-1/2 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 bg-clinical-teal text-white rounded-xl font-bold shadow-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Oxford Knee Score Calculator ─── */}
      {oksModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 text-base">Oxford Knee Score (OKS) Assessment</h3>
                <p className="text-xs text-slate-400">Patient: <span className="font-bold text-slate-700">{oksModalPatient.name}</span></p>
              </div>
              <button onClick={() => setOksModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
              {OKS_QUESTIONS.map((q) => (
                <div key={q.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <p className="font-bold text-slate-900">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options.map((opt) => (
                      <label key={opt.text} className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${oksAnswers[q.id] === opt.score ? "bg-clinical-teal/10 border-clinical-teal font-bold text-slate-950" : "bg-white border-slate-200 text-slate-600"}`}>
                        <span className="text-[11px]">{opt.text}</span>
                        <input
                          type="radio"
                          name={q.id}
                          checked={oksAnswers[q.id] === opt.score}
                          onChange={() => setOksAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                          className="accent-clinical-teal"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Score Calculator Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-clinical-teal font-bold uppercase tracking-wider block">Calculated OKS Score</span>
                <span className="text-2xl font-bold">{Object.values(oksAnswers).reduce((a, b) => a + b, 0)} / 48</span>
              </div>
              <button onClick={handleSaveOKS} disabled={Object.keys(oksAnswers).length < 12} className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-lg text-xs disabled:opacity-40 cursor-pointer">
                Save Outcome Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Fit-to-Work / Drive Clearance Certificate ─── */}
      {certModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 text-base">Generate Clearance Certificate</h3>
                <p className="text-xs text-slate-400">Formal letterhead note for GP / Employer</p>
              </div>
              <button onClick={() => setCertModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {!isPrintCertVisible ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clearance Category</label>
                  <select value={certType} onChange={(e) => setCertType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                    <option value="Return to Driving & Work">Return to Driving &amp; Light Work</option>
                    <option value="Full Unrestricted Work Duties">Full Unrestricted Work Duties</option>
                    <option value="Fit to Fly / Long Travel">Fit to Fly / Long Travel</option>
                    <option value="Return to Sports & Training">Return to Sports &amp; Training</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effective Clearance Date</label>
                  <input type="date" value={certEffectiveDate} onChange={(e) => setCertEffectiveDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Restrictions / Special Instructions</label>
                  <textarea rows={3} value={certRestrictions} onChange={(e) => setCertRestrictions(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                </div>
                <button onClick={() => setIsPrintCertVisible(true)} className="w-full py-3 bg-slate-950 text-white font-bold rounded-xl text-xs cursor-pointer">
                  Preview Certificate Letterhead
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Printable Letterhead */}
                <div className="border border-slate-300 p-6 rounded-xl bg-white space-y-4 text-slate-900 text-xs shadow-inner">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-950">LINCOLNSHIRE KNEE CLINIC</h4>
                      <p className="text-[10px] text-slate-500">Mr Ricardo J Pacheco FRCS (Tr &amp; Orth)</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <p>GMC Ref: 4145976</p>
                      <p>Date: {new Date().toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold">RE: CLINICAL CLEARANCE CERTIFICATE</p>
                    <p>Patient Name: <span className="font-bold">{certModalPatient.name}</span></p>
                    <p>Procedure / Diagnosis: <span className="font-bold">{certModalPatient.surgery}</span></p>
                    <p className="mt-2">This statement confirms that the patient above has been clinically evaluated. Based on current post-operative healing and knee range of motion, the patient is deemed fit for: <span className="font-bold text-clinical-teal">{certType}</span> effective from <span className="font-bold">{certEffectiveDate}</span>.</p>
                    <p className="italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">Restrictions: {certRestrictions}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <p className="font-bold">Mr Ricardo J Pacheco</p>
                      <p className="text-[10px] text-slate-500">Consultant Orthopaedic Knee Surgeon</p>
                    </div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Digitally Verified</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setIsPrintCertVisible(false)} className="w-1/2 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">Edit Details</button>
                  <button onClick={() => window.print()} className="w-1/2 py-2 bg-clinical-teal text-white text-xs font-bold rounded-lg">Print Certificate</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
