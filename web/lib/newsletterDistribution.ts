import fs from "fs";
import path from "path";
import { isSupabaseConfigured, fetchContactsFromSupabase } from "./supabase";
import { sendGraphMail } from "./graphMail";
import { sendBrevoMail } from "./brevo";
import { getStoreValue, setStoreValue } from "./dataStore";

export interface NewsletterEdition {
  id: string;
  subject: string;
  topic: string;
  bodyMarkdown: string;
  bodyHtml: string;
  includeResearch: boolean;
  researchBrief?: any;
  status: "draft" | "sent";
  dateSent?: string;
  recipientsCount?: number;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const EDITIONS_FILE_PATH = path.join(DATA_DIR, "newsletters_editions.json");
const NEWSLETTER_SUBSCRIBERS_PATH = path.join(DATA_DIR, "newsletter-subscribers.json");

const NEWSLETTER_EDITIONS_STORE_KEY = "newsletter-editions";

export async function getNewsletterEditions(): Promise<NewsletterEdition[]> {
  const stored = await getStoreValue<NewsletterEdition[]>(NEWSLETTER_EDITIONS_STORE_KEY, []);
  if (stored.length > 0) return stored;

  // One-time migration path: this store used to be a local JSON file, which doesn't
  // persist reliably on Hostinger's filesystem. If Supabase has nothing yet but a
  // legacy local file does, adopt it into Supabase so existing drafts aren't lost.
  try {
    if (fs.existsSync(EDITIONS_FILE_PATH)) {
      const raw = fs.readFileSync(EDITIONS_FILE_PATH, "utf8");
      const legacy = JSON.parse(raw || "[]");
      if (Array.isArray(legacy) && legacy.length > 0) {
        await setStoreValue(NEWSLETTER_EDITIONS_STORE_KEY, legacy);
        return legacy;
      }
    }
  } catch (error) {
    console.error("Failed to read legacy newsletters_editions.json:", error);
  }
  return [];
}

export async function saveNewsletterEditions(editions: NewsletterEdition[]): Promise<void> {
  await setStoreValue(NEWSLETTER_EDITIONS_STORE_KEY, editions);
}

export async function deleteNewsletterEdition(id: string): Promise<boolean> {
  const editions = await getNewsletterEditions();
  const filtered = editions.filter(e => e.id !== id);
  if (filtered.length === editions.length) return false;
  await saveNewsletterEditions(filtered);
  return true;
}

export async function getNewsletterSubscribers(): Promise<Array<{ name: string; email: string }>> {
  let subscribers: Array<{ name: string; email: string }> = [];

  if (isSupabaseConfigured()) {
    const supabaseContacts = await fetchContactsFromSupabase();
    if (supabaseContacts && supabaseContacts.length > 0) {
      subscribers = supabaseContacts
        .filter(c => c.marketing_consent === true)
        .map(c => ({ name: c.name || "Patient", email: c.email }));
    }
  }

  if (subscribers.length === 0 && fs.existsSync(NEWSLETTER_SUBSCRIBERS_PATH)) {
    try {
      const raw = fs.readFileSync(NEWSLETTER_SUBSCRIBERS_PATH, "utf8");
      const list = JSON.parse(raw || "[]");
      subscribers = list
        .filter((c: any) => c.marketingConsent === true || c.marketing_consent === true)
        .map((c: any) => ({ name: c.name || "Patient", email: c.email }));
    } catch (err) {
      console.error("Error reading local subscribers JSON:", err);
    }
  }

  return subscribers;
}

export async function sendNewsletterCampaign(id: string): Promise<{ success: boolean; sentCount: number; mode: string; error?: string }> {
  const editions = await getNewsletterEditions();
  const index = editions.findIndex(e => e.id === id);
  if (index === -1) {
    return { success: false, sentCount: 0, mode: "error", error: "Newsletter edition not found." };
  }

  const edition = editions[index];
  const subscribers = await getNewsletterSubscribers();

  if (subscribers.length === 0) {
    return { success: false, sentCount: 0, mode: "error", error: "No active subscribed contacts found to distribute to." };
  }

  const hasMSGraph = Boolean(
    process.env.MS_GRAPH_TENANT_ID &&
    process.env.MS_GRAPH_CLIENT_ID &&
    process.env.MS_GRAPH_CLIENT_SECRET
  );
  const hasBrevo = Boolean(process.env.BREVO_API_KEY);

  let sentCount = 0;
  let mode = "simulation";

  if (hasBrevo) {
    mode = "brevo";
    for (const sub of subscribers) {
      const recipientEmail = sub.email;
      const htmlBody = edition.bodyHtml.replace(/\{\{RECIPIENT_EMAIL\}\}/g, encodeURIComponent(recipientEmail));
      const success = await sendBrevoMail(edition.subject, htmlBody, recipientEmail, sub.name);
      if (success) sentCount++;
    }
  } else if (hasMSGraph) {
    mode = "ms-graph";
    for (const sub of subscribers) {
      const recipientEmail = sub.email;
      const htmlBody = edition.bodyHtml.replace(/\{\{RECIPIENT_EMAIL\}\}/g, encodeURIComponent(recipientEmail));
      const success = await sendGraphMail(edition.subject, htmlBody, recipientEmail);
      if (success) sentCount++;
    }
  } else {
    mode = "simulation";
    console.warn(`[Newsletter Campaign Simulation] Sending "${edition.subject}" to ${subscribers.length} recipients:`);
    subscribers.forEach((sub, i) => {
      console.log(`[Simulation] #${i + 1} Recipient: ${sub.name} <${sub.email}>`);
    });
    sentCount = subscribers.length;
  }

  editions[index] = {
    ...edition,
    status: "sent",
    dateSent: new Date().toISOString(),
    recipientsCount: sentCount
  };

  await saveNewsletterEditions(editions);

  return { success: true, sentCount, mode };
}
