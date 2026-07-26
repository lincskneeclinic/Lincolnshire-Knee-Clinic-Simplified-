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
          PRIMARY_INTEREST: contact.primaryInterest || "General Joint Health",
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
