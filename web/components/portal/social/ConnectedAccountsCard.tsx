"use client";

import React, { useEffect, useState } from "react";

interface AccountStatus {
  platform: "facebook" | "instagram";
  account_name: string | null;
  connected_at: string;
}

/**
 * Shows whether the clinic's Facebook Page / linked Instagram Business account
 * are connected for real post-performance tracking, with a "Connect" button
 * that starts the Meta OAuth flow. Self-contained (fetches its own status),
 * matching this file tree's convention of local state for anything that
 * doesn't need to be shared elsewhere in the dashboard.
 */
export function ConnectedAccountsCard() {
  const [accounts, setAccounts] = useState<AccountStatus[] | null>(null);

  useEffect(() => {
    fetch("/api/portal/meta/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAccounts(data.accounts);
      })
      .catch(() => {});
  }, []);

  if (accounts === null) return null;

  const facebook = accounts.find((a) => a.platform === "facebook");
  const instagram = accounts.find((a) => a.platform === "instagram");

  return (
    <div className="bg-portal-surface-alt border border-portal-border/10 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-portal-text/50">Meta connection:</span>
        <span className={`text-[11px] font-semibold ${facebook ? "text-portal-accent-text" : "text-portal-text/40"}`}>
          {facebook ? `✓ Facebook — ${facebook.account_name}` : "Facebook not connected"}
        </span>
        <span className={`text-[11px] font-semibold ${instagram ? "text-portal-accent-text" : "text-portal-text/40"}`}>
          {instagram ? `✓ Instagram — ${instagram.account_name}` : "Instagram not connected"}
        </span>
      </div>
      <a
        href="/api/portal/meta/connect"
        className="bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
      >
        {facebook || instagram ? "Reconnect" : "Connect Facebook / Instagram"}
      </a>
    </div>
  );
}
