import { NextResponse } from "next/server";
import { verifyClinicianPin } from "@/lib/clinicianPin";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";

const INJECTIONS_KEY = "dynamic-injections";

async function readInjections(): Promise<any[]> {
  return getStoreValue(INJECTIONS_KEY, []);
}

async function writeInjections(data: any[]): Promise<boolean> {
  return setStoreValue(INJECTIONS_KEY, data);
}

export async function GET() {
  const injections = await readInjections();
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

    if (!verifyClinicianPin(pin)) {
      return NextResponse.json({ error: "Invalid clinician security PIN" }, { status: 401 });
    }

    if (!patientName || !product || !batchNumber) {
      return NextResponse.json({ error: "Missing required injection governance fields" }, { status: 400 });
    }

    const currentList = await readInjections();
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
    await writeInjections(currentList);

    return NextResponse.json({ success: true, entry: newEntry, list: currentList });
  } catch (error) {
    console.error("Failed to record injection entry:", error);
    return NextResponse.json({ error: "Failed to record injection entry." }, { status: 500 });
  }
}
