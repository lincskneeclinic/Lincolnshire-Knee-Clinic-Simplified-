/**
 * Supabase client helper using standard REST API calls.
 * Compatible with Next.js App Router Node.js & Edge Runtimes with zero extra npm dependencies.
 */

export interface ContactRecord {
  id?: string;
  name: string;
  email: string;
  mobile_number?: string;
  marketing_consent: boolean;
  consent_given_at: string;
  consent_source: string;
  primary_interest?: string;
  topics?: string[];
  pages_visited?: string[];
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("http"));
}

export async function saveContactToSupabase(record: ContactRecord): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  try {
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/contacts`;
    console.log("Supabase endpoint being called:", endpoint);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: record.name,
        email: record.email,
        mobile_number: record.mobile_number || null,
        marketing_consent: record.marketing_consent,
        consent_given_at: record.consent_given_at,
        consent_source: record.consent_source,
        primary_interest: record.primary_interest || "General Knee Health",
        topics: record.topics || ["Knee Health Updates"],
        pages_visited: record.pages_visited || ["/"],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Supabase API error:", res.status, errorBody);
    }

    return res.ok;
  } catch (error) {
    console.error("Error writing to Supabase contacts table:", error);
    console.error("Error cause:", (error as any)?.cause);
    console.error("Supabase URL being used:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    return false;
  }
}

export async function fetchContactsFromSupabase(): Promise<ContactRecord[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/contacts?select=*&order=created_at.desc`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error reading from Supabase contacts table:", error);
    return [];
  }
}

export async function unsubscribeContactInSupabase(email: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  try {
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/contacts?email=eq.${encodeURIComponent(email.trim().toLowerCase())}`;
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        marketing_consent: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase unsubscribe PATCH error:", res.status, errText);
    }

    return res.ok;
  } catch (error) {
    console.error("Error unsubscribing contact in Supabase:", error);
    return false;
  }
}

