import { NextResponse } from "next/server";
import { verifyClinicianPin } from "@/lib/clinicianPin";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";

const PATIENTS_KEY = "dynamic-patients";

async function readDb(): Promise<Record<string, any>> {
  return getStoreValue(PATIENTS_KEY, {});
}

async function writeDb(data: Record<string, any>): Promise<boolean> {
  return setStoreValue(PATIENTS_KEY, data);
}

export async function GET() {
  const patients = await readDb();
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      dob,
      patientId,
      surgery,
      surgeryDate,
      balanceDue,
      accessTier: passedAccessTier,
      insuranceProvider,
      policyNumber,
      insurancePreAuth,
      preAuthCode,
      ubrn,
      pin,
    } = body;

    // Simple security validation
    if (!verifyClinicianPin(pin)) {
      return NextResponse.json({ error: "Invalid clinician credentials" }, { status: 401 });
    }

    if (!name || !email || !surgery) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await readDb();

    // Map default exercises and documents based on pathway
    let exercises: any[] = [];
    let documents: any[] = [];
    let accessTier = passedAccessTier || "Surgery";

    if (surgery.includes("Total Knee")) {
      exercises = [
        { id: "sqc", name: "Static Quadriceps Contractions", description: "Sit or lie flat, tighten your thigh muscle, and pull your kneecap upwards. Hold for 5 seconds. 10 reps, 4-6x daily.", completed: false, videoTips: ["Squeeze thigh muscles hard", "Keep ankle flexed", "Hold contraction"], videoUrl: "https://www.youtube.com/embed/shSiZn5x9R8" },
        { id: "hs", name: "Heel Slides", description: "Gently slide your heel toward your buttocks, bending your knee as far as comfortable. Hold 5s. 3 sets of 10.", completed: false, videoTips: ["Use a strap if needed", "Do not force bending", "Slide smoothly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=75" },
        { id: "pm", name: "Patellar Mobilisation", description: "Use your fingers to gently push your kneecap up, down, and side to side. 2-3 minutes, twice daily.", completed: false, videoTips: ["Keep quadricep relaxed", "Use light pressure", "Cover all 4 directions"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=40" },
        { id: "slr", name: "Straight Leg Raises", description: "Tighten thigh, lift leg 6 inches, hold for 5s. 3 sets of 10.", completed: false, videoTips: ["Ensure knee is locked straight", "Hold for a full 5 count", "Control lowering"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=120" }
      ];
      documents = [
        { title: "Total Knee Replacement Recovery Guide", filename: "total-knee-replacement-recovery-guide.pdf", date: surgeryDate, type: "Guide" },
        { title: "Post-Op Consultation Summary Letter", filename: "lkc-post-op-summary-jenkins.pdf", date: surgeryDate, type: "Letter" },
        { title: "Referral Script: Post-Op MRI Assessment", filename: "lkc-mri-referral-jenkins.pdf", date: surgeryDate, type: "Order" }
      ];
    } else if (surgery.includes("Patellar")) {
      accessTier = "Surgery";
      exercises = [
        { id: "sqc", name: "Static Quadriceps Contractions", description: "Sit or lie flat, tighten your thigh muscle, and pull your kneecap upwards. Hold for 5 seconds. 10 reps, 4-6x daily.", completed: false, videoTips: ["Squeeze thigh muscles hard", "Keep ankle flexed", "Hold contraction"], videoUrl: "https://www.youtube.com/embed/shSiZn5x9R8" },
        { id: "slrb", name: "Straight Leg Raises in Brace", description: "Perform straight leg raises ONLY while the brace is locked in full extension. 3 sets of 10.", completed: false, videoTips: ["Check brace lock first", "Keep leg locked completely", "Do not swing leg"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=120" },
        { id: "rhs", name: "Restricted Knee Bending", description: "Slide heel back to bend knee to maximum degree permitted (typically 60 or 90 degrees). 10 reps, 3x daily.", completed: false, videoTips: ["Stay within brace limitations", "Hold bend for 3-5 seconds", "Slide slowly"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=75" },
        { id: "chs", name: "Calf and Hamstring Stretches", description: "Use a towel looped around your foot to gently stretch calf/hamstring. Hold 20-30s, repeat 3 times.", completed: false, videoTips: ["Stretch should be gentle", "Keep knee straight", "Breath deeply"], videoUrl: "https://www.youtube.com/embed/2iB8pcKzJgo?start=120" }
      ];
      documents = [
        { title: "Patellar Stabilisation Recovery Guide", filename: "patellar-stabilisation-recovery-guide.pdf", date: surgeryDate, type: "Guide" },
        { title: "Clinical Assessment Summary Letter", filename: "lkc-assessment-morrison.pdf", date: surgeryDate, type: "Letter" }
      ];
    } else if (surgery.includes("Arthrosamid")) {
      accessTier = "Injection";
      exercises = [];
      documents = [
        { title: "Arthrosamid® Post-Injection Care Guide", filename: "arthrosamid-post-injection-guide.pdf", date: surgeryDate, type: "Guide" },
        { title: "Clinical Summary Letter (Injection)", filename: "lkc-injection-summary-watson.pdf", date: surgeryDate, type: "Letter" }
      ];
    } else {
      accessTier = "Consultation";
      exercises = [];
      documents = [
        { title: "Initial Consultation Summary Letter", filename: "lkc-consultation-vance.pdf", date: surgeryDate, type: "Letter" }
      ];
    }

    // Add immediate pre-op care guides
    documents.push(
      { title: "2-Day Post-Op Cryotherapy & Elevation Plan", filename: "2day-care.pdf", date: surgeryDate, type: "Guide" },
      { title: "7-Day Progressive Knee Bending Protocol", filename: "7day-care.pdf", date: surgeryDate, type: "Guide" }
    );

    // Calculate days post op
    let daysPostOp = 0;
    try {
      const sDate = new Date(surgeryDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - sDate.getTime());
      daysPostOp = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (_) {}

    // Construct patient object
    const newPatient = {
      name,
      patientId: patientId || `LKC-${Math.floor(10000 + Math.random() * 90000)}`,
      dob: dob || "01/01/1980",
      surgery,
      surgeryDate,
      daysPostOp,
      surgeon: "Mr. Ricardo J Pacheco FRCS Tr & Orth",
      balanceDue: parseFloat(balanceDue) || 0.0,
      insuranceProvider: insuranceProvider || "Self-Pay",
      policyNumber: policyNumber || null,
      insurancePreAuth: insurancePreAuth || preAuthCode || null,
      ubrn: ubrn || null,
      referringGp: body.referringGp || "Lindum Medical Practice",
      referringPhysio: body.referringPhysio || "Louth County Physio Clinic",
      accessTier,
      exercises,
      documents
    };

    db[cleanEmail] = newPatient;
    await writeDb(db);

    return NextResponse.json({ success: true, patient: newPatient });
  } catch (error) {
    console.error("Clinician registration error:", error);
    return NextResponse.json({ error: "Failed to register patient." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, clinicalNote, oksScore, fitForWorkCert, pin } = body;

    if (!verifyClinicianPin(pin)) {
      return NextResponse.json({ error: "Invalid clinician credentials" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Patient email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await readDb();

    if (!db[cleanEmail]) {
      // Initialize dynamic record if not exists
      db[cleanEmail] = {
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        patientId: `LKC-${Math.floor(10000 + Math.random() * 90000)}`,
        surgery: "Consultation & Assessment",
        surgeryDate: new Date().toISOString().split("T")[0],
        notesHistory: [],
        oksHistory: []
      };
    }

    const patient = db[cleanEmail];
    if (!patient.notesHistory) patient.notesHistory = [];
    if (!patient.oksHistory) patient.oksHistory = [];

    if (clinicalNote) {
      patient.notesHistory.unshift({
        id: `NOTE-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: clinicalNote.text,
        phase: clinicalNote.phase || "Outpatient Consultation",
        rom: clinicalNote.rom || "N/A",
        clinician: "Mr Ricardo J Pacheco"
      });
    }

    if (oksScore !== undefined) {
      patient.oksScore = oksScore.totalScore;
      patient.oksHistory.unshift({
        date: new Date().toISOString().split("T")[0],
        score: oksScore.totalScore,
        category: oksScore.category,
        answers: oksScore.answers
      });
    }

    if (fitForWorkCert) {
      if (!patient.certificates) patient.certificates = [];
      patient.certificates.unshift({
        id: `CERT-${Date.now()}`,
        issuedDate: new Date().toISOString().split("T")[0],
        clearanceType: fitForWorkCert.clearanceType,
        effectiveDate: fitForWorkCert.effectiveDate,
        restrictions: fitForWorkCert.restrictions,
        issuedBy: "Mr Ricardo J Pacheco FRCS (Tr & Orth)"
      });
    }

    if (body.newInvoice) {
      if (!patient.invoices) patient.invoices = [];
      patient.invoices.unshift({
        id: `INV-${Date.now()}`,
        dateSent: new Date().toISOString().split("T")[0],
        amount: body.newInvoice.amount,
        type: body.newInvoice.type || "Insurance Excess",
        status: body.newInvoice.status || "PENDING",
        channel: body.newInvoice.channel || "WHATSAPP",
        description: body.newInvoice.description || "Lincolnshire Knee Clinic Invoice Notice",
        sentBy: "Mr Ricardo J Pacheco"
      });
    }

    if (body.updateInvoiceStatus) {
      if (patient.invoices) {
        const inv = patient.invoices.find((i: any) => i.id === body.updateInvoiceStatus.id);
        if (inv) {
          inv.status = body.updateInvoiceStatus.status;
          inv.lastReminderDate = new Date().toISOString().split("T")[0];
          if (body.updateInvoiceStatus.status === "PAID") {
            patient.balanceDue = 0.0;
          }
        }
      }
    }

    if (body.logChaser) {
      if (patient.invoices) {
        const inv = patient.invoices.find((i: any) => i.id === body.logChaser.id);
        if (inv) {
          const today = new Date().toISOString().split("T")[0];
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          inv.lastChasedDate = `${today} ${time}`;
          inv.chaseCount = (inv.chaseCount || 0) + 1;
          if (!inv.chaseHistory) inv.chaseHistory = [];
          inv.chaseHistory.unshift({
            date: today,
            time: time,
            channel: body.logChaser.channel || "WHATSAPP",
            by: "Mr Ricardo J Pacheco"
          });
        }
      }
    }

    await writeDb(db);
    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error("Patient record update error:", error);
    return NextResponse.json({ error: "Failed to update patient record." }, { status: 500 });
  }
}

