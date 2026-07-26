import { ContentPipelineRun } from "./contentPipeline";

export interface GraphMailPayload {
  message: {
    subject: string;
    body: {
      contentType: "HTML" | "Text";
      content: string;
    };
    toRecipients: Array<{
      emailAddress: {
        address: string;
      };
    }>;
  };
  saveToSentItems?: boolean;
}

/**
 * Sends an email alert via Microsoft Graph Mail API when a content pipeline run requires clinician review.
 * If Microsoft Graph environment variables are missing, gracefully logs the alert details to console.
 */
export async function sendContentPipelineNotificationEmail(
  run: ContentPipelineRun,
  stage: "blog" | "social"
): Promise<boolean> {
  const tenantId = process.env.MS_GRAPH_TENANT_ID;
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
  const senderEmail = process.env.MS_GRAPH_SENDER_EMAIL || "admin@lincsknee.com";
  const recipientEmail = process.env.CLINIC_ADMIN_EMAIL || "admin@lincsknee.com";

  const stageTitle = stage === "blog" ? "Blog Article Draft" : "Multi-Platform Social Media Captions";
  const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/portal/business?tab=pipeline&runId=${run.run_id}`;
  const flagsCount = run.blog_drafts[0]?.flags?.length || 0;

  const subject = `[Action Required] Content Pipeline Review: ${run.topic.substring(0, 60)} (${stageTitle})`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 24px; border-rounded: 12px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0284c7; margin-top: 0;">Lincolnshire Knee Clinic</h2>
      <h3 style="color: #0f172a; margin-bottom: 8px;">Content Review Required</h3>
      <p style="font-size: 14px; color: #475569;">
        A new content item has reached the <strong>${stageTitle}</strong> review stage and requires clinical approval.
      </p>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border-left: 4px solid #0284c7; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Topic</p>
        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #0f172a;">${run.topic}</p>
        ${
          flagsCount > 0
            ? `<div style="margin-top: 10px; background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                ⚠️ ${flagsCount} item(s) flagged as [NEEDS CLINICAL REVIEW]
              </div>`
            : ""
        }
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${dashboardLink}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Open Business Dashboard Review Tab →
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        Lincolnshire Knee Clinic Practice Intelligence & Content Automation Engine.
      </p>
    </div>
  `;

  // If MS Graph Credentials exist, perform OAuth client credentials flow & send email
  if (tenantId && clientId && clientSecret) {
    try {
      // 1. Get Access Token from Azure AD / Entra ID endpoint
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
      });

      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString()
      });

      if (!tokenRes.ok) {
        console.error("Failed to obtain MS Graph OAuth token:", await tokenRes.text());
        return false;
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Dispatch Graph Mail request
      const mailUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`;
      const mailPayload: GraphMailPayload = {
        message: {
          subject,
          body: { contentType: "HTML", content: htmlBody },
          toRecipients: [{ emailAddress: { address: recipientEmail } }]
        },
        saveToSentItems: true
      };

      const mailRes = await fetch(mailUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mailPayload)
      });

      if (mailRes.ok) {
        console.log(`[Graph Mail] Notification email dispatched successfully to ${recipientEmail} for run ${run.run_id}`);
        return true;
      } else {
        console.error("[Graph Mail] Send mail HTTP error:", await mailRes.text());
        return false;
      }
    } catch (err) {
      console.error("[Graph Mail] Unexpected exception dispatching email:", err);
      return false;
    }
  }

  // Graceful fallback logging when Graph API credentials are not set in environment
  console.log(`[Graph Mail - Mock/Fallback Log] Notification email generated:
    Subject: ${subject}
    To: ${recipientEmail}
    Dashboard Link: ${dashboardLink}
    Flags: ${flagsCount} clinical review flags`);

  return true;
}
