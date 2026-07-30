import { NextResponse } from "next/server";
import { verifyClinicianPin } from "@/lib/clinicianPin";

// Gated by Basic Auth in middleware.ts (isDashboardRoute includes this path).
export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    return NextResponse.json({ valid: verifyClinicianPin(pin) });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
