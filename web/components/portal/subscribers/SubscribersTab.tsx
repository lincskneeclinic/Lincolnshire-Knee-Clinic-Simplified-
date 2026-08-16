"use client";

import React from "react";
import { PortalCard, PortalEmptyState } from "@/components/portal/ui";
import { formatDateSafe } from "@/lib/formatDate";

export interface Subscriber {
  id?: string;
  name?: string;
  email?: string;
  primaryInterest?: string;
  consentGivenAt?: string;
}

interface SubscribersTabProps {
  totalSignups: number;
  search: string;
  onSearchChange: (value: string) => void;
  hasAnySubscribers: boolean;
  filteredSubscribers: Subscriber[];
  onExportCsv: () => void;
}

export function SubscribersTab({
  totalSignups,
  search,
  onSearchChange,
  hasAnySubscribers,
  filteredSubscribers,
  onExportCsv,
}: SubscribersTabProps) {
  return (
    <div className="space-y-8">
      <PortalCard className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-portal-text">Verified Subscriber Directory</h2>
            <p className="text-xs text-portal-text/60">Total signups: {totalSignups}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name or email…"
              className="bg-portal-surface-alt border border-portal-border/20 text-portal-text text-xs rounded-lg px-3 py-2 focus:border-clinical-teal focus:outline-none w-full sm:w-56"
            />
            <button
              onClick={onExportCsv}
              disabled={filteredSubscribers.length === 0}
              className="bg-portal-surface-alt hover:bg-portal-text/5 text-portal-accent-text border border-clinical-teal/40 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {!hasAnySubscribers ? (
          <PortalEmptyState message="No subscribers yet." />
        ) : filteredSubscribers.length === 0 ? (
          <PortalEmptyState message={`No subscribers match "${search}".`} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-portal-border/10">
            <table className="min-w-full divide-y divide-portal-border/10 text-xs">
              <thead className="bg-portal-surface-alt">
                <tr>
                  <th className="px-4 py-2.5 text-left font-bold text-portal-text/70 uppercase tracking-wider text-[10px]">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-portal-text/70 uppercase tracking-wider text-[10px]">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-portal-text/70 uppercase tracking-wider text-[10px]">
                    Primary Interest
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-portal-text/70 uppercase tracking-wider text-[10px]">
                    Consent Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portal-border/5">
                {filteredSubscribers.map((s, idx) => (
                  <tr key={s.id || s.email || idx} className="hover:bg-portal-text/5 transition-colors">
                    <td className="px-4 py-2.5 text-portal-text/90 font-medium whitespace-nowrap">{s.name || "—"}</td>
                    <td className="px-4 py-2.5 text-portal-text/70 whitespace-nowrap">{s.email || "—"}</td>
                    <td className="px-4 py-2.5 text-portal-text/70 whitespace-nowrap">{s.primaryInterest || "—"}</td>
                    <td className="px-4 py-2.5 text-portal-text/50 font-mono whitespace-nowrap">
                      {s.consentGivenAt ? formatDateSafe(s.consentGivenAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
