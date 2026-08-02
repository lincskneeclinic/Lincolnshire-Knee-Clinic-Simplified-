import { createAdminClient } from "@/lib/supabase/admin";

export type MetaPlatform = "facebook" | "instagram";

export interface MetaConnectedAccount {
  id: string;
  platform: MetaPlatform;
  account_id: string;
  account_name: string | null;
  access_token: string;
  token_expires_at: string | null;
  connected_at: string;
}

/** Connection status only — never returns access_token to a caller that renders to the client. */
export interface MetaConnectedAccountStatus {
  platform: MetaPlatform;
  account_name: string | null;
  connected_at: string;
}

export async function getConnectedAccountStatuses(): Promise<MetaConnectedAccountStatus[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("meta_connected_accounts")
      .select("platform, account_name, connected_at")
      .order("connected_at", { ascending: false });
    if (error || !data) return [];
    return data as MetaConnectedAccountStatus[];
  } catch (err) {
    console.error("Failed to read connected Meta accounts:", err);
    return [];
  }
}

/** Server-only lookup — includes the access token, never expose this response to the client. */
export async function getAccountForPlatform(platform: MetaPlatform): Promise<MetaConnectedAccount | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("meta_connected_accounts")
      .select("*")
      .eq("platform", platform)
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as MetaConnectedAccount;
  } catch (err) {
    console.error(`Failed to read connected Meta account for "${platform}":`, err);
    return null;
  }
}

/** Throws on failure so the OAuth callback route can surface a clear error. */
export async function saveConnectedAccount(account: {
  platform: MetaPlatform;
  account_id: string;
  account_name: string | null;
  access_token: string;
  token_expires_at: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("meta_connected_accounts").upsert(
    {
      platform: account.platform,
      account_id: account.account_id,
      account_name: account.account_name,
      access_token: account.access_token,
      token_expires_at: account.token_expires_at,
    },
    { onConflict: "platform,account_id" }
  );
  if (error) {
    throw new Error(`Failed to save connected ${account.platform} account: ${error.message}`);
  }
}
