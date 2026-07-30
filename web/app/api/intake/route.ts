import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const admin = createAdminClient();
    const { error } = await admin.from("intake_registry").insert({
      patient_id: patientId || null,
      patient_name: patientName,
      surgery: surgery || null,
      oxford_score: oxfordScore || null,
      medications: medications || null,
      allergies: allergies || null,
      medical_history: medicalHistory || null,
      consent_signed: Boolean(consentSigned),
      signature_type: signatureType || null,
    });

    if (error) {
      console.error("Failed to write to intake registry:", error);
      return NextResponse.json({ success: false, error: "Failed to log intake record." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Data logged to register successfully." });
  } catch (error) {
    console.error("Failed to process intake submission:", error);
    return NextResponse.json({ success: false, error: "An error occurred while processing your request." }, { status: 500 });
  }
}
