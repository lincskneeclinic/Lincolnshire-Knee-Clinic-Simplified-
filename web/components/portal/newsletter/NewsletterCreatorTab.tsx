"use client";

import React from "react";
import { PortalCard, PortalModal, PortalEmptyState } from "@/components/portal/ui";

const SUGGESTED_TOPICS = [
  "PRP Injections vs Cortisone for Knee Osteoarthritis",
  "Arthrosamid for Knee Joint Preservation",
  "Timeline and Exercises for ACL Post-Op Recovery",
  "How to Manage Baker's Cyst Pain at Home",
  "Understanding Meniscus Tears: Surgery vs Rehab",
  "General Knee Health & Preservation Tips",
];

interface NewsletterCreatorTabProps {
  activeSubscribersCount: number;
  isGeneratingDigest: boolean;
  onGenerateDigest: () => void;
  newTopic: string;
  onNewTopicChange: (value: string) => void;
  includeResearch: boolean;
  onIncludeResearchChange: (value: boolean) => void;
  isGeneratingNewsletter: boolean;
  onGenerateNewsletter: () => void;
  loading: boolean;
  editions: any[];
  selectedNewsletter: any | null;
  onSelectForEdit: (edition: any) => void;
  onDeleteNewsletter: (editionId: string) => void;
  editSubject: string;
  editMarkdown: string;
  onUpdateContent: (subject: string, markdown: string) => void;
  htmlPreview: string;
  showSendConfirm: boolean;
  onShowSendConfirmChange: (value: boolean) => void;
  isSending: boolean;
  onSendNewsletter: () => void;
  subscribers?: any[];
  selectedSendTopic?: string;
  onSelectedSendTopicChange?: (value: string) => void;
  selectedSendPatient?: string;
  onSelectedSendPatientChange?: (value: string) => void;
}

