import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      patientId,
      patientName,
      surgery,
      oxfordScore,
      medications,
      allergies,
      medicalHistory,
      consentSigned,
      signatureType,
    } = data;

    // Build CSV Row
    // Format: Timestamp,PatientId,PatientName,Surgery,OxfordKneeScore,Medications,Allergies,MedicalHistory,ConsentSigned,SignatureType
    const timestamp = new Date().toISOString();
    
    // Clean text to avoid breaking CSV format
    const cleanCsvField = (field: any) => {
      const str = String(field || "").replace(/"/g, '""').trim();
      return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
    };

    const csvRow = [
      timestamp,
      cleanCsvField(patientId),
      cleanCsvField(patientName),
      cleanCsvField(surgery),
      cleanCsvField(oxfordScore),
      cleanCsvField(medications),
      cleanCsvField(allergies),
      cleanCsvField(medicalHistory),
      cleanCsvField(consentSigned ? "YES" : "NO"),
      cleanCsvField(signatureType),
    ].join(",") + "\n";

    // Path to intake-registry.csv
    // Workspace relative path: web/data/intake-registry.csv
    const filePath = path.join(process.cwd(), "data", "intake-registry.csv");

    // Append to file
    fs.appendFileSync(filePath, csvRow, "utf8");

    return NextResponse.json({ success: true, message: "Data logged to register successfully." });
  } catch (error: any) {
    console.error("Failed to write to registry CSV:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
