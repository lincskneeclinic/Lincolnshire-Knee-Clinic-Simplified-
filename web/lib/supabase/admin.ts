/**
 * Supabase service-role client. Bypasses Row Level Security entirely — only
 * for server-side moderation/account-deletion code paths that must act
 * across all members' data (the /portal/business Community moderation tab,
 * and community account hard-deletion). Never import this from client
 * components or expose it to the browser.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
