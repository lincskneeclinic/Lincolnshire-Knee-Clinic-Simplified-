import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, saveContactToSupabase } from "@/lib/supabase";
import { isBrevoConfigured, syncContactToBrevo } from "@/lib/brevo";

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9 '.-]{2,40}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      displayName,
      disclaimerAccepted,
      newsletterOptIn,
      website, // honeypot — real users never fill this
    } = body;

    if (typeof website === "string" && website.trim() !== "") {
      // Pretend success so bots don't learn they were caught.
      return NextResponse.json({ success: true });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, message: "Please provide a valid email address." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    const cleanDisplayName = typeof displayName === "string" ? displayName.trim() : "";
    if (!DISPLAY_NAME_REGEX.test(cleanDisplayName)) {
      return NextResponse.json(
        { success: false, message: "Display name must be 2-40 characters (letters, numbers, spaces, apostrophes, hyphens only)." },
        { status: 400 }
      );
    }
    if (!disclaimerAccepted) {
      return NextResponse.json(
        { success: false, message: "You must accept the Community Guidelines & Disclaimer to register." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Friendly pre-check for a duplicate display name (case-insensitive).
    // The DB unique index is the real guard; this just avoids an ugly error.
    const { data: existingName } = await admin
      .from("community_profiles")
      .select("user_id")
      .ilike("display_name", cleanDisplayName)
      .maybeSingle();
    if (existingName) {
      return NextResponse.json(
        { success: false, message: "That display name is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const supabase = await createClient();
    const cleanEmail = email.trim().toLowerCase();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (signUpError || !signUpData.user) {
      return NextResponse.json(
        { success: false, message: signUpError?.message || "Could not create your account. Please try again." },
        { status: 400 }
      );
    }

    const userId = signUpData.user.id;
    const optedIntoNewsletter = Boolean(newsletterOptIn);

    const { error: profileError } = await admin.from("community_profiles").insert({
      user_id: userId,
      display_name: cleanDisplayName,
      newsletter_opt_in: optedIntoNewsletter,
      disclaimer_accepted_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Error creating community profile:", profileError);
      return NextResponse.json(
        { success: false, message: "Your account was created but your profile could not be saved. Please contact support." },
        { status: 500 }
      );
    }

    if (optedIntoNewsletter) {
      if (isSupabaseConfigured()) {
        await saveContactToSupabase({
          name: cleanDisplayName,
          email: cleanEmail,
          marketing_consent: true,
          consent_given_at: new Date().toISOString(),
          consent_source: "community-registration",
          primary_interest: "General Knee Health",
          topics: ["Knee Health Updates"],
          pages_visited: ["/community/register"],
        });
      }
      if (isBrevoConfigured()) {
        await syncContactToBrevo({
          email: cleanEmail,
          name: cleanDisplayName,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: signUpData.session
        ? "Account created. Welcome to the community!"
        : "Account created. Please check your email to confirm your address before logging in.",
      requiresEmailConfirmation: !signUpData.session,
    });
  } catch (error) {
    console.error("Error processing community registration:", error);
    return NextResponse.json({ success: false, message: "An error occurred while processing your request." }, { status: 500 });
  }
}
