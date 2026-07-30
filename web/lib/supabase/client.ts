/**
 * Supabase browser client for Community auth (signUp/signInWithPassword/
 * resetPasswordForEmail/signOut). Uses the public anon key only — never the
 * service role key, which must stay server-only.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
