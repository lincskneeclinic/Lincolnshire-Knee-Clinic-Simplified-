"use client";

import React, { useState, useEffect, useRef } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";

// Interface definitions
interface Exercise {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  videoTips?: string[];
  videoUrl?: string;
}

interface RecoveryDoc {
  title: string;
  filename: string;
  date: string;
  type: "Letter" | "Order" | "Guide";
}

interface PatientInfo {
  name: string;
  dob: string;
  patientId: string;
  surgery: string;
  surgeryDate: string;
  daysPostOp: number;
  surgeon: string;
  exercises: Exercise[];
  documents: RecoveryDoc[];
  balanceDue: number;
  insuranceProvider?: string;
  insurancePreAuth?: string;
  accessTier?: "Consultation" | "Injection" | "Surgery";
}

// Mock appointments
interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  practitioner: string;
  instructions: string;
}

// Oxford Knee Score question schema
interface OxfordQuestion {
  id: number;
  question: string;
  options: { text: string; score: number }[];
}

const oxfordQuestions: OxfordQuestion[] = [
  {
    id: 1,
    question: "How would you describe the pain you usually have from your knee?",
    options: [
      { text: "None", score: 4 },
      { text: "Mild", score: 3 },
      { text: "Moderate", score: 2 },
      { text: "Severe", score: 1 },
      { text: "Unbearable", score: 0 },
    ],
  },
  {
    id: 2,
    question: "Have you had any trouble washing and drying yourself (all over) because of your knee?",
    options: [
      { text: "No trouble at all", score: 4 },
      { text: "Very little trouble", score: 3 },
      { text: "Moderate trouble", score: 2 },
      { text: "Extreme difficulty", score: 1 },
      { text: "Impossible to do", score: 0 },
    ],
  },
  {
    id: 3,
    question: "Have you had any trouble getting in and out of a car or using public transport because of your knee?",
    options: [
      { text: "No trouble at all", score: 4 },
      { text: "Very little trouble", score: 3 },
      { text: "Moderate trouble", score: 2 },
      { text: "Extreme difficulty", score: 1 },
      { text: "Impossible to do", score: 0 },
    ],
  },
  {
    id: 4,
    question: "For how long have you been able to walk before pain from your knee becomes severe? (with or without stick)",
    options: [
      { text: "No pain / More than 30 minutes", score: 4 },
      { text: "16 to 30 minutes", score: 3 },
      { text: "5 to 15 minutes", score: 2 },
      { text: "Around the house only", score: 1 },
      { text: "Not at all - severe pain on walking", score: 0 },
    ],
  },
  {
    id: 5,
    question: "After a meal (sat at a table), how painful has it been to stand up from a chair because of your knee?",
    options: [
      { text: "Not at all painful", score: 4 },
      { text: "Slightly painful", score: 3 },
      { text: "Moderately painful", score: 2 },
      { text: "Very painful", score: 1 },
      { text: "Unbearable", score: 0 },
    ],
  },
  {
    id: 6,
    question: "Have you been limping when walking, because of your knee?",
    options: [
      { text: "Rarely / Never", score: 4 },
      { text: "Sometimes or just at first", score: 3 },
      { text: "Often / most of the time", score: 2 },
      { text: "Always", score: 1 },
      { text: "Cannot walk at all", score: 0 },
    ],
  },
  {
    id: 7,
    question: "Could you kneel down and get up again afterwards?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With some difficulty", score: 3 },
      { text: "With great difficulty", score: 2 },
      { text: "Very difficult / impossible", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
  {
    id: 8,
    question: "Have you been troubled by pain from your knee in bed at night?",
    options: [
      { text: "No nights", score: 4 },
      { text: "Only 1 or 2 nights", score: 3 },
      { text: "Some nights", score: 2 },
      { text: "Most nights", score: 1 },
      { text: "Every night", score: 0 },
    ],
  },
  {
    id: 9,
    question: "How much has pain from your knee interfered with your usual work (including housework)?",
    options: [
      { text: "Not at all", score: 4 },
      { text: "A little bit", score: 3 },
      { text: "Moderately", score: 2 },
      { text: "Greatly", score: 1 },
      { text: "Totally", score: 0 },
    ],
  },
  {
    id: 10,
    question: "Have you felt that your knee might suddenly 'give way' or let you down?",
    options: [
      { text: "Rarely / Never", score: 4 },
      { text: "Only at first / Sometimes", score: 3 },
      { text: "Often", score: 2 },
      { text: "Most of the time", score: 1 },
      { text: "Always", score: 0 },
    ],
  },
  {
    id: 11,
    question: "Could you do the household shopping on your own?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With some difficulty", score: 3 },
      { text: "With great difficulty", score: 2 },
      { text: "Very difficult / impossible", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
  {
    id: 12,
    question: "Could you walk down a flight of stairs?",
    options: [
      { text: "Yes, easily", score: 4 },
      { text: "With some difficulty", score: 3 },
      { text: "With great difficulty", score: 2 },
      { text: "Very difficult / impossible", score: 1 },
      { text: "No, impossible", score: 0 },
    ],
  },
];

// Mock patients database
const mockPatients: Record<string, PatientInfo> = {
  "patient@lincsknee.com": {
    name: "Mr. John Henderson",
    dob: "14/05/1971",
    patientId: "LKC-88402",
    surgery: "Total Knee Replacement (Left)",
    surgeryDate: "11/07/2026",
    daysPostOp: 12,
    surgeon: "Mr. S. R. Kempshall",
    balanceDue: 250.0,
    accessTier: "Surgery",
    exercises: [
      { id: "slr", name: "Straight Leg Raises", description: "Tighten thigh muscle, lift leg 6 inches, hold for 5s. 3 sets of 10.", completed: false, videoTips: ["Keep back flat", "Engage your core", "Control the descent slowly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "kb", name: "Seated Knee Bends", description: "Sit on chair, slide foot back under seat as far as possible, hold 5s. 3 sets of 10.", completed: false, videoTips: ["Keep hips level", "Slide slowly", "Hold at maximum comfortable stretch"], videoUrl: "https://www.youtube.com/embed/R9tGfJ-S1xM" },
      { id: "ap", name: "Ankle Pumps", description: "Move foot up and down rapidly to promote circulation. 10 reps every hour.", completed: false, videoTips: ["Contract calf fully", "Flex toes towards shin", "Move briskly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "ie", name: "Ice & Elevation", description: "Elevate leg above heart level, apply cold pack. 15-20 minutes, 4x daily.", completed: false, videoTips: ["Use pillows for support", "Keep knee straight during elevation", "Wrap ice in a cloth"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "w", name: "Short Walks", description: "Walk inside or outside using crutches/walker as tolerated. 5-10 mins, 3x daily.", completed: false, videoTips: ["Maintain heel-toe gait", "Stand tall", "Use walking aids safely"], videoUrl: "https://www.youtube.com/embed/R9tGfJ-S1xM" }
    ],
    documents: [
      { title: "Total Knee Replacement Recovery Guide", filename: "total-knee-replacement-recovery-guide.pdf", date: "11/07/2026", type: "Guide" },
      { title: "Clinical Summary Letter (Discharge)", filename: "lkc-discharge-henderson.pdf", date: "13/07/2026", type: "Letter" },
      { title: "Diagnostic Ultrasound Referral Script", filename: "lkc-ultrasound-referral.pdf", date: "15/07/2026", type: "Order" }
    ]
  },
  "acl@lincsknee.com": {
    name: "Ms. Sarah Jenkins",
    dob: "22/09/1998",
    patientId: "LKC-90211",
    surgery: "ACL Reconstruction (Right)",
    surgeryDate: "15/07/2026",
    daysPostOp: 8,
    surgeon: "Mr. S. R. Kempshall",
    balanceDue: 0.0,
    insuranceProvider: "Bupa",
    insurancePreAuth: "BI-992019-X",
    accessTier: "Surgery",
    exercises: [
      { id: "qs", name: "Quad Sets (Static Quads)", description: "Lie flat, push the back of your knee down into the bed to tighten your thigh. Hold 5s. 10 reps, 4-6x daily.", completed: false, videoTips: ["Focus on quad contraction", "Keep heel flat", "Do not hold breath"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "hs", name: "Heel Slides", description: "Gently slide your heel toward your buttocks, bending your knee as far as comfortable. Hold 5s. 3 sets of 10.", completed: false, videoTips: ["Use a strap if needed", "Do not force bending", "Slide smoothly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "pm", name: "Patellar Mobilisation", description: "Use your fingers to gently push your kneecap up, down, and side to side. 2-3 minutes, twice daily.", completed: false, videoTips: ["Keep quadricep relaxed", "Use light pressure", "Cover all 4 directions"], videoUrl: "https://www.youtube.com/embed/R9tGfJ-S1xM" },
      { id: "slr", name: "Straight Leg Raises", description: "Tighten thigh, lift leg 6 inches, hold for 5s. 3 sets of 10.", completed: false, videoTips: ["Ensure knee is locked straight", "Hold for a full 5 count", "Control lowering"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "eh", name: "Extension Hangs", description: "Rest heel on a rolled towel, allowing gravity to gently stretch the knee flat. 5-10 minutes.", completed: false, videoTips: ["Let muscles relax completely", "Gravity does the work", "Stop if sharp pain occurs"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" }
    ],
    documents: [
      { title: "ACL Reconstruction Recovery Guide", filename: "acl-reconstruction-recovery-guide.pdf", date: "15/07/2026", type: "Guide" },
      { title: "Post-Op Consultation Summary Letter", filename: "lkc-post-op-summary-jenkins.pdf", date: "17/07/2026", type: "Letter" },
      { title: "Referral Script: Post-Op MRI Assessment", filename: "lkc-mri-referral-jenkins.pdf", date: "20/07/2026", type: "Order" }
    ]
  },
  "patellar@lincsknee.com": {
    name: "Mr. James Morrison",
    dob: "03/11/1989",
    patientId: "LKC-71439",
    surgery: "Patellar Stabilisation (Left)",
    surgeryDate: "18/07/2026",
    daysPostOp: 5,
    surgeon: "Mr. S. R. Kempshall",
    balanceDue: 2150.0,
    accessTier: "Surgery",
    exercises: [
      { id: "sqc", name: "Static Quadriceps Contractions", description: "Sit or lie flat, tighten your thigh muscle, and pull your kneecap upwards. Hold for 5 seconds. 10 reps, 4-6x daily.", completed: false, videoTips: ["Squeeze thigh muscles hard", "Keep ankle flexed", "Hold contraction"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "slrb", name: "Straight Leg Raises in Brace", description: "Perform straight leg raises ONLY while the brace is locked in full extension. 3 sets of 10.", completed: false, videoTips: ["Check brace lock first", "Keep leg locked completely", "Do not swing leg"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "rhs", name: "Restricted Knee Bending", description: "Slide heel back to bend knee to maximum degree permitted (typically 60 or 90 degrees). 10 reps, 3x daily.", completed: false, videoTips: ["Stay within brace limitations", "Hold bend for 3-5 seconds", "Slide slowly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "chs", name: "Calf and Hamstring Stretches", description: "Use a towel looped around your foot to gently stretch calf/hamstring. Hold 20-30s, repeat 3 times.", completed: false, videoTips: ["Stretch should be gentle", "Keep knee straight", "Breath deeply"], videoUrl: "https://www.youtube.com/embed/R9tGfJ-S1xM" },
      { id: "ap", name: "Ankle Pumps", description: "Move foot up and down rapidly to promote circulation. 10-15 reps every hour.", completed: false, videoTips: ["Pump continuously", "Promotes blood circulation", "Can be done in bed"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" }
    ],
    documents: [
      { title: "Patellar Stabilisation Recovery Guide", filename: "patellar-stabilisation-recovery-guide.pdf", date: "18/07/2026", type: "Guide" },
      { title: "Clinical Assessment Summary Letter", filename: "lkc-assessment-morrison.pdf", date: "20/07/2026", type: "Letter" }
    ]
  },
  "consultation@lincsknee.com": {
    name: "Mr. Robert Vance",
    dob: "05/08/1982",
    patientId: "LKC-11029",
    surgery: "Knee Pain Assessment",
    surgeryDate: "N/A",
    daysPostOp: 0,
    surgeon: "Mr. S. R. Kempshall",
    balanceDue: 150.0,
    accessTier: "Consultation",
    exercises: [],
    documents: [
      { title: "Initial Consultation Summary Letter", filename: "lkc-consultation-vance.pdf", date: "20/07/2026", type: "Letter" }
    ]
  },
  "injection@lincsknee.com": {
    name: "Mrs. Emily Watson",
    dob: "19/12/1975",
    patientId: "LKC-44930",
    surgery: "Arthrosamid® Injection (Right)",
    surgeryDate: "18/07/2026",
    daysPostOp: 5,
    surgeon: "Mr. S. R. Kempshall",
    balanceDue: 2150.0,
    accessTier: "Injection",
    exercises: [
      { id: "ap", name: "Ankle Pumps", description: "Move foot up and down rapidly to promote circulation. 10 reps every hour.", completed: false, videoTips: ["Contract calf fully", "Flex toes towards shin", "Move briskly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" },
      { id: "ie", name: "Ice & Elevation", description: "Elevate leg above heart level, apply cold pack. 15-20 minutes, 4x daily.", completed: false, videoTips: ["Use pillows for support", "Keep knee straight during elevation", "Wrap ice in a cloth"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo" }
    ],
    documents: [
      { title: "Arthrosamid® Post-Injection Care Guide", filename: "arthrosamid-post-injection-guide.pdf", date: "18/07/2026", type: "Guide" },
      { title: "Clinical Summary Letter (Injection)", filename: "lkc-injection-summary-watson.pdf", date: "18/07/2026", type: "Letter" }
    ]
  }
};

export default function PatientPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Loaded Patient info states
  const [currentPatient, setCurrentPatient] = useState<PatientInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "intake" | "recovery" | "billing">("overview");

  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "appt-1",
      title: "Wound & Clip Review",
      date: "2026-07-25",
      time: "10:30 AM",
      location: "St Hugh's Hospital, Grimsby",
      practitioner: "Nurse Specialist Sarah Cooper",
      instructions: "Please remember to wear loose clothing or shorts for your knee examination. Keep dressing dry."
    },
    {
      id: "appt-2",
      title: "6-Week Consultant Review",
      date: "2026-08-22",
      time: "11:15 AM",
      location: "Lincoln Private Hospital, Lincoln",
      practitioner: "Mr. S. R. Kempshall",
      instructions: "Standard post-operative range of motion assessment. Bring your recovery booklet."
    }
  ]);

  // Appointment scheduling fields
  const [bookingType, setBookingType] = useState("Consultant Follow-Up");
  const [bookingLocation, setBookingLocation] = useState("Lincoln Private Hospital, Lincoln");
  const [bookingDate, setBookingDate] = useState("2026-08-10");
  const [bookingTime, setBookingTime] = useState("09:30 AM");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);

  // Telehealth Consultation Gateway State
  const [showTelehealth, setShowTelehealth] = useState(false);
  const [telehealthState, setTelehealthState] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [telehealthDuration, setTelehealthDuration] = useState(0);
  const [telehealthMic, setTelehealthMic] = useState(true);
  const [telehealthVideo, setTelehealthVideo] = useState(true);
  const [telehealthChat, setTelehealthChat] = useState<{ sender: "Doctor" | "Patient"; text: string; time: string }[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Digital Intake & PROM Questionnaire States
  const [medHistory, setMedHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [oxfordScores, setOxfordScores] = useState<Record<number, number>>({});
  const [consentApproved, setConsentApproved] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Antigravity Sync Agent state
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "done" | "error">("idle");

  // Document Vault State
  const [viewingDoc, setViewingDoc] = useState<RecoveryDoc | null>(null);
  const [uploadedScans, setUploadedScans] = useState<{ name: string; size: string; status: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Payments / Stripe State
  const [stripeCardNumber, setStripeCardNumber] = useState("");
  const [stripeExpiry, setStripeExpiry] = useState("");
  const [stripeCvc, setStripeCvc] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePreAuth, setInsurancePreAuth] = useState("");
  const [insuranceSubmitted, setInsuranceSubmitted] = useState(false);
  const [paidReceiptUrl, setPaidReceiptUrl] = useState<string | null>(null);

  // Handle mock login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (mockPatients[cleanEmail] && password === "KneeRecovery2026!") {
      const patient = mockPatients[cleanEmail];
      setCurrentPatient(patient);
      setExercises(patient.exercises);
      if (patient.exercises.length > 0) {
        setSelectedExercise(patient.exercises[0]);
      }
      if (patient.insuranceProvider) {
        setInsuranceProvider(patient.insuranceProvider);
        setInsurancePreAuth(patient.insurancePreAuth || "");
        setInsuranceSubmitted(true);
      }
      setIsLoggedIn(true);
      setLoginError("");
      
      // Determine default active landing tab based on accessTier
      const landingTab = patient.accessTier === "Consultation" || patient.accessTier === "Injection"
        ? "appointments"
        : "overview";
      setActiveTab(landingTab);
    } else {
      setLoginError("Invalid email address or access password. Please try again.");
    }
  };

  // Toggle exercise completion
  const toggleExercise = (id: string) => {
    setExercises(prev =>
      prev.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  // Video Player Progress Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (videoPlaying) {
      timer = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            // Only auto-pause for simulated/non-videoUrl exercises
            if (!selectedExercise?.videoUrl) {
              setVideoPlaying(false);
              return 0;
            }
            return 100; // Keep at 100% for real video streams
          }
          return prev + 2;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [videoPlaying, selectedExercise]);

  // Telehealth Duration Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (telehealthState === "active") {
      timer = setInterval(() => {
        setTelehealthDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setTelehealthDuration(0);
    }
    return () => clearInterval(timer);
  }, [telehealthState]);

  // Get User Webcam for Telehealth Simulation
  useEffect(() => {
    if (telehealthState === "active" && telehealthVideo) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.log("Webcam access declined or unavailable, showing avatar placeholder.", err);
        });
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
    }
  }, [telehealthState, telehealthVideo]);

  // Handle appointment rescheduling or booking
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (reschedulingId) {
      // Modify existing
      setAppointments(prev =>
        prev.map(app =>
          app.id === reschedulingId
            ? { ...app, date: bookingDate, time: bookingTime, location: bookingLocation }
            : app
        )
      );
      setReschedulingId(null);
    } else {
      // Add new
      const newAppt: Appointment = {
        id: `appt-${Date.now()}`,
        title: bookingType,
        date: bookingDate,
        time: bookingTime,
        location: bookingLocation,
        practitioner: "Mr. S. R. Kempshall",
        instructions: "Please wear loose clothing or shorts for knee assessment. Arrive 10 minutes early."
      };
      setAppointments(prev => [...prev, newAppt]);
    }
    setShowScheduler(false);
  };

  // Canvas Signature pad support
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!sigCanvasRef.current) return { x: 0, y: 0 };
    const rect = sigCanvasRef.current.getBoundingClientRect();
    
    // Check if TouchEvent
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#003B5C";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Oxford knee score calculation
  const totalOxfordScore = Object.values(oxfordScores).reduce((a, b) => a + b, 0);
  const oxfordCompletedCount = Object.keys(oxfordScores).length;

  const getOxfordScoreAssessment = (score: number) => {
    if (score <= 19) return { rating: "Severe Problems", desc: "May indicate severe knee arthritis. Clinician evaluation recommended.", color: "text-status-error" };
    if (score <= 29) return { rating: "Moderate-Severe Problems", desc: "Consistent with moderate to severe symptoms.", color: "text-amber-600" };
    if (score <= 39) return { rating: "Mild-Moderate Problems", desc: "Indicates mild to moderate knee symptoms.", color: "text-clinical-teal-hover" };
    return { rating: "Excellent Joint Function", desc: "Knee is functioning extremely well.", color: "text-emerald-600" };
  };

  // Submit Intake Form (Simulates Antigravity agent process & posts to registry API)
  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    setSyncStatus("running");
    setSyncLogs([]);

    const logMessages = [
      "🔄 Initializing Antigravity Clinical Intake Agent...",
      "🔍 Validating Patient Identity & DOB match...",
      `📝 Medical History parsed successfully (${medHistory.slice(0, 30)}...)`,
      `📊 Calculating Oxford Knee Score (Completed: ${oxfordCompletedCount}/12). Total Score: ${totalOxfordScore}/48`,
      signatureType === "draw"
        ? "✍️ Analyzing digital signature stroke sequence..."
        : `✍️ Verifying keyboard signed consent text: "${typedSignature}"`,
      "🔐 Encrypting document vault transmission payload...",
      "⚡ Sending telemetry data payload to Master Excel Registry pipeline...",
    ];

    for (let i = 0; i < logMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSyncLogs(prev => [...prev, logMessages[i]]);
    }

    try {
      // Trigger Next.js API route
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: currentPatient.patientId,
          patientName: currentPatient.name,
          surgery: currentPatient.surgery,
          oxfordScore: `${totalOxfordScore}/48`,
          medications,
          allergies,
          medicalHistory: medHistory,
          consentSigned: consentApproved,
          signatureType: signatureType === "draw" ? "Canvas Draw" : `Typed: ${typedSignature}`,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setSyncLogs(prev => [
          ...prev,
          "💾 Appended data entry to `web/data/intake-registry.csv` successfully.",
          "✨ Background Sync Complete. Clinic record updated!"
        ]);
        setSyncStatus("done");
      } else {
        throw new Error(resData.error || "Registry update rejected.");
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `❌ Error Syncing Registry: ${err.message}`]);
      setSyncStatus("error");
    }
  };

  // Handle Drag & Drop scan files
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
    const files = Array.from(e.dataTransfer.files);
    uploadScanFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      uploadScanFiles(files);
    }
  };

  const uploadScanFiles = (files: File[]) => {
    files.forEach(file => {
      const newFileObj = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "Uploading..."
      };
      setUploadedScans(prev => [...prev, newFileObj]);

      // Simulate network upload
      setTimeout(() => {
        setUploadedScans(prev =>
          prev.map(item =>
            item.name === file.name ? { ...item, status: "Verified & Stored" } : item
          )
        );
      }, 2000);
    });
  };

  // Payments / Stripe Simulator
  const handleStripePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    setPaymentInProgress(true);

    setTimeout(() => {
      setPaymentInProgress(false);
      setPaymentSuccess(true);
      
      // Generate simulated VAT invoice receipt link
      const receiptNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaidReceiptUrl(receiptNo);

      // Reset balance to zero
      setCurrentPatient(prev => prev ? { ...prev, balanceDue: 0 } : null);
    }, 2500);
  };

  const handleInsuranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInsuranceSubmitted(true);
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentPatient(null);
    setExercises([]);
  };

  // Get Recovery Pathway Timelines based on surgical procedure
  const getTimelinePhases = (surgery: string) => {
    if (surgery.includes("Total")) {
      return [
        { label: "Phase 1", name: "Deliberately Lazy & Healing", period: "Days 1 - 14", desc: "Focus on swelling control, incision care, and minimal weight walking.", current: true },
        { label: "Phase 2", name: "Gait & Early Flexion", period: "Weeks 2 - 6", desc: "Ditching walking aids, achieving 90-110 degrees flexion.", current: false },
        { label: "Phase 3", name: "Strength & Balance", period: "Weeks 6 - 12", desc: "Regaining quadriceps bulk and independent stair climbing.", current: false },
        { label: "Phase 4", name: "Advanced Conditioning", period: "Months 3+", desc: "Returning to low impact sport, hiking, and long walks.", current: false }
      ];
    } else if (surgery.includes("ACL")) {
      return [
        { label: "Phase 1", name: "Protect & Activate", period: "Weeks 1 - 2", desc: "Reducing joint effusion and restoring full extension.", current: true },
        { label: "Phase 2", name: "Extension & Gait", period: "Weeks 2 - 6", desc: "Restoring natural walking pattern, progressive load.", current: false },
        { label: "Phase 3", name: "Single-Leg Stability", period: "Weeks 6 - 12", desc: "Proprioception, squats, and running build-up.", current: false },
        { label: "Phase 4", name: "Functional Drills", period: "Months 3 - 6", desc: "Agility work, straight line jogging.", current: false },
        { label: "Phase 5", name: "Return to Sport", period: "Months 6+", desc: "Competitive sports contact clearance.", current: false }
      ];
    } else {
      return [
        { label: "Phase 1", name: "Brace Locked Extension", period: "Weeks 1 - 2", desc: "Brace locked straight, isometric quad squeezes.", current: true },
        { label: "Phase 2", name: "Restricted Bending", period: "Weeks 2 - 6", desc: "Gradual flexion increment (0-90 degrees) in brace.", current: false },
        { label: "Phase 3", name: "Closed Chain Work", period: "Weeks 6 - 12", desc: "Removing brace, active patella tracking stabilizer gym work.", current: false },
        { label: "Phase 4", name: "Full Load Activities", period: "Months 3+", desc: "Advanced loading and agility training.", current: false }
      ];
    }
  };

  // Telehealth Chat Automated Replies
  const handleSendTelehealthMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const patientMsg = {
      sender: "Patient" as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTelehealthChat(prev => [...prev, patientMsg]);
    setChatMessage("");

    // Simulate doctor typing response
    setTimeout(() => {
      const responses = [
        "That sounds perfectly normal at this stage of your recovery. Ensure you keep it elevated.",
        "Your flexion looks excellent. Let's make sure you do the straight leg raises at least three times today.",
        "I've updated your clinic file with today's observations. Keep up the brilliant work!",
        "Yes, you can apply ice for 15 minutes if you feel any mild soreness after doing your heel slides."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      
      setTelehealthChat(prev => [
        ...prev,
        {
          sender: "Doctor" as const,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remain.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 font-sans">
      <Breadcrumbs items={[{ label: "Patient Portal" }]} />

      {!isLoggedIn || !currentPatient ? (
        <div className="mt-6 max-w-lg mx-auto">
          <PageHeader
            category="Patient Portal"
            title="Secure Patient Login"
            subtitle="Access your surgery-specific rehabilitation guide, daily exercises, upcoming reviews, and communicate securely with your care team."
          />

          <div className="bg-white border border-border-clinical p-8 rounded-2xl shadow-md">
            <h2 className="text-xl font-serif font-bold text-deep-navy mb-6">Enter Your Credentials</h2>

            {loginError && (
              <div className="mb-6 p-4 bg-status-error-bg border border-status-error/30 rounded-xl text-status-error text-sm font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-main mb-2">
                  Registered Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. patient@lincsknee.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-2 border border-border-clinical rounded-lg focus:outline-none focus:border-clinical-teal text-text-main bg-white"
                />
              </div>

              <div>
                <label htmlFor="access-code" className="block text-sm font-semibold text-text-main mb-2">
                  Access Password
                </label>
                <input
                  id="access-code"
                  type="password"
                  required
                  placeholder="Enter your clinical portal password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-2 border border-border-clinical rounded-lg focus:outline-none focus:border-clinical-teal text-text-main bg-white"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full justify-center">
                  Sign In to Portal
                </Button>
              </div>
            </form>

            <div className="mt-8 bg-soft-blue border border-clinical-teal/10 rounded-xl p-5 text-sm">
              <span className="font-bold text-deep-navy block mb-2">Testing / Clinical Evaluation Credentials:</span>
              <p className="text-text-secondary text-xs leading-relaxed mb-3">
                To evaluate different surgical and clinical recovery tracks, please use the following mock patient emails (Password for all accounts is <code className="font-bold font-mono">KneeRecovery2026!</code>):
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-white/70 rounded-lg border border-border-clinical/30 text-xs">
                  <div className="font-bold text-deep-navy">1. Total Knee Replacement Pathway (Surgery - Full Access)</div>
                  <div className="mt-1 font-mono text-text-main">patient@lincsknee.com</div>
                </div>
                <div className="p-3 bg-white/70 rounded-lg border border-border-clinical/30 text-xs">
                  <div className="font-bold text-deep-navy">2. ACL Reconstruction Pathway (Surgery - Full Access)</div>
                  <div className="mt-1 font-mono text-text-main">acl@lincsknee.com</div>
                </div>
                <div className="p-3 bg-white/70 rounded-lg border border-border-clinical/30 text-xs">
                  <div className="font-bold text-deep-navy">3. Patellar Stabilisation Pathway (Surgery - Full Access)</div>
                  <div className="mt-1 font-mono text-text-main">patellar@lincsknee.com</div>
                </div>
                <div className="p-3 bg-white/70 rounded-lg border border-border-clinical/30 text-xs">
                  <div className="font-bold text-deep-navy font-serif text-amber-800">4. Initial Consultation Pathway (Consultation Tier)</div>
                  <div className="mt-1 font-mono text-text-main">consultation@lincsknee.com</div>
                </div>
                <div className="p-3 bg-white/70 rounded-lg border border-border-clinical/30 text-xs">
                  <div className="font-bold text-deep-navy font-serif text-teal-800">5. Arthrosamid® Injection Pathway (Injection Tier)</div>
                  <div className="mt-1 font-mono text-text-main">injection@lincsknee.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Dashboard Header Banner */}
          <div className="bg-gradient-to-r from-primary-navy to-deep-navy text-white p-6 md:p-8 rounded-2xl shadow-sm border border-border-clinical/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-clinical-teal font-bold text-xs uppercase tracking-wider block mb-1">
                  Active Patient Record
                </span>
                <h1 className="font-serif text-3xl font-bold !text-white">{currentPatient.name}</h1>
                {currentPatient.accessTier === "Consultation" ? (
                  <p className="text-[#EAF6FA] text-sm mt-1">
                    Status: <strong>Consultation Phase</strong>
                  </p>
                ) : currentPatient.accessTier === "Injection" ? (
                  <p className="text-[#EAF6FA] text-sm mt-1">
                    Procedure: <strong>{currentPatient.surgery}</strong> &bull; {currentPatient.surgeryDate}
                  </p>
                ) : (
                  <p className="text-[#EAF6FA] text-sm mt-1">
                    Surgery: <strong>{currentPatient.surgery}</strong> &bull; {currentPatient.surgeryDate} ({currentPatient.daysPostOp} days post-op)
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="bg-white/10 px-4 py-2 rounded-lg text-xs border border-white/10 text-center">
                  <span className="block text-[#EAF6FA]/70">Patient ID</span>
                  <span className="font-mono font-bold text-white text-sm">{currentPatient.patientId}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="min-h-[48px] px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-white font-semibold text-sm cursor-pointer text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border-clinical flex flex-wrap gap-2">
            {[
              { id: "overview" as const, label: "Overview & Timeline", icon: "📋" },
              { id: "appointments" as const, label: "Schedule & Telehealth", icon: "📅" },
              { id: "intake" as const, label: "Digital Intake & Consents", icon: "✍️" },
              { id: "recovery" as const, label: "Recovery Companion", icon: "🏃‍♂️" },
              { id: "billing" as const, label: "Billing & Vault", icon: "💳" }
            ].filter((tab) => {
              if (currentPatient.accessTier === "Consultation") {
                return tab.id !== "overview" && tab.id !== "recovery";
              }
              if (currentPatient.accessTier === "Injection") {
                return tab.id !== "overview";
              }
              return true;
            }).map((tab) => {
              const label = tab.id === "recovery" && currentPatient.accessTier === "Injection"
                ? "Injection Care Pathway"
                : tab.label;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-clinical-teal text-clinical-teal bg-pale-clinical-blue"
                      : "border-transparent text-text-secondary hover:text-text-main hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Care Pathways */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Visual Roadmap */}
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-serif font-bold text-deep-navy">Your Post-Op Care Pathway</h2>
                    <p className="text-text-secondary text-sm">Dynamic pathway roadmap tailored for your recovery progress.</p>
                  </div>

                  <div className="relative border-l border-border-clinical pl-6 ml-3 space-y-8 py-2">
                    {getTimelinePhases(currentPatient.surgery).map((phase, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                          phase.current 
                            ? "bg-clinical-teal border-clinical-teal scale-125 ring-4 ring-clinical-teal/20" 
                            : "bg-white border-border-clinical"
                        }`} />
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs font-bold text-clinical-teal uppercase tracking-wide block">
                              {phase.label} &bull; {phase.period}
                            </span>
                            <span className="font-bold text-text-main text-base block mt-0.5">{phase.name}</span>
                            <p className="text-text-secondary text-sm mt-1 leading-relaxed">{phase.desc}</p>
                          </div>
                          {phase.current && (
                            <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-clinical-teal text-xs font-bold whitespace-nowrap animate-pulse border border-clinical-teal/20">
                              Current Phase
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-Appointment Guidance Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
                  <div className="text-2xl select-none">💡</div>
                  <div>
                    <h4 className="text-deep-navy font-bold text-base mb-1">Pre-Appointment Clinical Reminders</h4>
                    <p className="text-text-main text-sm leading-relaxed">
                      For your upcoming physical assessment, please remember to <strong>wear loose clothing or shorts</strong> to facilitate knee examination, clinical flexion measurement, and dressing updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar: Checklist & Support */}
              <div className="space-y-6">
                <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-deep-navy mb-3">Recovery Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-pale-clinical-blue p-4 rounded-xl border border-border-clinical/40">
                      <span className="text-xs font-bold text-text-secondary uppercase">Surgeon</span>
                      <p className="text-sm font-bold text-text-main">{currentPatient.surgeon}</p>
                    </div>

                    <div className="bg-pale-clinical-blue p-4 rounded-xl border border-border-clinical/40">
                      <span className="text-xs font-bold text-text-secondary uppercase">Surgery Date</span>
                      <p className="text-sm font-bold text-text-main">{currentPatient.surgeryDate}</p>
                    </div>

                    <div className="bg-pale-clinical-blue p-4 rounded-xl border border-border-clinical/40">
                      <span className="text-xs font-bold text-text-secondary uppercase">Recovery Milestone</span>
                      <p className="text-sm font-bold text-text-main">{currentPatient.daysPostOp} Days Post-Op</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-soft-blue to-white border border-clinical-teal/20 p-6 rounded-2xl shadow-sm text-center">
                  <span className="text-3xl block mb-2">📞</span>
                  <h4 className="font-serif text-base font-bold text-deep-navy">Need Immediate Support?</h4>
                  <p className="text-xs text-text-secondary mt-1 mb-4 leading-relaxed">
                    Have questions about sudden changes, severe pain spikes, or wound redness?
                  </p>
                  <Button variant="teal" href="/contact" className="w-full text-xs min-h-[40px]">
                    View Urgent Contact Channels
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Appointments & Telehealth */}
          {activeTab === "appointments" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Scheduled Appointments & Live Rescheduling */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Appointments */}
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-deep-navy">Upcoming Appointments</h2>
                      <p className="text-text-secondary text-sm">Self-manage your clinic reviews and telehealth gateway.</p>
                    </div>
                    {!showScheduler && (
                      <button
                        onClick={() => {
                          setReschedulingId(null);
                          setShowScheduler(true);
                        }}
                        className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        + Book New
                      </button>
                    )}
                  </div>

                  {showScheduler && (
                    <form onSubmit={handleScheduleAppointment} className="mb-6 p-5 bg-pale-clinical-blue border border-border-clinical rounded-xl space-y-4">
                      <h4 className="font-bold text-sm text-deep-navy">
                        {reschedulingId ? "Reschedule Appointment" : "Request Appointment"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!reschedulingId && (
                          <div>
                            <label className="block text-xs font-semibold text-text-main mb-1">Appointment Type</label>
                            <select
                              value={bookingType}
                              onChange={(e) => setBookingType(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-border-clinical rounded-lg text-xs"
                            >
                              <option value="Consultant Follow-Up">Consultant Follow-Up Review</option>
                              <option value="Wound & Clip Check">Wound & Clip Check</option>
                              <option value="Physiotherapy Assessment">Physiotherapy Assessment</option>
                              <option value="Injection Review">Injection Review</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-text-main mb-1">Clinic Site</label>
                          <select
                            value={bookingLocation}
                            onChange={(e) => setBookingLocation(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border-clinical rounded-lg text-xs"
                          >
                            <option value="Lincoln Private Hospital, Lincoln">Lincoln Private Hospital</option>
                            <option value="St Hugh's Hospital, Grimsby">St Hugh's Hospital, Grimsby</option>
                            <option value="Parkhill Hospital, Doncaster">Parkhill Hospital, Doncaster</option>
                            <option value="Inspire Health, Chesterfield">Inspire Health, Chesterfield</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-main mb-1">Preferred Date</label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border-clinical rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-main mb-1">Time Slot</label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border-clinical rounded-lg text-xs"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="09:30 AM">09:30 AM</option>
                            <option value="10:30 AM">10:30 AM</option>
                            <option value="11:15 AM">11:15 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="03:30 PM">03:30 PM</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowScheduler(false);
                            setReschedulingId(null);
                          }}
                          className="px-3 py-1.5 border border-border-clinical rounded text-xs font-semibold text-text-secondary cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-primary-navy hover:bg-deep-navy text-white text-xs font-bold rounded cursor-pointer"
                        >
                          Confirm Schedule
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div key={appt.id} className="p-5 border border-border-clinical rounded-xl hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-clinical-teal font-bold text-xs">
                              {appt.title}
                            </span>
                            <span className="text-xs text-text-secondary">{appt.practitioner}</span>
                          </div>
                          <span className="block text-text-main font-bold text-sm">
                            {new Date(appt.date).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {appt.time}
                          </span>
                          <span className="text-xs text-text-secondary block">📍 {appt.location}</span>
                          <p className="text-xs text-text-muted mt-1 bg-amber-50/50 p-2 rounded border border-amber-100">
                            📝 <strong>Instructions:</strong> {appt.instructions}
                          </p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                          <button
                            onClick={() => {
                              setReschedulingId(appt.id);
                              setBookingDate(appt.date);
                              setBookingTime(appt.time);
                              setBookingLocation(appt.location);
                              setShowScheduler(true);
                            }}
                            className="flex-1 md:flex-none px-3.5 py-2 border border-border-clinical hover:bg-slate-50 text-xs font-semibold text-deep-navy rounded-lg cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setShowTelehealth(true);
                              setTelehealthState("idle");
                            }}
                            className="flex-1 md:flex-none px-3.5 py-2 bg-[#00AFC8] hover:bg-[#0891B2] text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Join Telehealth
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video consultation window */}
              <div className="space-y-6">
                <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-deep-navy mb-2">Telehealth Gateway</h3>
                  <p className="text-text-secondary text-xs leading-relaxed mb-4">
                    Join video consultations via Microsoft Teams and Google Meet pipelines inside the browser.
                  </p>
                  <Button
                    variant="teal"
                    onClick={() => {
                      setShowTelehealth(true);
                      setTelehealthState("connecting");
                      setTimeout(() => {
                        setTelehealthState("active");
                        setTelehealthChat([
                          { sender: "Doctor", text: "Hello! Welcome to your digital review. How is your knee feeling today?", time: "12:00 PM" }
                        ]);
                      }, 2000);
                    }}
                    className="w-full text-xs"
                  >
                    🚀 Start Video Consult
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Telehealth Overlay Simulator */}
          {showTelehealth && (
            <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#111827] text-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row h-[85vh]">
                {/* Video Streams Container */}
                <div className="flex-1 relative bg-black flex items-center justify-center h-2/3 md:h-full">
                  {telehealthState === "connecting" && (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-clinical-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-[#EAF6FA] text-sm font-semibold">Connecting to Enterprise Clinical Pipeline...</p>
                    </div>
                  )}

                  {telehealthState === "active" && (
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      {/* Clinical Doctor Stream */}
                      <div className="absolute inset-0 bg-[#1E293B] flex items-center justify-center">
                        {/* Simulated Clinician Image */}
                        <div className="text-center z-10">
                          <div className="w-24 h-24 rounded-full bg-clinical-teal/20 border-2 border-clinical-teal flex items-center justify-center text-4xl mx-auto mb-3 font-serif">SR</div>
                          <h4 className="font-bold text-lg">{currentPatient?.surgeon}</h4>
                          <span className="text-xs text-[#00AFC8] px-2 py-0.5 rounded-full bg-clinical-teal/10 border border-clinical-teal/20">Active Clinician Feed</span>
                        </div>
                        {/* Interactive sound bar indicators */}
                        <div className="absolute bottom-4 left-4 flex gap-1 items-end h-8">
                          {[0.7, 0.4, 0.9, 0.2, 0.5, 0.8, 0.3].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-[#00AFC8] rounded-full animate-pulse"
                              style={{ height: `${h * 100}%`, animationDelay: `${i * 150}ms` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Small Local Patient Stream */}
                      <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg border border-white/20 overflow-hidden shadow-lg z-20">
                        {telehealthVideo ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs">
                            Camera Off
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white">You</span>
                      </div>

                      {/* Top Overlay controls */}
                      <div className="z-10 flex justify-between items-center w-full">
                        <span className="px-2.5 py-1 bg-red-600 rounded text-xs font-mono tracking-widest animate-pulse">● LIVE</span>
                        <span className="px-2.5 py-1 bg-white/10 rounded text-xs font-mono">{formatDuration(telehealthDuration)}</span>
                      </div>

                      {/* Bottom Control Bar */}
                      <div className="z-10 w-full flex justify-center gap-3 mt-auto">
                        <button
                          onClick={() => setTelehealthMic(!telehealthMic)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center border text-lg transition-all cursor-pointer ${
                            telehealthMic ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-red-600 border-red-500 hover:bg-red-700"
                          }`}
                          title="Toggle Mic"
                        >
                          {telehealthMic ? "🎤" : "🔇"}
                        </button>
                        <button
                          onClick={() => setTelehealthVideo(!telehealthVideo)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center border text-lg transition-all cursor-pointer ${
                            telehealthVideo ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-red-600 border-red-500 hover:bg-red-700"
                          }`}
                          title="Toggle Camera"
                        >
                          {telehealthVideo ? "📷" : "🚫"}
                        </button>
                        <button
                          onClick={() => {
                            setTelehealthState("ended");
                          }}
                          className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 border-red-500 hover:bg-red-700 text-lg cursor-pointer"
                          title="Leave Call"
                        >
                          📞
                        </button>
                      </div>
                    </div>
                  )}

                  {telehealthState === "ended" && (
                    <div className="text-center space-y-4">
                      <span className="text-3xl">✅</span>
                      <h4 className="font-bold text-lg">Consultation Completed Successfully</h4>
                      <p className="text-xs text-text-secondary max-w-xs mx-auto">
                        Your post-op checklist has been updated. If you requested medication updates, they will sync soon.
                      </p>
                      <button
                        onClick={() => setShowTelehealth(false)}
                        className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Call Sidebar Chat */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-1/3 md:h-full bg-[#1F2937]">
                  <div className="p-3 border-b border-white/10 bg-[#111827]">
                    <h4 className="font-bold text-xs tracking-wider text-text-secondary uppercase">Consultation Chat Log</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {telehealthChat.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === "Patient" 
                          ? "bg-clinical-teal text-white ml-auto" 
                          : "bg-white/10 text-white mr-auto"
                      }`}>
                        <span className="font-bold text-[10px] block opacity-70 mb-0.5">{msg.sender} &bull; {msg.time}</span>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendTelehealthMessage} className="p-3 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-clinical-teal"
                    />
                    <button type="submit" className="px-3 bg-clinical-teal text-white rounded text-xs font-bold cursor-pointer">Send</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Digital Intake & Consents */}
          {activeTab === "intake" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Intake & Form Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-serif font-bold text-deep-navy">Digital Intake & Pre-Op Questionnaire</h2>
                    <p className="text-text-secondary text-sm">Please complete your baseline medical records and Oxford Knee Score metrics.</p>
                  </div>

                  <form onSubmit={handleSubmitIntake} className="space-y-6">
                    {/* Medical Baseline History */}
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-deep-navy border-b border-border-clinical pb-2">Medical History & Baseline</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-main mb-1">Current Medications</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Paracetamol 500mg, Ibuprofen as needed"
                            value={medications}
                            onChange={(e) => setMedications(e.target.value)}
                            className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-main mb-1">Known Allergies</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Penicillin, Latex, None"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-text-main mb-1">Past Operations & Clinical Medical History</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Please list any major past surgeries, conditions, or joint issues..."
                            value={medHistory}
                            onChange={(e) => setMedHistory(e.target.value)}
                            className="w-full p-3 border border-border-clinical rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Oxford Knee Score Assessment */}
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center border-b border-border-clinical pb-2">
                        <h3 className="text-base font-bold text-deep-navy">Oxford Knee Score Questionnaire</h3>
                        <span className="text-xs font-bold text-clinical-teal bg-soft-blue px-2.5 py-0.5 rounded-full">
                          Score: {totalOxfordScore} / 48
                        </span>
                      </div>
                      <div className="space-y-5">
                        {oxfordQuestions.map((q) => (
                          <div key={q.id} className="p-4 bg-pale-clinical-blue/50 rounded-xl border border-border-clinical/40">
                            <span className="text-xs font-bold text-text-secondary block mb-2">Question {q.id}</span>
                            <span className="font-semibold text-sm text-text-main block mb-3">{q.question}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {q.options.map((opt, idx) => (
                                <label
                                  key={idx}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                    oxfordScores[q.id] === opt.score
                                      ? "bg-clinical-teal/10 border-[#00AFC8] text-[#00AFC8] font-bold"
                                      : "bg-white border-border-clinical/60 hover:bg-slate-50 text-text-secondary"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt.score}
                                    checked={oxfordScores[q.id] === opt.score}
                                    onChange={() => setOxfordScores(prev => ({ ...prev, [q.id]: opt.score }))}
                                    className="sr-only"
                                  />
                                  {opt.text}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signature block */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-base font-bold text-deep-navy border-b border-border-clinical pb-2">E-Sign Procedure Consent</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        I hereby consent to surgical evaluation, post-operative data registry storage, and diagnostic reviews.
                      </p>

                      <div className="flex gap-4 border-b border-border-clinical pb-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSignatureType("draw")}
                          className={`pb-2 font-bold border-b-2 transition-all cursor-pointer ${
                            signatureType === "draw" ? "border-clinical-teal text-clinical-teal" : "border-transparent text-text-secondary"
                          }`}
                        >
                          Draw Signature
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureType("type")}
                          className={`pb-2 font-bold border-b-2 transition-all cursor-pointer ${
                            signatureType === "type" ? "border-clinical-teal text-clinical-teal" : "border-transparent text-text-secondary"
                          }`}
                        >
                          Type Signature
                        </button>
                      </div>

                      {signatureType === "draw" ? (
                        <div className="space-y-2">
                          <canvas
                            ref={sigCanvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            width={500}
                            height={150}
                            className="bg-slate-50 border border-dashed border-border-clinical rounded-lg w-full max-w-lg cursor-crosshair h-[150px]"
                          />
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            Clear Pad
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Type full legal name to e-sign..."
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          className="w-full max-w-lg px-4 py-2 bg-slate-50 border border-border-clinical rounded-lg text-sm font-serif italic"
                        />
                      )}

                      <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={consentApproved}
                          onChange={(e) => setConsentApproved(e.target.checked)}
                          className="w-4 h-4 accent-clinical-teal"
                        />
                        I certify that this digital signature constitutes my binding approval.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="teal"
                      disabled={!consentApproved || oxfordCompletedCount < 12 || syncStatus === "running"}
                      className="w-full justify-center"
                    >
                      {syncStatus === "running" ? "Syncing Registry..." : "E-Sign & Submit Intake Form"}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Sync Agent Logs & Dashboard */}
              <div className="space-y-6">
                {syncStatus === "done" ? (
                  <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm h-[450px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 border-b border-border-clinical/60 pb-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                          ✓
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-deep-navy text-sm md:text-base">Intake Assessment Sync</h3>
                          <p className="text-[10px] text-text-secondary">Logged in Patient Registry</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Oxford Score Metric */}
                        <div className="bg-pale-clinical-blue/20 p-3 rounded-xl border border-border-clinical/30 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-text-secondary block font-semibold">Oxford Knee Score</span>
                            <span className={`text-sm font-bold ${getOxfordScoreAssessment(totalOxfordScore).color}`}>
                              {getOxfordScoreAssessment(totalOxfordScore).rating}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-deep-navy">{totalOxfordScore}</span>
                            <span className="text-xs text-text-secondary font-semibold">/48</span>
                          </div>
                        </div>

                        {/* Surgery Details */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="border border-border-clinical/30 p-2.5 rounded-xl bg-slate-50/50">
                            <span className="text-text-secondary block font-semibold mb-0.5">Assigned Pathway</span>
                            <span className="font-bold text-deep-navy truncate block">{currentPatient.surgery || "Standard Orthopedics"}</span>
                          </div>
                          <div className="border border-border-clinical/30 p-2.5 rounded-xl bg-slate-50/50">
                            <span className="text-text-secondary block font-semibold mb-0.5">Consent Verification</span>
                            <span className="font-bold text-emerald-600 block">E-Signed & Approved</span>
                          </div>
                        </div>

                        {/* Medical Summary Details */}
                        <div className="text-xs space-y-1.5 border-t border-border-clinical/40 pt-3">
                          {medHistory && (
                            <div className="flex justify-between gap-4">
                              <span className="text-text-secondary font-semibold">History:</span>
                              <span className="text-deep-navy font-bold truncate max-w-[200px]">{medHistory}</span>
                            </div>
                          )}
                          {medications && (
                            <div className="flex justify-between gap-4">
                              <span className="text-text-secondary font-semibold">Medications:</span>
                              <span className="text-deep-navy font-bold truncate max-w-[200px]">{medications}</span>
                            </div>
                          )}
                          {allergies && (
                            <div className="flex justify-between gap-4">
                              <span className="text-text-secondary font-semibold">Allergies:</span>
                              <span className="text-status-error font-bold truncate max-w-[200px]">{allergies}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setActiveTab("recovery")}
                      className="w-full justify-center mt-2"
                      variant="primary"
                    >
                      Access Recovery Companion
                    </Button>
                  </div>
                ) : (
                  <div className="bg-[#0B132B] border border-slate-800 text-emerald-400 p-5 rounded-2xl shadow-lg font-mono text-xs h-[450px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-4">
                        <span>ANTIGRAVITY SYNC AGENT</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-300">Live Status</span>
                      </div>

                      <div className="space-y-2 overflow-y-auto max-h-[340px]">
                        {syncStatus === "idle" && (
                          <span className="text-slate-500">Awaiting digital intake submission to trigger registry sync...</span>
                        )}
                        {syncLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed animate-fade-in">{log}</div>
                        ))}
                      </div>
                    </div>

                    {syncStatus === "running" && (
                      <div className="text-center bg-clinical-teal/10 border border-clinical-teal/20 py-2 rounded text-clinical-teal text-xs animate-pulse">
                        🔄 Syncing in progress...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Recovery Companion */}
          {activeTab === "recovery" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Physiotherapy Video Player & Exercise list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-deep-navy mb-1">Physiotherapy Video Library</h2>
                  <p className="text-text-secondary text-sm mb-6">Interactive demonstrations of rehab exercises specific to your knee surgery.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List of exercises */}
                    <div className="space-y-3">
                      {exercises.map((ex) => (
                        <div
                          key={ex.id}
                          onClick={() => {
                            setSelectedExercise(ex);
                            setVideoPlaying(false);
                            setVideoProgress(0);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            selectedExercise?.id === ex.id
                              ? "bg-soft-blue border-clinical-teal/40 shadow-sm"
                              : "bg-white border-border-clinical hover:border-clinical-teal/30"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm text-text-main">{ex.name}</span>
                            <span className="text-xs">{ex.completed ? "✅" : "⬜"}</span>
                          </div>
                          <p className="text-text-secondary text-[11px] mt-1 line-clamp-2 leading-relaxed">{ex.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Media simulator window */}
                    <div className="md:col-span-2 space-y-4">
                      {selectedExercise && (
                        <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-inner flex flex-col justify-between h-[300px] text-white p-4 relative border border-slate-800">
                          {/* Top video title */}
                          <div className="flex justify-between items-center z-10">
                            <span className="text-xs font-bold tracking-wider text-clinical-teal bg-clinical-teal/10 px-2 py-0.5 rounded uppercase border border-clinical-teal/20">
                              {currentPatient.surgery} Demo
                            </span>
                            <span className="text-xs text-slate-400 font-mono">1080p Stream</span>
                          </div>

                          {/* Center playback area with real YouTube player or animated knee diagram */}
                          <div className="flex flex-col items-center justify-center flex-1 my-4 h-[160px] relative w-full overflow-hidden">
                            {videoPlaying ? (
                              selectedExercise.videoUrl ? (
                                <iframe
                                  className="absolute inset-0 w-full h-full rounded-lg"
                                  src={`${selectedExercise.videoUrl}?autoplay=1&mute=1&enablejsapi=1`}
                                  title={selectedExercise.name}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <div className="text-center space-y-4 w-full px-8">
                                  {/* SVG Knee flexion animation */}
                                  <svg width="80" height="80" className="mx-auto text-clinical-teal fill-none stroke-current" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" className="stroke-slate-800" strokeWidth="3" />
                                    <line x1="50" y1="50" x2="50" y2="15" strokeWidth="4" strokeLinecap="round" />
                                    <line
                                      x1="50"
                                      y1="50"
                                      x2="85"
                                      y2="50"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      className="origin-[50px_50px] transition-transform duration-1000"
                                      style={{ transform: `rotate(${(Math.sin(videoProgress * 0.1) * 35 + 30).toFixed(0)}deg)` }}
                                    />
                                  </svg>
                                  <p className="text-[10px] text-clinical-teal font-mono">Performing {selectedExercise.name} (Simulated video loop)</p>
                                </div>
                              )
                            ) : (
                              <button
                                onClick={() => setVideoPlaying(true)}
                                className="w-16 h-16 rounded-full bg-clinical-teal hover:bg-clinical-teal-hover hover:scale-105 transition-all flex items-center justify-center text-white text-2xl shadow-lg cursor-pointer z-10"
                              >
                                ▶
                              </button>
                            )}
                          </div>

                          {/* Control panel and progress bar */}
                          <div className="space-y-2 z-10">
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>{videoPlaying ? "Video Streaming..." : "Playback Paused"}</span>
                              <span>{videoProgress}% completed</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#00AFC8] h-full transition-all duration-150"
                                style={{ width: `${videoProgress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setVideoPlaying(!videoPlaying)}
                                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white cursor-pointer"
                                >
                                  {videoPlaying ? "Pause" : "Play"}
                                </button>
                                <button
                                  onClick={() => setVideoProgress(0)}
                                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white cursor-pointer"
                                >
                                  Restart
                                </button>
                              </div>
                              <button
                                onClick={() => toggleExercise(selectedExercise.id)}
                                className={`text-xs px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                                  selectedExercise.completed
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    : "bg-clinical-teal hover:bg-clinical-teal-hover text-white"
                                }`}
                              >
                                {selectedExercise.completed ? "✓ Done" : "Mark Done"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video Tips */}
                      {selectedExercise && selectedExercise.videoTips && (
                        <div className="p-4 bg-pale-clinical-blue border border-border-clinical/60 rounded-xl space-y-2">
                          <h4 className="font-bold text-xs text-deep-navy uppercase tracking-wider">Clinician Guidelines:</h4>
                          <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1">
                            {selectedExercise.videoTips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Care Guides */}
              <div className="space-y-6">
                <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-deep-navy mb-4">On-Demand Care Templates</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setViewingDoc({ title: "2-Day Post-Op Cryotherapy & Elevation Plan", filename: "2day-care.pdf", date: "11/07/2026", type: "Guide" })}
                      className="w-full text-left p-3.5 bg-pale-clinical-blue hover:bg-soft-blue/40 border border-border-clinical/40 rounded-xl flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-xs text-deep-navy block">2-Day Core Instructions</span>
                        <span className="text-[10px] text-text-secondary block">Immediate swelling reduction</span>
                      </div>
                      <span className="text-clinical-teal text-sm font-bold">→</span>
                    </button>

                    <button
                      onClick={() => setViewingDoc({ title: "7-Day Progressive Knee Bending Protocol", filename: "7day-care.pdf", date: "11/07/2026", type: "Guide" })}
                      className="w-full text-left p-3.5 bg-pale-clinical-blue hover:bg-soft-blue/40 border border-border-clinical/40 rounded-xl flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-xs text-deep-navy block">7-Day Care Template</span>
                        <span className="text-[10px] text-text-secondary block">Early extension and mobility</span>
                      </div>
                      <span className="text-clinical-teal text-sm font-bold">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Document Vault & Payments */}
          {activeTab === "billing" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Document vault and file dropbox */}
              <div className="lg:col-span-2 space-y-6">
                {/* PDF clinical letters and diagnostic script orders */}
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-deep-navy mb-1">Secure Document Vault</h2>
                  <p className="text-text-secondary text-sm mb-6">Download clinical summary summaries, discharge notes, and MRI scripts.</p>

                  <div className="space-y-3">
                    {currentPatient.documents.map((doc, idx) => (
                      <div key={idx} className="p-4 bg-pale-clinical-blue/50 border border-border-clinical/40 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl select-none">{doc.type === "Letter" ? "📄" : "🔬"}</span>
                          <div>
                            <span className="font-bold text-xs text-text-muted uppercase tracking-wider block">{doc.type}</span>
                            <span className="font-semibold text-sm text-text-main block">{doc.title}</span>
                            <span className="text-[10px] text-text-secondary block">Issued &bull; {doc.date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="px-4 py-2 bg-primary-navy hover:bg-deep-navy text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          View Document
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure image scan dropbox */}
                <div className="bg-white border border-border-clinical p-6 md:p-8 rounded-2xl shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-deep-navy mb-1">External Imaging Dropbox</h2>
                  <p className="text-text-secondary text-sm mb-6">Securely upload external X-Ray or MRI scan files (DICOM, JPEG, PDF) before consultation.</p>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      isDragging 
                        ? "border-clinical-teal bg-soft-blue/30" 
                        : "border-border-clinical bg-pale-clinical-blue/30 hover:border-clinical-teal/40"
                    }`}
                  >
                    <span className="text-4xl block mb-2 select-none">📤</span>
                    <h4 className="font-bold text-sm text-deep-navy mb-1">Drag and drop imaging files here</h4>
                    <p className="text-xs text-text-secondary max-w-xs mx-auto mb-4 leading-relaxed">
                      Supports high-resolution scan reports up to 10MB per file.
                    </p>
                    <label className="inline-block px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-lg cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {uploadedScans.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <h4 className="font-bold text-xs text-deep-navy uppercase tracking-wider">Uploaded Scans Queue</h4>
                      <div className="space-y-2">
                        {uploadedScans.map((scan, idx) => (
                          <div key={idx} className="p-3 bg-pale-clinical-blue border border-border-clinical/40 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-semibold text-text-main">{scan.name} ({scan.size})</span>
                            <span className={`font-bold ${scan.status === "Verified & Stored" ? "text-emerald-600" : "text-clinical-teal animate-pulse"}`}>
                              {scan.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stripe Payment portal simulator */}
              <div className="space-y-6">
                {/* Settle outstanding balances */}
                <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-deep-navy mb-1">Self-Pay Payments</h3>
                  <p className="text-xs text-text-secondary mb-4 leading-relaxed">Secure, one-click settlement of surgical consultation or injection fees.</p>

                  <div className="mb-6 p-4 bg-pale-clinical-blue border border-border-clinical rounded-xl text-center">
                    <span className="text-xs font-semibold text-text-secondary uppercase">Outstanding Balance Due</span>
                    <span className="block text-2xl font-bold text-deep-navy mt-1">
                      £{currentPatient.balanceDue.toFixed(2)}
                    </span>
                  </div>

                  {currentPatient.balanceDue > 0 ? (
                    <div>
                      {paymentSuccess ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                          <span className="text-2xl block">🎉</span>
                          <span className="font-bold text-sm text-emerald-800 block">Payment Cleared Successfully</span>
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                          >
                            Print Receipt ({paidReceiptUrl})
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleStripePayment} className="space-y-4">
                          <button
                            type="button"
                            onClick={() => {
                              setStripeCardNumber("4242 •••• •••• 4242");
                              setStripeExpiry("12/28");
                              setStripeCvc("992");
                            }}
                            className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                          >
                             Pay with Apple Pay
                          </button>

                          <div className="relative text-center my-3">
                            <span className="absolute inset-x-0 top-1/2 border-b border-border-clinical -translate-y-1/2"></span>
                            <span className="relative bg-white px-3 text-[10px] text-text-secondary uppercase tracking-wider">Or Pay with Card</span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-text-main mb-1">Card Number</label>
                              <input
                                type="text"
                                required
                                placeholder="4242 4242 4242 4242"
                                value={stripeCardNumber}
                                onChange={(e) => setStripeCardNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-text-main mb-1">Expiry Date</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="MM/YY"
                                  value={stripeExpiry}
                                  onChange={(e) => setStripeExpiry(e.target.value)}
                                  className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-text-main mb-1">CVC Code</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="123"
                                  value={stripeCvc}
                                  onChange={(e) => setStripeCvc(e.target.value)}
                                  className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            variant="teal"
                            disabled={paymentInProgress}
                            className="w-full justify-center text-xs"
                          >
                            {paymentInProgress ? "Verifying Transaction..." : `Pay £${currentPatient.balanceDue.toFixed(2)} Now`}
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1 text-emerald-800 text-xs">
                      <span className="font-bold block">No Balance Outstanding</span>
                      <p className="text-[11px] opacity-80">All clinic treatments have been settled.</p>
                      {paidReceiptUrl && (
                        <button
                          onClick={() => window.print()}
                          className="mt-2 text-xs font-bold underline text-emerald-950 block mx-auto cursor-pointer"
                        >
                          Print Last Receipt ({paidReceiptUrl})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Insurance claims number tracking */}
                <div className="bg-white border border-border-clinical p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-deep-navy mb-1">Insurance Tracker</h3>
                  <p className="text-xs text-text-secondary mb-4 leading-relaxed">Provide your pre-authorisation code for direct billing to health insurance.</p>

                  {insuranceSubmitted ? (
                    <div className="p-4 bg-pale-clinical-blue border border-border-clinical/60 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Provider:</span>
                        <span className="font-bold text-text-main">{insuranceProvider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Pre-Auth Reference:</span>
                        <span className="font-mono font-bold text-text-main">{insurancePreAuth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Claim Status:</span>
                        <span className="font-bold text-emerald-600">Approved for Billing</span>
                      </div>
                      <button
                        onClick={() => setInsuranceSubmitted(false)}
                        className="text-[11px] text-clinical-teal font-bold hover:underline cursor-pointer block pt-1"
                      >
                        Update details
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleInsuranceSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-main mb-1">Insurance Provider</label>
                        <select
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-border-clinical rounded-lg text-xs"
                        >
                          <option value="Bupa">Bupa</option>
                          <option value="AXA Health">AXA Health</option>
                          <option value="WPA">WPA</option>
                          <option value="Aviva">Aviva</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-main mb-1">Pre-Authorisation Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BI-10294-A"
                          value={insurancePreAuth}
                          onChange={(e) => setInsurancePreAuth(e.target.value)}
                          className="w-full px-3 py-2 border border-border-clinical rounded-lg text-xs"
                        />
                      </div>
                      <Button type="submit" variant="primary" className="w-full text-xs min-h-[40px]">
                        Save Insurance Code
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Viewer Modal */}
          {viewingDoc && (
            <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl border border-border-clinical flex flex-col h-[75vh]">
                <div className="bg-primary-navy text-white p-4 flex justify-between items-center">
                  <h4 className="font-bold text-sm truncate">{viewingDoc.title}</h4>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="text-white hover:text-slate-200 text-lg font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Simulated Doc Content */}
                <div className="flex-1 overflow-y-auto p-8 font-serif text-sm text-text-main space-y-6 bg-[#FCFBF9] selection:bg-clinical-teal/20">
                  <div className="text-center space-y-1">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-clinical-teal">Lincolnshire Knee Clinic</span>
                    <h2 className="text-xl font-bold text-deep-navy">CLINICAL LETTER / SUMMARY REPORT</h2>
                    <p className="font-sans text-[10px] text-text-secondary">Consultant Orthopaedic Surgeon &bull; Mr. S. R. Kempshall</p>
                  </div>

                  <hr className="border-border-clinical" />

                  <div className="grid grid-cols-2 gap-4 font-sans text-xs text-text-secondary">
                    <div>
                      <strong>Patient Name:</strong> {currentPatient.name}<br />
                      <strong>DOB:</strong> {currentPatient.dob}<br />
                      <strong>ID:</strong> {currentPatient.patientId}
                    </div>
                    <div className="text-right">
                      <strong>Date:</strong> {viewingDoc.date}<br />
                      <strong>Surgery:</strong> {currentPatient.surgery}<br />
                      <strong>Referral Partner:</strong> Alliance Medical Joint Venture
                    </div>
                  </div>

                  <hr className="border-border-clinical" />

                  {viewingDoc.type === "Letter" && (
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Dear Colleague,
                      </p>
                      <p className="leading-relaxed">
                        I had the pleasure of reviewing this patient following their recent procedure of <strong>{currentPatient.surgery}</strong>. 
                        The surgical incisions are healing appropriately without evidence of local erythema or active drainage. Clips remain secure and are scheduled for removal at the 14-day mark.
                      </p>
                      <p className="leading-relaxed">
                        Active range of motion shows satisfactory extension and early flexion progress. Pain control is currently managed through standard paracetamol and ice pack applications. 
                        I have cleared the patient for progressive weight-bearing exercises as supervised by our clinic physiotherapy team.
                      </p>
                      <p className="leading-relaxed font-sans text-xs italic text-text-secondary mt-8">
                        Digitally signed and validated by: Mr. S. R. Kempshall, FRCS (Tr & Orth)
                      </p>
                    </div>
                  )}

                  {viewingDoc.type === "Order" && (
                    <div className="space-y-4">
                      <p className="leading-relaxed font-bold">
                        DIAGNOSTIC IMAGING ORDER & CLINICAL PROTOCOL REFERRAL
                      </p>
                      <p className="leading-relaxed">
                        Please perform the following examination:
                      </p>
                      <div className="bg-pale-clinical-blue p-4 rounded-lg border border-border-clinical/60 font-sans text-xs text-text-main space-y-1">
                        <div><strong>Investigation Required:</strong> High-Resolution Sagittal & Coronal MRI (Left/Right Knee)</div>
                        <div><strong>Clinical Indications:</strong> Post-operative tracking, graft tension assessment, meniscus check</div>
                        <div><strong>Urgency:</strong> Routine post-op followup</div>
                      </div>
                      <p className="leading-relaxed">
                        Send DICOM images and radiologist reports directly to the Lincolnshire Knee Clinic administration portal upon verification.
                      </p>
                      <p className="leading-relaxed font-sans text-xs italic text-text-secondary mt-8">
                        Authorized signature block code: LKC-MRI-MD-REF2901
                      </p>
                    </div>
                  )}

                  {viewingDoc.type === "Guide" && (
                    <div className="space-y-4 font-sans">
                      <p className="leading-relaxed font-bold font-serif text-base text-deep-navy">
                        Rehabilitation and Care Pathways Protocols
                      </p>
                      <p className="leading-relaxed text-xs">
                        This clinical guide outlines the primary criteria to ensure safety and speed recovery milestones.
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-xs text-text-secondary">
                        <li><strong>Cryotherapy Cycle:</strong> Apply ice wrapped in damp cloth for 15 minutes, 4-6 times daily.</li>
                        <li><strong>Elevation:</strong> Ensure your foot is elevated above your heart level on pillows.</li>
                        <li><strong>Incision Care:</strong> Keep your dressing dry. Do not soak the leg in water.</li>
                        <li><strong>Exercises:</strong> Complete the daily checklist 3 times daily as shown in the Recovery Companion video section.</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 p-4 border-t border-border-clinical flex justify-end gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-border-clinical text-xs font-semibold text-deep-navy rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Print Document
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
