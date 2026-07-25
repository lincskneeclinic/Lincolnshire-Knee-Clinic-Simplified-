import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "dynamic-patients.json");

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("Failed to read dynamic-patients database:", error);
    return {};
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write dynamic-patients database:", error);
    return false;
  }
}

// GET /api/portal/messages?email=patient@lincsknee.com
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email query param required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  const patient = db[cleanEmail];

  if (!patient) {
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({
    messages: patient.messages || [],
    patientName: patient.name,
    patientId: patient.patientId
  });
}

// POST /api/portal/messages
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, text, sender, pin } = body;

    if (!email || !text) {
      return NextResponse.json({ error: "Email and message text are required" }, { status: 400 });
    }

    // Clinician authentication check if sender is clinician
    if (sender === "clinician" && pin !== "230670") {
      return NextResponse.json({ error: "Invalid security PIN" }, { status: 401 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();

    if (!db[cleanEmail]) {
      db[cleanEmail] = {
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        patientId: `LKC-${Math.floor(10000 + Math.random() * 90000)}`,
        surgery: "Consultation & Assessment",
        surgeryDate: new Date().toISOString().split("T")[0],
        messages: []
      };
    }

    const patient = db[cleanEmail];
    if (!patient.messages) patient.messages = [];

    const now = new Date();
    const newMessage = {
      id: `MSG-${Date.now()}`,
      sender: sender || "patient", // "clinician" | "patient"
      text,
      date: now.toISOString().split("T")[0],
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    patient.messages.push(newMessage);
    writeDb(db);

    return NextResponse.json({ success: true, message: newMessage, messages: patient.messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
