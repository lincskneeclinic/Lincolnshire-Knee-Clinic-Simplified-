/**
 * Brevo (contact list) sync helper using their REST API directly — no SDK
 * dependency, matching the style already used in lib/supabase.ts.
 *
 * Env vars required:
 *   BREVO_API_KEY   — from Brevo dashboard: Settings > SMTP & API > API Keys
 *   BREVO_LIST_ID   — the numeric ID of your newsletter contact list in
 *                      Brevo (Contacts > Lists > click your list > the ID
 *                      is in the URL, e.g. .../list/5 → BREVO_LIST_ID=5)
 */

export interface BrevoContactInput {
  email: string;
  name?: string;
  mobileNumber?: string;
  primaryInterest?: string;
}

function toE164UK(mobile?: string): string | undefined {
  if (!mobile) return undefined;
  const digits = mobile.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits; // already international
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`; // UK local -> international
  if (digits.startsWith("44")) return `+${digits}`;
  return undefined; // doesn't look like a usable number — omit rather than fail
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID);
}

export async function syncContactToBrevo(contact: BrevoContactInput): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) return false;

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: contact.email,
        attributes: {
          FIRSTNAME: contact.name || "",
          SMS: toE164UK(contact.mobileNumber),
          PRIMARY_INTEREST: contact.primaryInterest || "General Knee Health",
        },
        listIds: [Number(listId)],
        updateEnabled: true, // upsert — if the email already exists, update rather than error
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Brevo API error:", res.status, errorBody);
    }

    return res.ok;
  } catch (error) {
    console.error("Error syncing contact to Brevo:", error);
    return false;
  }
}

export async function unsubscribeContactInBrevo(email: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email.trim().toLowerCase())}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        emailBlacklisted: true,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Brevo unsubscribe error:", res.status, errorBody);
    }

    return res.ok;
  } catch (error) {
    console.error("Error unsubscribing contact in Brevo:", error);
    return false;
  }
}

export interface SendBrevoMailResult {
  success: boolean;
  error?: string;
}

export async function sendBrevoMail(
  subject: string,
  htmlContent: string,
  toEmail: string,
  toName?: string
): Promise<SendBrevoMailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[Brevo Smtp Mail] NOT SENT — BREVO_API_KEY not configured.");
    return { success: false, error: "BREVO_API_KEY is not configured." };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Lincolnshire Knee Clinic",
          email: process.env.BREVO_SENDER_EMAIL || "info@lincolnshirekneeclinic.co.uk",
        },
        to: [{ email: toEmail, name: toName || "" }],
        subject,
        htmlContent,
      }),
    });

    if (res.ok) {
      console.log(`[Brevo Smtp Mail] Email campaign sent successfully to ${toEmail}`);
      return { success: true };
    } else {
      const errorBody = await res.text();
      console.error("[Brevo Smtp Mail] HTTP error:", res.status, errorBody);
      let parsedMessage = errorBody;
      try {
        const parsed = JSON.parse(errorBody);
        parsedMessage = parsed.message || errorBody;
      } catch {
        // errorBody wasn't JSON — use it as-is
      }
      return { success: false, error: `Brevo API error (${res.status}): ${parsedMessage}` };
    }
  } catch (error: any) {
    console.error("[Brevo Smtp Mail] Unexpected exception:", error);
    return { success: false, error: error?.message || "Unexpected network error contacting Brevo." };
  }
}


