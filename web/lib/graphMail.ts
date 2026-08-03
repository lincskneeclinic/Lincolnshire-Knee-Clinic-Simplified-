import { ContentPipelineRun } from "./contentPipeline";
import { sendBrevoMail } from "./brevo";

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
 * Sends an HTML email via Microsoft Graph Mail API. Falls back to a console log
 * when Graph credentials are not configured, so callers still get a visible record
 * of the notification in local/dev environments.
 */
export async function sendGraphMail(subject: string, htmlBody: string, recipientEmail: string | string[]): Promise<boolean> {
  const recipients = [...new Set((Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail]).filter(Boolean))];
  const tenantId = process.env.MS_GRAPH_TENANT_ID;
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
  const senderEmail = process.env.MS_GRAPH_SENDER_EMAIL || "admin@lincsknee.com";

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
          toRecipients: recipients.map((address) => ({ emailAddress: { address } }))
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
        console.log(`[Graph Mail] Notification email dispatched successfully to ${recipients.join(", ")}`);
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

  // Graph API credentials are not configured — no email is actually sent.
  // Logged as a warning (not a success) so a missing config doesn't fail silently.
  console.warn(`[Graph Mail] NOT SENT — MS_GRAPH_TENANT_ID/CLIENT_ID/CLIENT_SECRET not configured. Would have sent:
    Subject: ${subject}
    To: ${recipients.join(", ")}`);

  return false;
}

/**
 * Sends an email alert when a content pipeline run requires clinician review.
 * Prefers Brevo (already configured with a real API key) over MS Graph
 * (credentials never actually filled in) — same provider-preference pattern
 * already used in topicNotify.ts.
 */
export async function sendContentPipelineNotificationEmail(
  run: ContentPipelineRun,
  stage: "blog" | "social"
): Promise<boolean> {
  const recipientEmail = [process.env.CLINIC_ADMIN_EMAIL || "info@lincsknee.com", "admin@lincsknee.com"];
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

  const hasBrevo = Boolean(process.env.BREVO_API_KEY);
  if (hasBrevo) {
    const result = await sendBrevoMail(subject, htmlBody, recipientEmail);
    return result.success;
  }
  return sendGraphMail(subject, htmlBody, recipientEmail);
}

export interface ContactEnquiry {
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredClinic?: string;
}

/**
 * Sends an email alert to clinic admin when a visitor submits the public contact form.
 */
export async function sendContactEnquiryNotificationEmail(enquiry: ContactEnquiry): Promise<boolean> {
  const recipientEmail = process.env.CLINIC_ADMIN_EMAIL || "admin@lincsknee.com";
  const subject = `[Website Enquiry] New contact form submission from ${enquiry.name}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 24px; border-rounded: 12px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0284c7; margin-top: 0;">Lincolnshire Knee Clinic</h2>
      <h3 style="color: #0f172a; margin-bottom: 8px;">New Website Enquiry</h3>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border-left: 4px solid #0284c7; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Name</p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a;">${enquiry.name}</p>

        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Email</p>
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a;">${enquiry.email}</p>

        ${
          enquiry.phone
            ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Phone</p>
               <p style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a;">${enquiry.phone}</p>`
            : ""
        }

        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Message</p>
        <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap;">${enquiry.message}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        Submitted via the Lincolnshire Knee Clinic website contact form.
      </p>
    </div>
  `;

  return sendGraphMail(subject, htmlBody, recipientEmail);
}
