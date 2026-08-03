import { NextResponse } from "next/server";

// Temporary diagnostic — reports only whether each MS Graph env var is SET
// in this environment, never the actual values, to debug why production
// email sending is failing. Remove once resolved.
export async function GET() {
  return NextResponse.json({
    success: true,
    MS_GRAPH_TENANT_ID: Boolean(process.env.MS_GRAPH_TENANT_ID),
    MS_GRAPH_CLIENT_ID: Boolean(process.env.MS_GRAPH_CLIENT_ID),
    MS_GRAPH_CLIENT_SECRET: Boolean(process.env.MS_GRAPH_CLIENT_SECRET),
    MS_GRAPH_SENDER_EMAIL: process.env.MS_GRAPH_SENDER_EMAIL || null,
    CLINIC_ADMIN_EMAIL: process.env.CLINIC_ADMIN_EMAIL || null,
    BREVO_API_KEY: Boolean(process.env.BREVO_API_KEY),
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || null,
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || null,
  });
}
