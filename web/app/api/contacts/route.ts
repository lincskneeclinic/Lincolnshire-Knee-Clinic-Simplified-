import { NextResponse } from "next/server";

// Placeholder API route — database write will be wired in separately once the backend is connected.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, consentChecked } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    // Basic email format validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Verify explicit consent check
    if (!consentChecked) {
      return NextResponse.json(
        { success: false, message: "Consent checkbox must be checked." },
        { status: 400 }
      );
    }

    // Note: Database write (e.g. Supabase contacts/marketing table) will be wired in separately when connected.
    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! You will receive knee health blogs, newsletters, and updates from Lincolnshire Knee Clinic.",
    });
  } catch (error) {
    console.error("Error processing contact signup:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
