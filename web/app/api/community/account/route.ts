import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, saveContactToSupabase } from "@/lib/supabase";
import { isBrevoConfigured, syncContactToBrevo } from "@/lib/brevo";

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9 '.-]{2,40}$/;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("community_profiles")
      .select("display_name, newsletter_opt_in, status, created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({ success: true, email: user.email, profile });
  } catch (error) {
    console.error("Error fetching community account:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.displayName === "string") {
      const cleanDisplayName = body.displayName.trim();
      if (!DISPLAY_NAME_REGEX.test(cleanDisplayName)) {
        return NextResponse.json(
          { success: false, message: "Display name must be 2-40 characters (letters, numbers, spaces, apostrophes, hyphens only)." },
          { status: 400 }
        );
      }

      const admin = createAdminClient();
      const { data: existingName } = await admin
        .from("community_profiles")
        .select("user_id")
        .ilike("display_name", cleanDisplayName)
        .neq("user_id", user.id)
        .maybeSingle();
      if (existingName) {
        return NextResponse.json({ success: false, message: "That display name is already taken." }, { status: 409 });
      }

      updates.display_name = cleanDisplayName;
    }

    if (typeof body.newsletterOptIn === "boolean") {
      updates.newsletter_opt_in = body.newsletterOptIn;

      if (body.newsletterOptIn) {
        const { data: profile } = await supabase
          .from("community_profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        const name = (updates.display_name as string) || profile?.display_name || "";

        if (isSupabaseConfigured() && user.email) {
          await saveContactToSupabase({
            name,
            email: user.email,
            marketing_consent: true,
            consent_given_at: new Date().toISOString(),
            consent_source: "community-account-settings",
            primary_interest: "General Joint Health",
            topics: ["Knee Health Updates"],
            pages_visited: ["/community/account"],
          });
        }
        if (isBrevoConfigured() && user.email) {
          await syncContactToBrevo({ email: user.email, name });
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabase.from("community_profiles").update(updates).eq("user_id", user.id);

    if (error) {
      console.error("Error updating community profile:", error);
      return NextResponse.json({ success: false, message: "Failed to update your account." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating community account:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
    }

    // Soft suspend: blocks future login/posting and preserves existing content
    // attributed to the member's display name. Full erasure is handled as a
    // manual admin request for v1 rather than automated hard-delete, since
    // that requires a decision about how to handle their existing posts/replies.
    const admin = createAdminClient();
    const { error } = await admin.from("community_profiles").update({ status: "suspended" }).eq("user_id", user.id);

    if (error) {
      console.error("Error deactivating community account:", error);
      return NextResponse.json({ success: false, message: "Failed to deactivate your account." }, { status: 500 });
    }

    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Your Community account has been deactivated. Contact the clinic if you'd like your data fully erased.",
    });
  } catch (error) {
    console.error("Error deactivating community account:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