export function NewsletterCreatorTab({
  activeSubscribersCount,
  isGeneratingDigest,
  onGenerateDigest,
  newTopic,
  onNewTopicChange,
  includeResearch,
  onIncludeResearchChange,
  isGeneratingNewsletter,
  onGenerateNewsletter,
  loading,
  editions,
  selectedNewsletter,
  onSelectForEdit,
  onDeleteNewsletter,
  editSubject,
  editMarkdown,
  onUpdateContent,
  htmlPreview,
  showSendConfirm,
  onShowSendConfirmChange,
  isSending,
  onSendNewsletter,
  subscribers = [],
  selectedSendTopic = "all",
  onSelectedSendTopicChange = () => {},
  selectedSendPatient = "all",
  onSelectedSendPatientChange = () => {},
}: NewsletterCreatorTabProps) {
  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-portal-text">Clinical Newsletter Creator</h2>
          <p className="text-xs text-portal-text/60 mt-1">
            Draft evidence-based patient newsletters using PubMed research and distribute directly to your
            subscribed audience.
          </p>
        </div>
        <div className="bg-portal-surface-alt border border-portal-border/10 px-4 py-2 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-portal-accent-text tracking-wider block">Audience Size</span>
          <span className="text-lg font-mono font-bold text-portal-text">{activeSubscribersCount} active subscribers</span>
        </div>
      </PortalCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Planner and List column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Monthly Digest Generator */}
          <PortalCard padding="md" className="border-clinical-teal/30 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-portal-text">Monthly Digest</h3>
              <p className="text-[11px] text-portal-text/60 mt-1">
                Auto-composed from this month's blog posts, top patient questions, and the newsletter poll — plus
                one rotating educational tip.
              </p>
            </div>
            <button
              type="button"
              onClick={onGenerateDigest}
              disabled={isGeneratingDigest}
              className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all ${
                isGeneratingDigest
                  ? "bg-white/10 text-portal-text/40 cursor-not-allowed"
                  : "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
              }`}
            >
              {isGeneratingDigest ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Composing Digest...
                </>
              ) : (
                "✨ Generate Monthly Digest"
              )}
            </button>
          </PortalCard>

          {/* Draft Generator Form */}
          <PortalCard padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-portal-text">Generate Single-Topic Draft</h3>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-portal-text/80">Newsletter Topic / Clinical Question</label>
              <textarea
                rows={3}
                value={newTopic}
                onChange={(e) => onNewTopicChange(e.target.value)}
                placeholder="e.g., Viscosupplementation vs Steroids for Knee OA, or recovery tips after Meniscus rehab"
                className="w-full bg-portal-surface-alt border border-portal-border/15 text-portal-text placeholder-portal-text/40 text-xs rounded-xl p-3 focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={includeResearch}
                onChange={(e) => onIncludeResearchChange(e.target.checked)}
                className="w-4 h-4 accent-clinical-teal cursor-pointer"
              />
              <span className="text-xs text-portal-text/90">Perform PubMed Research &amp; Cite Studies</span>
            </label>

            <button
              type="button"
              onClick={onGenerateNewsletter}
              disabled={isGeneratingNewsletter || !newTopic.trim()}
              className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all ${
                isGeneratingNewsletter || !newTopic.trim()
                  ? "bg-white/10 text-portal-text/40 cursor-not-allowed"
                  : "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
              }`}
            >
              {isGeneratingNewsletter ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Analyzing PubMed & Writing...
                </>
              ) : (
                "✨ Generate Newsletter Draft"
              )}
            </button>
          </PortalCard>

          {/* Suggested Patient Topics */}
          <PortalCard padding="md" className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-portal-accent-text tracking-wider">Suggested Clinic Topics</h3>
            <div className="space-y-2">
              {SUGGESTED_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onNewTopicChange(t)}
                  className="w-full text-left bg-portal-surface-alt hover:bg-portal-text/5 border border-portal-border/5 hover:border-portal-border/10 text-portal-text/90 text-xs p-2.5 rounded-xl transition-all block cursor-pointer"
                >
                  💡 {t}
                </button>
              ))}
            </div>
          </PortalCard>

          {/* History & Drafts List */}
          <PortalCard padding="md" className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-portal-accent-text tracking-wider">Newsletter History &amp; Drafts</h3>
            {loading ? (
              <div className="text-center text-portal-text/40 text-xs py-8">Loading history...</div>
            ) : editions.length === 0 ? (
              <PortalEmptyState message="No drafts or sent editions." />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {editions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectForEdit(item)}
                    className={`p-3 border rounded-xl transition-all cursor-pointer text-left ${
                      selectedNewsletter?.id === item.id
                        ? "bg-clinical-teal/10 border-clinical-teal"
                        : "bg-portal-surface-alt border-portal-border/5 hover:border-portal-border/10"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] text-portal-text/50 mb-1.5">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.status === "sent" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    </div>
                    <h4 className="font-bold text-portal-text text-xs truncate">{item.subject}</h4>
                    <p className="text-[10px] text-portal-text/60 truncate mt-1">Topic: {item.topic}</p>
                    {item.status === "sent" && (
                      <p className="text-[9px] text-emerald-400 font-mono mt-1">✓ Sent to {item.recipientsCount} patients</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        {/* Side-by-Side Live Editor & Preview */}
        <div className="lg:col-span-8">
          {selectedNewsletter ? (
            <PortalCard className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-portal-border/10">
                <div>
                  <span className="text-[10px] font-bold text-portal-accent-text uppercase tracking-wider block">Editing Newsletter Draft</span>
                  <span className="text-portal-text text-xs font-mono font-bold">{selectedNewsletter.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onDeleteNewsletter(selectedNewsletter.id)}
                    className="text-portal-text/60 hover:text-rose-400 text-xs px-3 py-1.5 rounded-lg border border-portal-border/10 hover:border-rose-500/30 transition-all cursor-pointer"
                  >
                    {selectedNewsletter.status === "sent" ? "🗑️ Remove from Website" : "Discard Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowSendConfirmChange(true)}
                    className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    {selectedNewsletter.status === "draft" ? "🚀 Send Newsletter" : "🔁 Send Again"}
                  </button>
                </div>
              </div>

              {/* Subject Editor */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-portal-text/80">Email Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => onUpdateContent(e.target.value, editMarkdown)}
                  disabled={selectedNewsletter.status === "sent"}
                  className="w-full bg-portal-surface-alt border border-portal-border/15 text-portal-text text-xs rounded-xl p-3 focus:outline-none focus:border-clinical-teal"
                />
              </div>

              {/* Markdown / Live HTML Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Markdown Text Area */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-portal-text/80">Newsletter Body (Markdown)</label>
                  <textarea
                    rows={16}
                    value={editMarkdown}
                    onChange={(e) => onUpdateContent(editSubject, e.target.value)}
                    disabled={selectedNewsletter.status === "sent"}
                    placeholder="Draft your newsletter text here..."
                    className="w-full h-[400px] bg-portal-surface-alt border border-portal-border/15 text-portal-text placeholder-portal-text/30 text-xs font-mono rounded-xl p-4 focus:outline-none focus:border-clinical-teal"
                  />
                </div>

                {/* Live HTML Inbox Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-portal-text/80">Inbox Preview (HTML Rendering)</label>
                  <div className="w-full h-[400px] bg-[#f8fafc] border border-portal-border/10 rounded-xl overflow-y-auto">
                    {htmlPreview ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-20">Preview renders dynamically as you type.</div>
                    )}
                  </div>
                </div>
              </div>
            </PortalCard>
          ) : (
            <div className="h-full min-h-[400px] bg-portal-surface border border-portal-border/10 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-4xl">✉️</span>
              <h3 className="font-bold text-portal-text text-sm">No Newsletter Selected</h3>
              <p className="text-xs text-portal-text/60 max-w-sm">
                Select a newsletter draft from the history list or generate a new one from the generator panel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Campaign Distribution Confirmation Modal */}
      <PortalModal isOpen={showSendConfirm && !!selectedNewsletter} maxWidth="md">
        {selectedNewsletter && (
          <>
            <div className="text-center space-y-2">
              <span className="text-4xl block">📣</span>
              <h3 className="font-serif text-lg font-bold text-portal-text">
                {selectedNewsletter.status === "sent" ? "Confirm Resend" : "Confirm Distribution"}
              </h3>
              <p className="text-xs text-portal-text/70">
                You are about to distribute the newsletter **"{selectedNewsletter.subject}"**.
              </p>
              {selectedNewsletter.status === "sent" && (
                <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 mt-2">
                  ⚠️ This was already sent to {selectedNewsletter.recipientsCount} patient
                  {selectedNewsletter.recipientsCount === 1 ? "" : "s"} on{" "}
                  {selectedNewsletter.dateSent ? new Date(selectedNewsletter.dateSent).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "an earlier date"}.
                  Sending again will email every currently active subscriber a second time.
                </p>
              )}
            </div>

            {/* Target Selection Selectors */}
            <div className="space-y-4 mt-6 text-left border border-portal-border/10 rounded-xl p-4 bg-portal-surface-alt">
              <h4 className="text-xs uppercase font-bold text-portal-accent-text tracking-wider">Target Recipients</h4>
              
              {/* Send Mode Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-portal-text/80">Recipient Segment</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectedSendPatientChange("all");
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSendPatient === "all"
                        ? "bg-clinical-teal border-clinical-teal text-white font-bold"
                        : "bg-white/5 border-portal-border/15 text-portal-text/70 hover:bg-portal-text/10"
                    }`}
                  >
                    Group Segment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (subscribers.length > 0) {
                        onSelectedSendPatientChange(subscribers[0].email);
                      } else {
                        onSelectedSendPatientChange("none");
                      }
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSendPatient !== "all"
                        ? "bg-clinical-teal border-clinical-teal text-white font-bold"
                        : "bg-white/5 border-portal-border/15 text-portal-text/70 hover:bg-portal-text/10"
                    }`}
                  >
                    Individual Patient
                  </button>
                </div>
              </div>

              {selectedSendPatient === "all" ? (
                /* Segment Dropdown Selector */
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-portal-text/80">Filter by Topic Interest</label>
                  <select
                    value={selectedSendTopic}
                    onChange={(e) => onSelectedSendTopicChange(e.target.value)}
                    className="w-full bg-portal-surface border border-portal-border/15 text-portal-text text-xs rounded-lg p-2 focus:outline-none focus:border-clinical-teal"
                  >
                    <option value="all">All Subscribed Patients ({activeSubscribersCount})</option>
                    {Array.from(new Set(subscribers.map(s => s.primary_interest || "General Knee Health"))).map((interest) => (
                      <option key={interest} value={interest}>
                        Interested in: {interest} ({subscribers.filter(s => s.primary_interest === interest).length})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Patient Dropdown Selector */
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-portal-text/80">Select Patient</label>
                  <select
                    value={selectedSendPatient}
                    onChange={(e) => onSelectedSendPatientChange(e.target.value)}
                    className="w-full bg-portal-surface border border-portal-border/15 text-portal-text text-xs rounded-lg p-2 focus:outline-none focus:border-clinical-teal"
                  >
                    {subscribers.map((sub) => (
                      <option key={sub.email} value={sub.email}>
                        {sub.name} &lt;{sub.email}&gt; (Pref: {sub.primary_interest || "General Knee Health"})
                      </option>
                    ))}
                    {subscribers.length === 0 && (
                      <option value="none" disabled>No subscribers found</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Campaign Summary */}
            <div className="bg-portal-surface-alt border border-portal-border/5 rounded-xl p-4 space-y-3 mt-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-portal-text/60">Campaign Topic:</span>
                <span className="text-portal-text font-bold">{selectedNewsletter.topic}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-portal-text/60">Target:</span>
                <span className="text-portal-accent-text font-bold">
                  {selectedSendPatient !== "all"
                    ? `Patient: ${subscribers.find(s => s.email === selectedSendPatient)?.name || "Selected Patient"}`
                    : selectedSendTopic === "all"
                    ? "All Subscribed Patients"
                    : `Topic: ${selectedSendTopic}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-portal-text/60">Recipient Count:</span>
                <span className="text-portal-accent-text font-mono font-bold">
                  {selectedSendPatient !== "all"
                    ? "1 patient"
                    : selectedSendTopic === "all"
                    ? `${activeSubscribersCount} active subscribers`
                    : `${subscribers.filter(s => s.primary_interest === selectedSendTopic).length} active subscribers`}
                </span>
              </div>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/25 text-teal-400 text-[10px] leading-relaxed p-3.5 rounded-xl mt-4">
              🔒 **Clinical Guidelines Enforcement**: The newsletter contents utilize layman's terms with
              jargon-control filters and direct consultation booking links for patient safety.
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => onShowSendConfirmChange(false)}
                className="flex-1 bg-white/10 hover:bg-portal-text/15 text-portal-text text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSendNewsletter}
                disabled={isSending}
                className="flex-1 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Distributing...
                  </>
                ) : (
                  "Confirm Send"
                )}
              </button>
            </div>
          </>
        )}
      </PortalModal>
    </div>
  );
}
