import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ReportedContent {
  id: string;
  author_id: string;
  status: string;
  body: string;
  title?: string;
}

// Gated by Basic Auth in middleware.ts (isDashboardRoute includes this path).
// Uses the service-role client throughout — this route runs entirely with
// admin privileges, bypassing the member-scoped RLS policies.

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: reports, error } = await admin
      .from("community_reports")
      .select("id, target_type, target_id, reporter_id, reason, status, admin_note, created_at, resolved_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community reports:", error);
      return NextResponse.json({ success: false, message: "Failed to load reports." }, { status: 500 });
    }

    const enriched = await Promise.all(
      (reports || []).map(async (report) => {
        const table = report.target_type === "post" ? "community_posts" : "community_replies";
        const selectCols =
          report.target_type === "post"
            ? "id, title, body, author_id, status"
            : "id, body, author_id, status";

        const { data: targetData } = await admin.from(table).select(selectCols).eq("id", report.target_id).maybeSingle();
        const target = targetData as unknown as ReportedContent | null;

        const [reporterProfile, authorProfile] = await Promise.all([
          admin.from("community_profiles").select("display_name").eq("user_id", report.reporter_id).maybeSingle(),
          target
            ? admin.from("community_profiles").select("display_name").eq("user_id", target.author_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        let authorEmail: string | null = null;
        if (target) {
          const { data: authorUser } = await admin.auth.admin.getUserById(target.author_id);
          authorEmail = authorUser?.user?.email || null;
        }

        return {
          ...report,
          reporterDisplayName: reporterProfile.data?.display_name || "Unknown member",
          target,
          authorDisplayName: authorProfile.data?.display_name || "Unknown member",
          authorEmail,
        };
      })
    );

    return NextResponse.json({ success: true, reports: enriched });
  } catch (error) {
    console.error("Error in GET /api/portal/community-reports:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reportId, action, targetType, targetId, adminNote } = body;

    if (!reportId || (action !== "hide" && action !== "dismiss")) {
      return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
    }

    const admin = createAdminClient();

    if (action === "hide") {
      if (targetType !== "post" && targetType !== "reply") {
        return NextResponse.json({ success: false, message: "Invalid target type." }, { status: 400 });
      }
      const table = targetType === "post" ? "community_posts" : "community_replies";
      const { error: hideError } = await admin
        .from(table)
        .update({ status: "hidden", hidden_reason: adminNote || "Hidden following a member report." })
        .eq("id", targetId);

      if (hideError) {
        console.error("Error hiding reported content:", hideError);
        return NextResponse.json({ success: false, message: "Failed to hide content." }, { status: 500 });
      }
    }

    const { error: reportError } = await admin
      .from("community_reports")
      .update({
        status: action === "hide" ? "actioned" : "dismissed",
        admin_note: adminNote || null,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (reportError) {
      console.error("Error updating community report:", reportError);
      return NextResponse.json({ success: false, message: "Failed to update report." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/portal/community-reports:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
