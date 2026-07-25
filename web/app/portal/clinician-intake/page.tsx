"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type TabId = "register" | "upload" | "patients" | "messages" | "today" | "governance";

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
  answers?: Record<string, number>;
}

interface CertRecord {
  id: string;
  issuedDate: string;
  clearanceType: string;
  effectiveDate: string;
  restrictions: string;
  issuedBy: string;
}

interface ChatMessage {
  id: string;
  sender: "clinician" | "patient";
  text: string;
  date: string;
  timestamp: string;
  read?: boolean;
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
  insuranceProvider?: string;
  policyNumber?: string;
  insurancePreAuth?: string;
  preAuthCode?: string;
  ubrn?: string;
  dob?: string;
  balanceDue?: number;
  notesHistory?: NoteRecord[];
  oksScore?: number;
  oksHistory?: OKSRecord[];
  certificates?: CertRecord[];
  invoices?: any[];
  messages?: ChatMessage[];
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

// Standard Certificate Presets
const CERT_PRESETS = [
  {
    label: "🚗 Return to Driving (6 Weeks)",
    type: "Return to Driving & Light Work",
    restrictions: "Fit for non-emergency driving once full emergency braking control is achieved without pain. Light office duties permitted."
  },
  {
    label: "💼 Light Work Duties Clearance",
    type: "Light Work Duties Only",
    restrictions: "Cleared for desk/sedentary work. Avoid standing >30 mins continuously or lifting >10kg for 4 weeks."
  },
  {
    label: "🏋️ Full Unrestricted Work & Sport",
    type: "Full Unrestricted Work & Sports Duties",
    restrictions: "Full structural healing confirmed. Cleared for high-impact sports, running, and heavy manual labor."
  },
  {
    label: "✈️ Fit to Fly / Long Travel",
    type: "Fit to Fly & Long Distance Travel",
    restrictions: "Cleared for commercial flights. Advised in-flight ankle pumps, calf hydration, and compression stockings."
  }
];

// OKS Visual Trend Line Sparkline
const OKSTrendGraph = ({ history }: { history?: OKSRecord[] }) => {
  if (!history || history.length === 0) return null;
  const sorted = [...history].reverse(); // chronological order
  const maxScore = 48;
  const height = 36;
  const width = 120;

  if (sorted.length === 1) {
    return (
      <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-medium shadow-inner">
        <span className="font-extrabold text-cyan-300 text-sm">{sorted[0].score}/48</span>
        <span className="text-xs text-white font-bold">({sorted[0].category})</span>
      </div>
    );
  }

  const points = sorted.map((item, idx) => {
    const x = (idx / (sorted.length - 1)) * (width - 20) + 10;
    const y = height - (item.score / maxScore) * (height - 10) - 5;
    return { x, y, score: item.score, date: item.date };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const latestScore = sorted[sorted.length - 1].score;
  const initialScore = sorted[0].score;
  const diff = latestScore - initialScore;

  return (
    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white">{latestScore}/48</span>
          {diff > 0 && <span className="text-[10px] font-bold text-emerald-600">▲ +{diff}</span>}
          {diff < 0 && <span className="text-[10px] font-bold text-rose-500">▼ {diff}</span>}
        </div>
        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-200 uppercase tracking-wider">PROMs Trajectory</span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="#00AFC8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-slate-900 dark:fill-white stroke-clinical-teal stroke-2" />
        ))}
      </svg>
    </div>
  );
};

