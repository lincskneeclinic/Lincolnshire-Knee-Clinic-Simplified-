import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const INJECTIONS_PATH = path.join(process.cwd(), "data", "dynamic-injections.json");

function readInjections() {
  try {
    if (!fs.existsSync(INJECTIONS_PATH)) {
      // Default initial mock data for governance demonstration
      const initialData = [
        {
          id: "INJ-1001",
          patientName: "Margaret Henderson",
          patientId: "LKC-78219",
          kneeSide: "Left Knee",
          product: "Arthrosamid® Hydrogel",
          batchNumber: "ARTH-2026-889B",
          expiryDate: "2027-11-30",
          dose: "6.0 ml",
          adminDate: "2026-07-15",
          clinicLocation: "St. Hugh's Hospital",
          clinician: "Mr Ricardo J Pacheco",
          notes: "Administered intra-articularly under ultrasound guidance. No immediate reaction."
        },
        {
          id: "INJ-1002",
          patientName: "David Jenkins",
          patientId: "LKC-44912",
          kneeSide: "Right Knee",
          product: "Platelet-Rich Plasma (PRP)",
          batchNumber: "PRP-CENT-402",
          expiryDate: "2026-07-20",
          dose: "5.0 ml",
          adminDate: "2026-07-20",
          clinicLocation: "Lincoln Private Hospital",
          clinician: "Mr Ricardo J Pacheco",
          notes: "Dual spin autologous PRP concentrate. Medial compartment injection."
        },
        {
          id: "INJ-1003",
          patientName: "Robert Vance",
          patientId: "LKC-10928",
          kneeSide: "Right Knee",
          product: "Durolane® Hyaluronic Acid",
          batchNumber: "DUR-99120-X",
          expiryDate: "2027-04-15",
          dose: "3.0 ml",
          adminDate: "2026-07-22",
          clinicLocation: "Parkhill Hospital",
          clinician: "Mr Ricardo J Pacheco",
          notes: "Single injection viscoelastic supplement for Grade II OA."
        }
      ];
      fs.writeFileSync(INJECTIONS_PATH, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    const data = fs.readFileSync(INJECTIONS_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Failed to read dynamic-injections:", error);
    return [];
  }
}

function writeInjections(data: any[]) {
  try {
    fs.writeFileSync(INJECTIONS_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write to dynamic-injections:", error);
    return false;
  }
}

export async function GET() {
  const injections = readInjections();
  return NextResponse.json(injections);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientId,
      kneeSide,
      product,
      batchNumber,
      expiryDate,
      dose,
      adminDate,
      clinicLocation,
      notes,
      pin,
    } = body;

    if (pin !== "230670") {
      return NextResponse.json({ error: "Invalid clinician security PIN" }, { status: 401 });
    }

    if (!patientName || !product || !batchNumber) {
      return NextResponse.json({ error: "Missing required injection governance fields" }, { status: 400 });
    }

    const currentList = readInjections();
    const newEntry = {
      id: `INJ-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientId: patientId || "LKC-GEN",
      kneeSide: kneeSide || "Left Knee",
      product,
      batchNumber,
      expiryDate: expiryDate || "2027-12-31",
      dose: dose || "6.0 ml",
      adminDate: adminDate || new Date().toISOString().split("T")[0],
      clinicLocation: clinicLocation || "St. Hugh's Hospital",
      clinician: "Mr Ricardo J Pacheco",
      notes: notes || "Administered under consultant governance."
    };

    currentList.unshift(newEntry);
    writeInjections(currentList);

    return NextResponse.json({ success: true, entry: newEntry, list: currentList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
