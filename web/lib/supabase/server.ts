/**
 * Supabase server client for Server Components and Community API route
 * handlers. Reads the logged-in user's session from cookies, so queries
 * made with this client are subject to the community_* RLS policies as
 * that user (auth.uid()). Uses the public anon key, never the service role key.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component (not a Route Handler or
            // Server Action) — cookies can't be written here. Safe to ignore
            // as long as the middleware session refresh is also running.
          }
        },
      },
    }
  );
}