export default function ClinicianIntakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("register");

  // Global settings
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Register form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [surgery, setSurgery] = useState("Total Knee Replacement (Left)");
  const [accessTier, setAccessTier] = useState("Self-Pay");
  const [insuranceProvider, setInsuranceProvider] = useState("Bupa");
  const [policyNumber, setPolicyNumber] = useState("");
  const [preAuthCode, setPreAuthCode] = useState("");
  const [ubrn, setUbrn] = useState("");
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
  const [toastMessage, setToastMessage] = useState("");

  // Diagnostic Referral Modal state
  const [diagModalPatient, setDiagModalPatient] = useState<{ email: string; name: string; surgery: string } | null>(null);
  const [diagModality, setDiagModality] = useState("3T MRI Scan (Knee Left)");
  const [diagFacility, setDiagFacility] = useState("St. Hugh's Hospital Radiology");
  const [diagClinicalHistory, setDiagClinicalHistory] = useState("");
  const [isPrintDiagVisible, setIsPrintDiagVisible] = useState(false);

  // Messaging State
  const [selectedMsgEmail, setSelectedMsgEmail] = useState<string | null>(null);
  const [msgInputText, setMsgInputText] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Invoice & Excess Dispatch Modal State
  const [invoiceModalPatient, setInvoiceModalPatient] = useState<{ email: string; name: string; balanceDue: number; phone?: string; insuranceProvider?: string } | null>(null);
  const [invoiceType, setInvoiceType] = useState("Insurance Excess");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceChannel, setInvoiceChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  // Upload State
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [scannedDocInfo, setScannedDocInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Feature Modals
  const [noteModalPatient, setNoteModalPatient] = useState<{ email: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notePhase, setNotePhase] = useState("6-Week Post-Op Review");
  const [noteRom, setNoteRom] = useState("0–115°");

  const [certModalPatient, setCertModalPatient] = useState<{ email: string; name: string; surgery: string } | null>(null);
  const [certType, setCertType] = useState("Return to Driving & Light Work");
  const [certEffectiveDate, setCertEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [certRestrictions, setCertRestrictions] = useState("Fit for non-emergency driving once emergency braking control is achieved without pain.");
  const [isPrintCertVisible, setIsPrintCertVisible] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Medical Speech Auto-Corrector Dictionary
  const cleanMedicalTranscript = (text: string) => {
    let cleaned = text;
    const replacements: Record<string, string> = {
      "arthro samid": "Arthrosamid®",
      "arthrosamid": "Arthrosamid®",
      "arthroamid": "Arthrosamid®",
      "a c l": "ACL Reconstruction",
      "a.c.l.": "ACL Reconstruction",
      "t k r": "Total Knee Replacement",
      "total knee": "Total Knee Replacement",
      "p k r": "Partial Knee Replacement",
      "meniscus": "meniscal",
      "quads": "quadriceps",
      "r o m": "Range of Motion (ROM)",
      "rom": "Range of Motion (ROM)",
      "flexion": "flexion",
      "extension": "extension",
      "bupa": "Bupa",
      "mri": "MRI",
      "proms": "PROMs",
      "oxford knee score": "Oxford Knee Score (OKS)",
      "mr pacheco": "Mr Ricardo J Pacheco",
      "pacheco": "Mr Pacheco"
    };

    Object.entries(replacements).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi");
      cleaned = cleaned.replace(regex, right);
    });

    // Auto-capitalize first letter of transcript
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  // Voice Dictation Helper (Web Speech API with Medical Grammar & Auto-Correction)
  const startDictation = (onTranscript: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

    if (!SpeechRecognition) {
      showToast("⚠️ Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-GB";

      // Add custom orthopaedic vocabulary grammar if supported
      if (SpeechGrammarList) {
        const medicalTerms = ["Arthrosamid", "ACL", "Meniscectomy", "Pacheco", "Flexion", "Extension", "Quadriceps", "Patellar", "Bupa", "OKS", "PROMs"];
        const grammar = `#JSGF V1.0; grammar medical; public <term> = ${medicalTerms.join(" | ")} ;`;
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
      }

      setIsListening(true);
      showToast("🎙️ Listening... Speak medical dictation clearly.");

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const rawTranscript = event.results[0][0].transcript;
        if (rawTranscript) {
          const correctedText = cleanMedicalTranscript(rawTranscript);
          onTranscript(correctedText);
          showToast(`✓ Dictated: "${correctedText.slice(0, 40)}..."`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast("⚠️ Dictation error or microphone permission denied.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

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
      fetchPatients();
      if (activeTab === "governance") {
        fetchInjections();
      }
    }
  }, [isAuthenticated, activeTab, fetchPatients, fetchInjections]);

  // 15-Minute Inactivity Lock Timer
  useEffect(() => {
    if (!isAuthenticated) return;
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        showToast("🔒 Terminal automatically locked due to 15 minutes of inactivity.");
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isAuthenticated]);

  // PIN authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "230670") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid PIN credentials. Please try again.");
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
          accessTier,
          insuranceProvider: accessTier === "Insured" ? insuranceProvider : accessTier === "NHS e-Referral" ? "NHS e-Referral" : "Self-Pay",
          policyNumber,
          preAuthCode,
          ubrn,
          pin,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to register patient");

      setSuccessMsg(`✓ Patient ${name} registered successfully under ${accessTier}!`);
      setName("");
      setEmail("");
      setSurgery("Total Knee Replacement (Left)");
      setSurgeryDate(new Date().toISOString().split("T")[0]);
      setAccessTier("Self-Pay");
      setPolicyNumber("");
      setPreAuthCode("");
      setUbrn("");
      fetchPatients();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Upload Handler
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      const parsedRows: UploadRow[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes("name") || line.toLowerCase().includes("patientid") || line.toLowerCase().includes("timestamp"))) {
          return; // Skip header row
        }
        const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
        if (cols.length >= 2) {
          let rowName = cols[0];
          let rowEmail = "";
          let rowSurgery = cols[2] || "Total Knee Replacement (Left)";
          let rowDate = new Date().toISOString().split("T")[0];

          if (cols[0].startsWith("LKC-") || cols[0].includes("2026")) {
            rowName = cols[2] || cols[1] || "Patient";
            rowSurgery = cols[3] || "Knee Surgery";
          }

          if (cols[1] && cols[1].includes("@")) {
            rowEmail = cols[1];
          } else {
            rowEmail = `${rowName.toLowerCase().replace(/[^a-z]/g, "")}.${Math.floor(100 + Math.random() * 900)}@lincsknee.com`;
          }

          parsedRows.push({
            name: rowName,
            email: rowEmail,
            surgery: rowSurgery,
            date: rowDate,
            selected: true
          });
        }
      });

      if (parsedRows.length > 0) {
        setUploadRows(parsedRows);
        showToast(`📁 Parsed ${parsedRows.length} patient rows from CSV!`);
      } else {
        showToast("⚠️ Could not parse valid patient data from CSV.");
      }
    };
    reader.readAsText(file);
  };

  // Bulk Register Uploaded Rows
  const handleBulkRegister = async () => {
    const selected = uploadRows.filter(r => r.selected);
    if (selected.length === 0) {
      showToast("⚠️ Select at least 1 patient row to import.");
      return;
    }

    setIsBulkSubmitting(true);
    let count = 0;
    for (const r of selected) {
      try {
        const res = await fetch("/api/portal/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: r.name,
            email: r.email,
            surgery: r.surgery,
            surgeryDate: r.date,
            pin
          })
        });
        if (res.ok) count++;
      } catch (_) {}
    }

    setIsBulkSubmitting(false);
    showToast(`🚀 Successfully imported ${count} patients into Clinical EHR!`);
    setUploadRows([]);
    fetchPatients();
    setActiveTab("patients");
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const sampleCsv = `PatientName,Email,Surgery,Date\n"Mr. John Henderson","john.h@lincsknee.com","Total Knee Replacement (Left)","2026-07-25"\n"Ms. Sarah Jenkins","sarah.j@lincsknee.com","ACL Reconstruction (Right)","2026-07-25"\n"Mrs. Emily Watson","emily.w@lincsknee.com","Arthrosamid® Injection (Right)","2026-07-25"`;
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LKC_Patient_Intake_Batch_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("📥 Sample CSV batch template downloaded!");
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
        showToast(`✓ Clinical note logged for ${noteModalPatient.name}`);
        setNoteText("");
        setNoteModalPatient(null);
        fetchPatients();
      }
    } catch (_) {}
  };

  // Save Certificate
  const handleSaveCertificate = async () => {
    if (!certModalPatient) return;
    try {
      await fetch("/api/portal/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: certModalPatient.email,
          fitForWorkCert: {
            clearanceType: certType,
            effectiveDate: certEffectiveDate,
            restrictions: certRestrictions
          },
          pin
        })
      });
      showToast(`✓ Fit-to-Work certificate issued for ${certModalPatient.name}`);
      fetchPatients();
    } catch (_) {}
  };

  // Send Message to Patient
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsgEmail || !msgInputText.trim()) return;

    setIsSendingMsg(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedMsgEmail,
          text: msgInputText.trim(),
          sender: "clinician",
          pin
        })
      });
      if (res.ok) {
        showToast("💬 Message sent to patient portal");
        setMsgInputText("");
        fetchPatients();
      }
    } catch (_) {
      showToast("❌ Failed to send message");
    } finally {
      setIsSendingMsg(false);
    }
  };

  // CQC CSV Export
  const handleExportCqcCsv = () => {
    if (injectionsList.length === 0) {
      showToast("⚠️ No injection logs available to export.");
      return;
    }
    const headers = ["Patient Name", "Patient ID", "Knee Side", "Product", "Batch Number", "Expiry Date", "Dose", "Admin Date", "Clinic Location", "Clinician", "Notes"];
    const rows = injectionsList.map((i) => [
      `"${i.patientName}"`,
      `"${i.patientId}"`,
      `"${i.kneeSide}"`,
      `"${i.product}"`,
      `"${i.batchNumber}"`,
      `"${i.expiryDate}"`,
      `"${i.dose}"`,
      `"${i.adminDate}"`,
      `"${i.clinicLocation}"`,
      `"${i.clinician || 'Mr Ricardo J Pacheco'}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CQC_Joint_Injection_Governance_Log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 CQC Joint Injection Audit Log exported to CSV!");
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
        showToast("✓ Injection batch logged under consultant governance!");
        setInjBatch("");
        setInjNotes("");
        setInjectionsList(data.list || []);
      }
    } catch (_) {}
  };

  const todayISO = new Date().toISOString().split("T")[0];
  const patientEntries = Object.entries(patients);

  const filteredPatients = patientEntries.filter(([emailKey, p]) => {
    const q = (searchQuery || globalSearch).toLowerCase();
    return p.name?.toLowerCase().includes(q) || emailKey.toLowerCase().includes(q) || p.surgery?.toLowerCase().includes(q) || p.patientId?.toLowerCase().includes(q);
  });

  const filteredInjections = injectionsList.filter((i) => {
    const q = injSearch.toLowerCase();
    return i.patientName?.toLowerCase().includes(q) || i.batchNumber?.toLowerCase().includes(q) || i.product?.toLowerCase().includes(q) || i.clinicLocation?.toLowerCase().includes(q);
  });

  const todaysPatients = patientEntries.filter(([, p]) => p.surgeryDate === todayISO);

  // Total unread messages across all patients
  const totalUnreadMsgs = patientEntries.reduce((acc, [, p]) => {
    const unread = (p.messages || []).filter((m) => m.sender === "patient" && !m.read).length;
    return acc + unread;
  }, 0);

  // ─── PIN Lock Screen ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center space-y-3 mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <img src="/brand/lkc-logo-k-transparent.png" alt="Logo" className="h-16 w-auto mx-auto" />
            </Link>
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
          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-clinical-teal font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Main Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main View ───
  const tabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "register", label: "Register", icon: "➕" },
    { id: "upload", label: "Upload CSV", icon: "📷" },
    { id: "patients", label: "Directory", icon: "👥", count: patientEntries.length },
    { id: "messages", label: "Messages", icon: "💬", count: totalUnreadMsgs },
    { id: "today", label: "Today", icon: "📅", count: todaysPatients.length },
    { id: "governance", label: "Injections Log", icon: "💉", count: injectionsList.length },
  ];

  return (
    <div className={`min-h-screen flex flex-col w-full relative transition-colors ${isTheatreMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Printable styles for PDF export */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate-area, #printable-certificate-area * {
            visibility: visible;
          }
          #printable-certificate-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border border-slate-700 flex items-center gap-2 animate-bounce print:hidden">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="w-full bg-slate-950 text-white p-3 sm:p-4 flex flex-wrap justify-between items-center shadow-md gap-3 print:hidden">
        <Link href="/" className="flex items-center space-x-3 group hover:opacity-90 transition-opacity">
          <img src="/brand/lkc-logo-k-transparent.png" alt="Logo" className="h-9 w-auto" />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider font-serif group-hover:text-clinical-teal transition-colors">Lincolnshire Knee Clinic</h1>
            <span className="text-[10px] text-clinical-teal font-semibold">Lead Consultant: Mr Ricardo J Pacheco, FRCS (Tr &amp; Orth)</span>
          </div>
        </Link>

        {/* Global Quick Search Bar */}
        <div className="flex-1 max-w-xs mx-auto hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="🔍 Search patient name, ID, or surgery..."
              className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-clinical-teal"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")} className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-white">✕</button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <a
            href="https://www.vista-health.co.uk/partners/clinical/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 font-bold shrink-0"
            title="Open Vista Health Clinical Referrer Portal"
          >
            <span>🏥 Vista Referrer Portal ↗</span>
          </a>

          <button
            onClick={() => setIsTheatreMode(!isTheatreMode)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              isTheatreMode ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Toggle Operating Theatre High-Contrast Mode"
          >
            <span>{isTheatreMode ? "☀️ Standard" : "🎭 Theatre Mode"}</span>
          </button>

          <Link
            href="/"
            className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            title="Return to Main Website"
          >
            <svg className="w-3.5 h-3.5 text-clinical-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Return to Main Site</span>
            <span className="sm:hidden">Main Site</span>
          </Link>

          <button onClick={() => setIsAuthenticated(false)} className="text-xs border border-slate-800 bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer font-medium">
            Lock Terminal
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={`w-full border-b sticky top-0 z-20 shadow-sm print:hidden ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex w-full overflow-x-auto max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold text-center transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-clinical-teal border-b-2 border-clinical-teal bg-clinical-teal/5"
                  : isTheatreMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center text-[9px] font-bold rounded-full px-1.5 py-0.5 ${
                  tab.id === "messages" ? "bg-amber-500 text-slate-950 font-bold animate-pulse" : "bg-slate-100 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex-1 print:hidden">
        {/* Register Tab */}
        {activeTab === "register" && (
          <div className="max-w-lg mx-auto space-y-4">
            {successMsg && <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm font-medium">{successMsg}</div>}
            {errorMsg && <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-sm font-medium">⚠️ {errorMsg}</div>}
            <div className={`rounded-2xl shadow-sm border p-6 space-y-5 ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-serif font-bold text-base">Register New Patient Pathway</h2>
                <p className="text-xs text-slate-500 mt-1">Setup patient profile under consultant care.</p>
              </div>
              <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">Full Patient Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mrs Sarah Jenkins" className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
                </div>
                <div>
                  <label className="font-bold block mb-1">Patient Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. sarah.jenkins@example.com" className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
                </div>
                <div>
                  <label className="font-bold block mb-1">Care Pathway / Procedure</label>
                  <select value={surgery} onChange={(e) => setSurgery(e.target.value)} className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
                    {PATHWAY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Funding &amp; Access Tier</label>
                  <select value={accessTier} onChange={(e) => setAccessTier(e.target.value)} className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
                    <option value="Self-Pay">Self-Pay Patient</option>
                    <option value="Insured">Private Medical Insurance (Bupa / AXA / Aviva)</option>
                    <option value="NHS e-Referral">NHS e-Referral (Choose &amp; Book)</option>
                  </select>
                </div>

                {accessTier === "Insured" && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-3">
                    <div>
                      <label className="font-bold block mb-1 text-blue-400">Private Health Insurer</label>
                      <select
                        value={insuranceProvider}
                        onChange={(e) => setInsuranceProvider(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                      >
                        <option value="Bupa">Bupa Health Insurance</option>
                        <option value="AXA Health">AXA Health</option>
                        <option value="Aviva">Aviva Health</option>
                        <option value="VitalityHealth">VitalityHealth</option>
                        <option value="WPA">WPA Healthcare</option>
                        <option value="Cigna">Cigna Healthcare</option>
                        <option value="Simplyhealth">Simplyhealth</option>
                        <option value="Other Insurer">Other Recognized Insurer</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold block mb-1 text-blue-400">Policy / Member ID</label>
                        <input
                          type="text"
                          value={policyNumber}
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          placeholder="e.g. BI-992019-X"
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-blue-400">Pre-Auth Code</label>
                        <input
                          type="text"
                          value={preAuthCode}
                          onChange={(e) => setPreAuthCode(e.target.value)}
                          placeholder="e.g. AUTH-882190"
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {accessTier === "NHS e-Referral" && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-3">
                    <div>
                      <label className="font-bold block mb-1 text-cyan-400">NHS e-Referral UBRN / Booking Ref</label>
                      <input
                        type="text"
                        value={ubrn}
                        onChange={(e) => setUbrn(e.target.value)}
                        placeholder="e.g. UBRN 994012 / NHS Referral ID"
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="font-bold block mb-1">Procedure / Assessment Date</label>
                  <input type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-clinical-teal ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md">
                  {isSubmitting ? "Registering..." : "Create Patient Record"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-base">Bulk CSV Intake &amp; Document Scanning</h2>
                <p className="text-xs text-slate-500">Upload batch patient CSV files or intake records.</p>
              </div>
              <button
                onClick={handleDownloadSampleCsv}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                📥 Download Sample CSV Template
              </button>
            </div>

            {/* CSV Dropzone */}
            <div className={`p-6 rounded-2xl border-2 border-dashed text-center space-y-3 ${isTheatreMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"}`}>
              <div className="text-3xl">📁</div>
              <div>
                <h3 className="font-bold text-sm">Upload Patient Intake CSV File</h3>
                <p className="text-xs text-slate-400 mt-0.5">Drag and drop a CSV file containing patient names, emails, and surgical pathways.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors"
              >
                Browse CSV File
              </button>
            </div>

            {/* Uploaded Preview Table */}
            {uploadRows.length > 0 && (
              <div className={`p-5 rounded-2xl border space-y-4 ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm">Parsed CSV Batch Preview ({uploadRows.length} Rows)</h3>
                    <p className="text-xs text-slate-400">Review patient list before importing into clinical database.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUploadRows(uploadRows.map(r => ({ ...r, selected: !uploadRows.every(x => x.selected) })))}
                      className="px-3 py-1 text-xs border rounded-lg font-bold"
                    >
                      ⚡ Toggle All
                    </button>
                    <button
                      onClick={handleBulkRegister}
                      disabled={isBulkSubmitting}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                    >
                      {isBulkSubmitting ? "Importing..." : `🚀 Import ${uploadRows.filter(r => r.selected).length} Patients`}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                        <th className="p-2">Import</th>
                        <th className="p-2">Patient Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Pathway</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={(e) => {
                                const copy = [...uploadRows];
                                copy[idx].selected = e.target.checked;
                                setUploadRows(copy);
                              }}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="p-2 font-bold">{row.name}</td>
                          <td className="p-2 text-slate-400">{row.email}</td>
                          <td className="p-2 text-clinical-teal font-semibold">{row.surgery}</td>
                          <td className="p-2 text-slate-400">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Directory Tab */}
        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-bold text-base text-slate-950 dark:text-white">
                Consultant Directory &amp; Records ({filteredPatients.length})
              </h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter directory..."
                className={`px-3 py-1.5 text-xs border rounded-xl focus:outline-none ${
                  isTheatreMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
                }`}
              />
            </div>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl text-slate-500 dark:text-slate-400 text-xs font-medium">
                No patient records match the search filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.map(([emailKey, p]) => (
                  <div
                    key={emailKey}
                    className={`p-5 rounded-2xl border shadow-sm space-y-3 flex flex-col justify-between transition-shadow ${
                      isTheatreMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-950"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-base font-serif text-slate-950 dark:text-white">{p.name}</h3>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 block mt-0.5">
                            {p.patientId} &bull; {emailKey}
                          </span>
                        </div>
                        {(() => {
                          const tier = (p.accessTier || p.insuranceProvider || "Self-Pay").toString();
                          if (tier.toLowerCase().includes("nhs") || tier.toLowerCase().includes("e-referral")) {
                            return (
                              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm whitespace-nowrap inline-flex items-center gap-1">
                                🏥 NHS e-Referral
                              </span>
                            );
                          }
                          if (tier.toLowerCase().includes("insur") || p.insuranceProvider === "Bupa" || p.insuranceProvider === "AXA" || p.insuranceProvider === "Aviva") {
                            return (
                              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-blue-600 text-white border-blue-500 shadow-sm whitespace-nowrap inline-flex items-center gap-1">
                                🛡️ {p.insuranceProvider || "Insured"}
                              </span>
                            );
                          }
                          return (
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-600 text-white border-emerald-500 shadow-sm whitespace-nowrap inline-flex items-center gap-1">
                              💳 Self-Pay
                            </span>
                          );
                        })()}
                      </div>

                      <p className="text-xs text-clinical-teal font-bold">{p.surgery}</p>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {p.surgeryDate} ({p.daysPostOp || 0} days post-op)
                      </p>

                      {/* Insurer / NHS Details Chip */}
                      {(p.insurancePreAuth || p.preAuthCode || p.policyNumber || p.ubrn) && (
                        <div className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-[11px] font-mono space-y-1 mt-2">
                          {(p.policyNumber || p.insuranceProvider) && (
                            <div className="flex justify-between items-center text-slate-200">
                              <span className="text-slate-300 font-sans text-[10px] uppercase font-bold tracking-wider">INSURER:</span>
                              <span className="font-extrabold text-cyan-300">{p.insuranceProvider} {p.policyNumber ? `(#${p.policyNumber})` : ""}</span>
                            </div>
                          )}
                          {(p.insurancePreAuth || p.preAuthCode) && (
                            <div className="flex justify-between items-center text-slate-200">
                              <span className="text-slate-300 font-sans text-[10px] uppercase font-bold tracking-wider">PRE-AUTH CODE:</span>
                              <span className="font-extrabold text-emerald-300">{p.insurancePreAuth || p.preAuthCode}</span>
                            </div>
                          )}
                          {p.ubrn && (
                            <div className="flex justify-between items-center text-slate-200">
                              <span className="text-slate-300 font-sans text-[10px] uppercase font-bold tracking-wider">NHS BOOKING REF:</span>
                              <span className="font-extrabold text-cyan-300">{p.ubrn}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PROMs OKS Visual Trajectory Graph */}
                      {p.oksHistory && p.oksHistory.length > 0 && (
                        <div className="mt-3">
                          <OKSTrendGraph history={p.oksHistory} />
                        </div>
                      )}

                      {/* Issued Certificates List */}
                      {p.certificates && p.certificates.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                            ISSUED CLEARANCES:
                          </span>
                          {p.certificates.map((cert) => (
                            <div
                              key={cert.id}
                              className="flex justify-between items-center text-xs bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                            >
                              <span className="font-bold truncate pr-2 text-slate-900 dark:text-white">{cert.clearanceType}</span>
                              <button
                                onClick={() => {
                                  setCertModalPatient({ email: emailKey, name: p.name, surgery: p.surgery });
                                  setCertType(cert.clearanceType);
                                  setCertRestrictions(cert.restrictions);
                                  setCertEffectiveDate(cert.effectiveDate);
                                  setIsPrintCertVisible(true);
                                }}
                                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] whitespace-nowrap cursor-pointer shadow-xs"
                              >
                                🖨️ View / Print PDF
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Issued Invoices & Telemetry Status Ledger */}
                      {p.invoices && p.invoices.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-2.5">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            <span>INVOICES &amp; EXCESS LEDGER:</span>
                            <span className="text-[10px] text-cyan-400 font-normal">Auto-Tracked Telemetry</span>
                          </div>
                          {p.invoices.map((inv: any) => (
                            <div
                              key={inv.id}
                              className="flex justify-between items-center text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 text-white gap-3 shadow-inner"
                            >
                              <div className="space-y-1 flex-1 min-w-0">
                                <div>
                                  <span className="font-mono font-extrabold text-cyan-300 text-sm">£{parseFloat(inv.amount).toFixed(2)}</span>
                                  <span className="text-xs font-bold text-slate-200 block sm:inline sm:ml-2">({inv.type})</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  {inv.status === "PAID" && (
                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      ✓ PAID ({inv.dateSent})
                                    </span>
                                  )}
                                  {inv.status === "PENDING" && (
                                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      ⏳ PENDING ({inv.channel || "WhatsApp"})
                                    </span>
                                  )}
                                  {inv.status === "OVERDUE" && (
                                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      🚨 OVERDUE 14+ DAYS
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono pt-1 leading-tight space-y-1">
                                  <div>Sent: {inv.dateSent} &bull; Channel: {inv.channel || "WhatsApp"} &bull; Ref: {inv.id}</div>
                                  
                                  {/* Sleek Compact Chaser Audit Box */}
                                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80 space-y-0.5">
                                    <div className="text-[10px] text-amber-300/90 font-medium flex items-center justify-between gap-1 flex-wrap">
                                      <span className="flex items-center gap-1">
                                        📢 <strong>Chased:</strong> {inv.chaseCount || (inv.chaseHistory ? inv.chaseHistory.length : 0)}x
                                      </span>
                                      {inv.lastChasedDate && (
                                        <span className="text-[9.5px] font-mono text-cyan-300">
                                          Last: {inv.lastChasedDate}
                                        </span>
                                      )}
                                    </div>

                                    {/* Full Chronological Chaser Timestamp Audit Trail Dropdown Menu */}
                                    {inv.chaseHistory && inv.chaseHistory.length > 0 ? (
                                      <details className="mt-0.5 group">
                                        <summary className="text-[9.5px] text-slate-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors flex items-center justify-between gap-1 pt-0.5 border-t border-slate-900/80 select-none">
                                          <span>📋 View Chaser Audit Trail ({inv.chaseHistory.length} logs)</span>
                                          <span className="text-[8.5px] text-slate-500 font-mono group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="mt-1 space-y-1 font-mono text-[9px] max-h-20 overflow-y-auto pr-1">
                                          {inv.chaseHistory.map((h: any, hIdx: number) => (
                                            <div key={hIdx} className="flex justify-between items-center bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-300">
                                              <span>Chase #{inv.chaseHistory.length - hIdx}: {h.date} {h.time || ""}</span>
                                              <span className="text-emerald-400 font-bold text-[8.5px]">via {h.channel || "WHATSAPP"}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </details>
                                    ) : (
                                      <div className="text-slate-500 italic text-[9px] pt-0.5">
                                        No chasers logged yet (Click 💬 WhatsApp to chase)
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {inv.status !== "PAID" && (
                                <div className="flex flex-col gap-1.5 shrink-0 min-w-[100px] justify-center self-center">
                                  <button
                                    onClick={async () => {
                                      const text = encodeURIComponent(`Lincolnshire Knee Clinic Reminder: Dear ${p.name}, your ${inv.type} invoice of £${inv.amount} remains outstanding. Pay online securely: https://lincolnshirekneeclinic.co.uk/portal or BACS Ref: ${inv.id}. Thank you.`);
                                      window.open(`https://wa.me/447700900123?text=${text}`, "_blank");

                                      // Log chaser timestamp to EHR database
                                      await fetch("/api/portal/patients", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          email: emailKey,
                                          pin: "230670",
                                          logChaser: { id: inv.id, channel: "WHATSAPP" }
                                        })
                                      });

                                      const res = await fetch("/api/portal/patients");
                                      if (res.ok) setPatients(await res.json());
                                    }}
                                    className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs text-center"
                                  >
                                    💬 WhatsApp
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/portal/patients", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          email: emailKey,
                                          pin: "230670",
                                          updateInvoiceStatus: { id: inv.id, status: "PAID" }
                                        })
                                      });
                                      const res = await fetch("/api/portal/patients");
                                      if (res.ok) setPatients(await res.json());
                                    }}
                                    className="w-full py-1.5 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs text-center"
                                  >
                                    ✓ Mark Paid
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => setNoteModalPatient({ email: emailKey, name: p.name })}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <span>📝 Log Note</span>
                      </button>
                      <button
                        onClick={() => {
                          setCertModalPatient({ email: emailKey, name: p.name, surgery: p.surgery });
                          setIsPrintCertVisible(false);
                        }}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <span>📜 Fit Cert</span>
                      </button>
                      <button
                        onClick={() => {
                          setDiagModalPatient({ email: emailKey, name: p.name, surgery: p.surgery });
                          setDiagClinicalHistory(`Specialist investigation for ${p.surgery}. Assess joint cartilage thickness, ligament integrity, and alignment.`);
                          setIsPrintDiagVisible(false);
                        }}
                        className="py-2.5 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-xl border border-cyan-500/30 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <span>🔬 Scan Script</span>
                      </button>
                      <button
                        onClick={() => {
                          setInvoiceModalPatient({
                            email: emailKey,
                            name: p.name,
                            balanceDue: p.balanceDue || 200,
                            insuranceProvider: p.insuranceProvider
                          });
                          setInvoiceAmount(String(p.balanceDue || 200));
                        }}
                        className="py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-xl border border-emerald-500/40 cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <span>💳 Send Invoice</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMsgEmail(emailKey);
                          setActiveTab("messages");
                        }}
                        className="py-2.5 px-3 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl cursor-pointer col-span-2 text-center shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>💬 Direct Message Patient</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patient Messaging Tab */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
            {/* Left: Patient List */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="font-serif font-bold text-sm">Conversations</h3>
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {patientEntries.map(([emailKey, p]) => {
                  const unreadCount = (p.messages || []).filter(m => m.sender === "patient" && !m.read).length;
                  const isSelected = selectedMsgEmail === emailKey;
                  return (
                    <button
                      key={emailKey}
                      onClick={() => setSelectedMsgEmail(emailKey)}
                      className={`w-full p-2.5 rounded-xl text-left transition-colors flex justify-between items-center cursor-pointer ${
                        isSelected
                          ? "bg-clinical-teal text-white"
                          : isTheatreMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs truncate">{p.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-slate-400"}`}>{p.surgery}</div>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Message Window */}
            <div className={`md:col-span-2 p-4 rounded-2xl border flex flex-col justify-between ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              {selectedMsgEmail && patients[selectedMsgEmail] ? (
                <>
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-sm">{patients[selectedMsgEmail].name}</h3>
                      <p className="text-[10px] text-slate-400">{patients[selectedMsgEmail].patientId} &bull; {selectedMsgEmail}</p>
                    </div>
                    <span className="text-[10px] font-bold text-clinical-teal bg-clinical-teal/10 px-2 py-0.5 rounded-full">Active Thread</span>
                  </div>

                  <div className="flex-1 my-4 space-y-3 overflow-y-auto max-h-[340px] pr-2">
                    {(!patients[selectedMsgEmail].messages || patients[selectedMsgEmail].messages.length === 0) ? (
                      <div className="text-center py-12 text-slate-400 text-xs italic">
                        No messages exchanged yet with this patient. Send a welcome or post-op check-in message below.
                      </div>
                    ) : (
                      patients[selectedMsgEmail].messages!.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === "clinician" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className={`p-3 rounded-2xl text-xs ${
                            msg.sender === "clinician"
                              ? "bg-clinical-teal text-white rounded-br-none"
                              : isTheatreMode ? "bg-slate-800 text-slate-100 rounded-bl-none" : "bg-slate-100 text-slate-800 rounded-bl-none"
                          }`}>
                            <p>{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {msg.sender === "clinician" ? "Mr Pacheco" : "Patient"} &bull; {msg.timestamp}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={msgInputText}
                      onChange={(e) => setMsgInputText(e.target.value)}
                      placeholder="Type or dictate clinical advice..."
                      className={`flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-clinical-teal ${
                        isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => startDictation((text) => setMsgInputText((prev) => (prev ? `${prev} ${text}` : text)))}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700"
                      }`}
                      title="Voice Dictate Message"
                    >
                      🎙️
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingMsg || !msgInputText.trim()}
                      className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md disabled:opacity-50"
                    >
                      {isSendingMsg ? "Sending..." : "Send"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-400 text-xs">
                  <span className="text-3xl mb-2">💬</span>
                  <p className="font-bold">Select a patient from the conversation list to view or send messages.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today Tab */}
        {activeTab === "today" && (
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-base">Today's Clinic &amp; Surgical Schedule ({todaysPatients.length})</h2>
            {todaysPatients.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl text-slate-400 text-xs">
                No surgical or injection cases scheduled for today ({todayISO}).
              </div>
            ) : (
              <div className="space-y-3">
                {todaysPatients.map(([emailKey, p]) => (
                  <div key={emailKey} className={`p-4 rounded-2xl border flex justify-between items-center ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    <div>
                      <h3 className="font-bold text-sm font-serif">{p.name}</h3>
                      <p className="text-xs text-clinical-teal font-semibold">{p.surgery}</p>
                    </div>
                    <button onClick={() => setNoteModalPatient({ email: emailKey, name: p.name })} className="py-2 px-3 bg-clinical-teal text-white text-xs font-bold rounded-xl shadow-md">
                      Log Post-Op Note
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Injection Governance Tab */}
        {activeTab === "governance" && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-base">Joint Injection Governance &amp; Batch Tracking</h2>
                <p className="text-xs text-slate-500">CQC Audit compliant register for Arthrosamid® and steroid batches.</p>
              </div>
              <button
                onClick={handleExportCqcCsv}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>📥 Export CQC Audit CSV</span>
              </button>
            </div>

            {/* Injection Form */}
            <div className={`p-5 rounded-2xl border space-y-4 ${isTheatreMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="font-serif font-bold text-sm">Log New Administered Injection</h3>
              <form onSubmit={handleAddInjection} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Patient Name</label>
                  <input type="text" required value={injPatientName} onChange={(e) => setInjPatientName(e.target.value)} placeholder="e.g. Mr David Watson" className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </div>
                <div>
                  <label className="font-bold block mb-1">Product</label>
                  <select value={injProduct} onChange={(e) => setInjProduct(e.target.value)} className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}>
                    <option value="Arthrosamid® Hydrogel">Arthrosamid® Hydrogel (6.0ml)</option>
                    <option value="Corticosteroid (Triamcinolone)">Corticosteroid (Triamcinolone 40mg)</option>
                    <option value="Hyaluronic Acid (Ostenil Plus)">Hyaluronic Acid (Ostenil Plus)</option>
                    <option value="PRP (Autologous Platelet Rich Plasma)">PRP (Autologous Platelet Rich Plasma)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Batch / Lot Number</label>
                  <input type="text" required value={injBatch} onChange={(e) => setInjBatch(e.target.value)} placeholder="e.g. ARTH-2026-8819" className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </div>
                <div>
                  <label className="font-bold block mb-1">Admin Location</label>
                  <select value={injLocation} onChange={(e) => setInjLocation(e.target.value)} className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}>
                    <option value="St. Hugh's Hospital">St. Hugh's Hospital</option>
                    <option value="Parkhill Hospital">Parkhill Hospital</option>
                    <option value="Lincoln Private Hospital">Lincoln Private Hospital</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Knee Side</label>
                  <select value={injSide} onChange={(e) => setInjSide(e.target.value)} className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}>
                    <option value="Left Knee">Left Knee</option>
                    <option value="Right Knee">Right Knee</option>
                    <option value="Bilateral Knees">Bilateral Knees</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Admin Date</label>
                  <input type="date" value={injAdminDate} onChange={(e) => setInjAdminDate(e.target.value)} className={`w-full px-3 py-2 border rounded-xl ${isTheatreMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <button type="submit" className="w-full py-2.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md">
                    Log Injection Batch to CQC Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL 1: Clinical Note Modal ─── */}
      {noteModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-950 text-base">Log Clinical Note &bull; {noteModalPatient.name}</h3>
              <button onClick={() => setNoteModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveNote} className="space-y-3 text-xs text-slate-900">
              <div>
                <label className="font-bold block mb-1">Consultation Phase</label>
                <input type="text" value={notePhase} onChange={(e) => setNotePhase(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="font-bold block mb-1">Range of Motion (ROM)</label>
                <input type="text" value={noteRom} onChange={(e) => setNoteRom(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold">Consultant Findings &amp; Advice</label>
                  <button
                    type="button"
                    onClick={() => startDictation((text) => setNoteText((prev) => (prev ? `${prev} ${text}` : text)))}
                    className={`px-2.5 py-1 font-bold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isListening ? "bg-rose-500 text-white animate-pulse" : "bg-clinical-teal/10 hover:bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/20"
                    }`}
                  >
                    <span>{isListening ? "🎙️ Listening..." : "🎙️ Voice Dictate"}</span>
                  </button>
                </div>
                <textarea rows={4} required value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Type or click 'Voice Dictate' to speak clinical findings..." className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-clinical-teal text-white font-bold rounded-xl text-xs cursor-pointer shadow-md">
                Save Note to Patient EHR Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Fit-to-Work / Drive Clearance Certificate ─── */}
      {certModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
              <div>
                <h3 className="font-bold text-slate-950 text-base">1-Click Fit-to-Work / Driving Certificate</h3>
                <p className="text-xs text-slate-400">Formal letterhead statement for GP or Employer</p>
              </div>
              <button onClick={() => setCertModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {!isPrintCertVisible ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1.5">1-Click Standard Presets:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CERT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setCertType(p.type);
                          setCertRestrictions(p.restrictions);
                        }}
                        className="p-2 text-left bg-slate-50 hover:bg-clinical-teal/10 border border-slate-200 hover:border-clinical-teal rounded-lg font-medium text-slate-800 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clearance Category</label>
                  <select value={certType} onChange={(e) => setCertType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                    <option value="Return to Driving & Light Work">Return to Driving &amp; Light Work</option>
                    <option value="Light Work Duties Only">Light Work Duties Only</option>
                    <option value="Full Unrestricted Work & Sports Duties">Full Unrestricted Work &amp; Sports Duties</option>
                    <option value="Fit to Fly & Long Distance Travel">Fit to Fly &amp; Long Distance Travel</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effective Clearance Date</label>
                  <input type="date" value={certEffectiveDate} onChange={(e) => setCertEffectiveDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Restrictions / Special Instructions</label>
                    <button
                      type="button"
                      onClick={() => startDictation((text) => setCertRestrictions((prev) => (prev ? `${prev} ${text}` : text)))}
                      className={`px-2.5 py-1 font-bold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-clinical-teal/10 hover:bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/20"
                      }`}
                    >
                      <span>{isListening ? "🎙️ Listening..." : "🎙️ Voice Dictate"}</span>
                    </button>
                  </div>
                  <textarea rows={3} value={certRestrictions} onChange={(e) => setCertRestrictions(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900" />
                </div>
                <button
                  onClick={() => {
                    handleSaveCertificate();
                    setIsPrintCertVisible(true);
                  }}
                  className="w-full py-3 bg-slate-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Preview &amp; Issue Printable Letterhead
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Official Letterhead Container */}
                <div id="printable-certificate-area" className="border border-slate-300 p-6 rounded-xl bg-white space-y-4 text-slate-900 text-xs shadow-inner">
                  <div className="flex justify-between border-b-2 border-slate-900 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-950 tracking-wide">LINCOLNSHIRE KNEE CLINIC</h4>
                      <p className="text-[11px] text-clinical-teal font-semibold">Mr Ricardo J Pacheco FRCS (Tr &amp; Orth)</p>
                      <p className="text-[10px] text-slate-500">Consultant Orthopaedic Knee Surgeon</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                      <p className="font-bold text-slate-700">GMC Ref: 4145976</p>
                      <p>Issued: {new Date().toLocaleDateString("en-GB")}</p>
                      <p>Ref ID: LKC-CERT-{Date.now().toString().slice(-6)}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <p className="font-bold text-slate-950 text-sm tracking-wide border-b border-slate-100 pb-1">OFFICIAL CLINICAL CLEARANCE STATEMENT</p>
                    <p>Patient Name: <span className="font-bold text-slate-950">{certModalPatient.name}</span></p>
                    <p>Procedure / Diagnosis: <span className="font-bold text-slate-950">{certModalPatient.surgery}</span></p>
                    <p className="mt-3 leading-relaxed">
                      This formal statement confirms that the patient named above has undergone post-operative clinical review. Based on structural healing, quadriceps tone, and knee range of motion, the patient is hereby cleared for:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center my-2">
                      <span className="font-bold text-sm text-clinical-teal block">{certType}</span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">Effective Date: <strong>{certEffectiveDate}</strong></span>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-lg text-slate-800">
                      <span className="font-bold block text-[11px] text-amber-900 mb-0.5">Clinical Restrictions &amp; Guidelines:</span>
                      <p className="italic text-[11px]">{certRestrictions}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <div className="font-serif italic text-sm font-bold text-slate-800">Mr Ricardo J Pacheco</div>
                      <p className="font-bold text-[10px] text-slate-950">Mr Ricardo J Pacheco FRCS (Tr &amp; Orth)</p>
                      <p className="text-[9px] text-slate-500">Lead Consultant Knee Surgeon</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 inline-block">
                        ✓ Digitally Verified &amp; Signed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 print:hidden">
                  <button onClick={() => setIsPrintCertVisible(false)} className="w-1/2 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50">
                    ✏️ Edit Certificate
                  </button>
                  <button onClick={() => window.print()} className="w-1/2 py-2.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5">
                    <span>🖨️ Print / Export to PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Diagnostic Imaging Requisition Modal ─── */}
      {diagModalPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
              <div>
                <h3 className="font-bold text-slate-950 text-base">Issue PACS Diagnostic Requisition &bull; {diagModalPatient.name}</h3>
                <span className="text-xs text-clinical-teal font-semibold">{diagModalPatient.surgery}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.vista-health.co.uk/partners/clinical/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-clinical-teal/10 hover:bg-clinical-teal/20 border border-clinical-teal/30 text-clinical-teal font-bold text-[11px] rounded-lg transition-colors"
                >
                  🔗 Open Vista Referrer Portal ↗
                </a>
                <button onClick={() => setDiagModalPatient(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
              </div>
            </div>

            {!isPrintDiagVisible ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsPrintDiagVisible(true);
                  showToast(`✓ PACS Requisition generated for ${diagModalPatient.name}`);
                }}
                className="space-y-4 text-xs text-slate-900 print:hidden"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Requested Modality</label>
                  <select value={diagModality} onChange={(e) => setDiagModality(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                    <option value="3T MRI Scan (Knee Left)">3T MRI Scan (Knee Left)</option>
                    <option value="3T MRI Scan (Knee Right)">3T MRI Scan (Knee Right)</option>
                    <option value="Weight-Bearing Knee X-Ray (3-View Series)">Weight-Bearing Knee X-Ray (3-View Series)</option>
                    <option value="Dynamic Musculoskeletal Ultrasound">Dynamic Musculoskeletal Ultrasound</option>
                    <option value="3D Computed Tomography (CT Geometry Scan)">3D Computed Tomography (CT Geometry Scan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Diagnostic Provider Facility</label>
                  <select value={diagFacility} onChange={(e) => setDiagFacility(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                    <option value="St. Hugh's Hospital Radiology">St. Hugh's Hospital Radiology (Peaks Lane, Grimsby)</option>
                    <option value="Parkhill Hospital Imaging Center">Parkhill Hospital Imaging Center (Grantham &amp; South Lincs)</option>
                    <option value="Lincolnshire Open MRI &amp; Diagnostics">Lincolnshire Open MRI &amp; Diagnostics (Lincoln Central)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Clinical History &amp; Questions for Radiologist</label>
                    <button
                      type="button"
                      onClick={() => startDictation((text) => setDiagClinicalHistory((prev) => (prev ? `${prev} ${text}` : text)))}
                      className={`px-2.5 py-1 font-bold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-clinical-teal/10 hover:bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/20"
                      }`}
                    >
                      <span>{isListening ? "🎙️ Listening..." : "🎙️ Voice Dictate"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={diagClinicalHistory}
                    onChange={(e) => setDiagClinicalHistory(e.target.value)}
                    placeholder="Describe clinical findings, specific questions for radiologist, and target structures..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDiagModalPatient(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-clinical-teal text-white font-bold rounded-xl cursor-pointer shadow-md">
                    Generate Referral Document →
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-300 p-6 rounded-2xl bg-white space-y-5 text-slate-900 text-xs shadow-inner">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                      <div className="font-serif font-bold text-base text-deep-navy">Lincolnshire Knee Clinic</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Specialist Knee Reconstructive &amp; Arthroscopy Surgery</div>
                      <div className="text-[10px] text-slate-500">GMC Ref: 4145976 &bull; Secretary Tel: 07700 900123</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-teal block">PACS Diagnostic Requisition</span>
                      <span className="font-mono text-xs font-bold text-slate-800">REF-884910</span>
                      <span className="text-[10px] text-slate-500 block">{new Date().toISOString().split("T")[0]}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block">Patient Details</span>
                      <span className="font-bold text-slate-900 text-sm block">{diagModalPatient.name}</span>
                      <span className="text-slate-600 font-mono text-[11px]">{diagModalPatient.email}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block">Target Facility</span>
                      <span className="font-bold text-clinical-teal">{diagFacility}</span>
                      <span className="text-slate-600 text-[11px] block mt-0.5">Requested Modality: <strong>{diagModality}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block border-b border-slate-200 pb-1">
                      Clinical History &amp; Specific Investigation Request
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {diagClinicalHistory}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <div className="font-serif italic text-sm font-bold text-slate-800">Mr Ricardo J Pacheco</div>
                      <p className="font-bold text-[10px] text-slate-950">Mr Ricardo J Pacheco FRCS (Tr &amp; Orth)</p>
                      <p className="text-[9px] text-slate-500">Lead Consultant Knee Surgeon</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-cyan-800 font-bold bg-cyan-50 px-2.5 py-1 rounded border border-cyan-300 inline-block">
                        ✓ PACS Requisition Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 print:hidden">
                  <button onClick={() => setIsPrintDiagVisible(false)} className="w-1/2 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50">
                    ✏️ Edit Request
                  </button>
                  <button onClick={() => window.print()} className="w-1/2 py-2.5 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5">
                    <span>🖨️ Print / Export Requisition PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Interactive Invoice & Excess Dispatcher Modal */}
      {invoiceModalPatient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  💳 Send Invoice / Excess Notice
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dispatch billing statements &amp; insurance excess requisitions via WhatsApp or Email
                </p>
              </div>
              <button
                onClick={() => setInvoiceModalPatient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSendingInvoice(true);

                try {
                  const res = await fetch("/api/portal/patients", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: invoiceModalPatient.email,
                      pin: "230670",
                      newInvoice: {
                        amount: invoiceAmount,
                        type: invoiceType,
                        status: "PENDING",
                        channel: invoiceChannel,
                        description: invoiceNotes || `Lincolnshire Knee Clinic ${invoiceType}`
                      }
                    })
                  });

                  if (res.ok) {
                    const updated = await fetch("/api/portal/patients");
                    if (updated.ok) setPatients(await updated.json());

                    if (invoiceChannel === "WHATSAPP") {
                      const msgText = encodeURIComponent(
                        `Lincolnshire Knee Clinic Invoice Notice:\nDear ${invoiceModalPatient.name},\nYour ${invoiceType} statement of £${parseFloat(invoiceAmount).toFixed(2)} is ready for settlement.\n\nPay online securely: https://lincolnshirekneeclinic.co.uk/portal\nOr BACS Transfer to Lincolnshire Knee Clinic Ltd.\n\nThank you,\nMr Ricardo J Pacheco FRCS (Tr & Orth)`
                      );
                      window.open(`https://wa.me/447700900123?text=${msgText}`, "_blank");
                    }

                    setToastMessage(`✓ ${invoiceType} statement sent successfully!`);
                    setTimeout(() => setToastMessage(""), 4000);
                    setInvoiceModalPatient(null);
                  }
                } catch (err: any) {
                  alert("Failed to send invoice: " + err.message);
                } finally {
                  setIsSendingInvoice(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Patient Name</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{invoiceModalPatient.email}</span>
                </div>
                <span className="font-bold text-sm text-white block">{invoiceModalPatient.name}</span>
                {invoiceModalPatient.insuranceProvider && (
                  <span className="text-[11px] text-slate-300 block">Insurer: <strong>{invoiceModalPatient.insuranceProvider}</strong></span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Billing Category</label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="Insurance Excess">Insurance Policy Excess</option>
                    <option value="Self-Pay Consultation">Consultation Fee</option>
                    <option value="Post-Op Surgical Balance">Post-Op Surgical Fee</option>
                    <option value="Diagnostic Imaging Fee">Vista Health Diagnostic Fee</option>
                    <option value="Injection Therapy">Injection Procedure Fee</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Amount Due (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Delivery Channel</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInvoiceChannel("WHATSAPP")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      invoiceChannel === "WHATSAPP"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <span>💬 WhatsApp Instant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceChannel("EMAIL")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      invoiceChannel === "EMAIL"
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <span>📧 Direct Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Custom Notes / Payment Terms</label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Optional BACS reference or payment deadline notes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInvoiceModalPatient(null)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvoice}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span>{isSendingInvoice ? "Dispatching..." : `Dispatch via ${invoiceChannel === "WHATSAPP" ? "WhatsApp 💬" : "Email 📧"}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
