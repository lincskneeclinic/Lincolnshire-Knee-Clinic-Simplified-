/**
 * Drop-in replacement for the local web/data/*.json "database" files
 * previously read/written via fs.readFileSync/writeFileSync. Those files
 * don't persist reliably on serverless hosting (ephemeral/read-only
 * filesystem, concurrent-write races) — this stores the same JSON shapes in
 * a Supabase table (app_kv_store) instead, keyed by the former filename.
 *
 * Server-only — uses the service-role client (lib/supabase/admin.ts).
 */
import { createAdminClient } from "@/lib/supabase/admin";

export async function getStoreValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("app_kv_store").select("value").eq("key", key).maybeSingle();
    if (error || !data) return fallback;
    return data.value as T;
  } catch (error) {
    console.error(`Failed to read app_kv_store["${key}"]:`, error);
    return fallback;
  }
}

export async function setStoreValue(key: string, value: unknown): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("app_kv_store")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) {
      console.error(`Failed to write app_kv_store["${key}"]:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Failed to write app_kv_store["${key}"]:`, error);
    return false;
  }
}
