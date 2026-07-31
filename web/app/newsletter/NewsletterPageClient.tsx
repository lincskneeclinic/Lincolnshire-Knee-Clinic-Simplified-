"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export default function NewsletterPageClient() {
  const [activeMode, setActiveMode] = useState<"subscribe" | "archive" | "unsubscribe">("subscribe");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [primaryInterest, setPrimaryInterest] = useState("Injections & Preservation");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Knee Preservation & Non-Surgical Injections (Arthrosamid / PRP)",
    "General Knee Health",
  ]);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [dynamicTopicsList, setDynamicTopicsList] = useState<any[]>([]);
  const [archiveList, setArchiveList] = useState<any[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [unsubscribeStatus, setUnsubscribeStatus] = useState("");
  const [isSubmittingUnsubscribe, setIsSubmittingUnsubscribe] = useState(false);
  const [unsubscribeSuccess, setUnsubscribeSuccess] = useState(false);

  // Fetch dynamic topics & archive on mount
  useEffect(() => {
    // Fetch top topics
    fetch("/api/newsletter/topics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.topics) {
          // Replace any old topic label if it comes from the DB
          const cleaned = res.topics.map((t: any) => {
            if (t.id === "topic-4" || t.label.includes("General Joint Health")) {
              return { ...t, label: "General Knee Health", category: "General Knee Health" };
            }
            return t;
          });
          setDynamicTopicsList(cleaned);
        }
      })
      .catch((err) => console.error("Failed to load topics:", err));

    // Fetch archives
    setArchiveLoading(true);
    fetch("/api/newsletter/archive")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.archives) {
          setArchiveList(res.archives);
        }
      })
      .catch((err) => console.error("Failed to load archive:", err))
      .finally(() => setArchiveLoading(false));

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isUnsub = urlParams.get("unsubscribe") === "true";
      const emailParam = urlParams.get("email");

      if (isUnsub) {
        setActiveMode("unsubscribe");
        if (emailParam) {
          setUnsubscribeEmail(emailParam);
          setIsSubmittingUnsubscribe(true);
          setUnsubscribeStatus("Processing unsubscribe request...");
          fetch("/api/newsletter/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailParam }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.success) {
                setUnsubscribeSuccess(true);
                setUnsubscribeStatus(data.message || "Your email address has been successfully unsubscribed.");
              } else {
                setUnsubscribeStatus(data.message || "Failed to unsubscribe. Please try again.");
              }
            })
            .catch((err) => {
              console.error("Auto unsubscribe failed:", err);
              setUnsubscribeStatus("Network error occurred during unsubscription.");
            })
            .finally(() => {
              setIsSubmittingUnsubscribe(false);
            });
        }
        return;
      }

      const referrer = document.referrer || window.location.href;
      if (referrer.includes("replacement") || referrer.includes("arthroplasty")) {
        setPrimaryInterest("Knee Replacement & Surgery");
        setSelectedTopics((prev) => [
          "Surgical Options & Recovery (Total & Partial Knee Replacement)",
          ...prev,
        ]);
      } else if (referrer.includes("acl") || referrer.includes("sports")) {
        setPrimaryInterest("Sports Injuries & ACL");
        setSelectedTopics((prev) => [
          "Sports Knee Injuries & Ligament Rehab (ACL / Meniscus)",
          ...prev,
        ]);
      } else if (referrer.includes("injection") || referrer.includes("arthrosamid")) {
        setPrimaryInterest("Injections & Preservation");
        setSelectedTopics((prev) => [
          "Knee Preservation & Non-Surgical Injections (Arthrosamid / PRP)",
          ...prev,
        ]);
      }
    }
  }, []);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatusMsg("Please enter a valid email address.");
      return;
    }
    if (!gdprConsent) {
      setStatusMsg("Please confirm your GDPR consent by checking the box below.");
      return;
    }

    setIsSubmitting(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          primaryInterest,
          topics: selectedTopics,
          pagesVisited: [window.location.pathname],
          consentChecked: gdprConsent,
          consentSource: "newsletter-page-detailed-form",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setStatusMsg("Thank you for subscribing! You will receive tailored knee care updates.");
      } else {
        setStatusMsg(data.message || data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubscribeEmail || !unsubscribeEmail.includes("@")) {
      setUnsubscribeStatus("Please enter a valid email address.");
      return;
    }

    setIsSubmittingUnsubscribe(true);
    setUnsubscribeStatus("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unsubscribeEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUnsubscribeSuccess(true);
        setUnsubscribeStatus(data.message);
      } else {
        setUnsubscribeStatus(data.message || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUnsubscribeStatus("Network error. Please try again later.");
    } finally {
      setIsSubmittingUnsubscribe(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Newsletter Subscription" }]} />

      <PageHeader
        category="Patient Education & Updates"
        title="Specialist Knee Care & Medical Updates"
        subtitle="Subscribe to receive evidence-based clinical articles, non-surgical injection research, and post-op recovery guides tailored to your knee condition."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-10">
        {/* Subscription Form Card */}
        <div className="lg:col-span-7 bg-white border border-border-clinical rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Sub-Tab Mode Navigation */}
          <div className="flex border-b border-border-clinical gap-4 pb-2">
            <button
              type="button"
              onClick={() => {
                setActiveMode("subscribe");
                setStatusMsg("");
              }}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                activeMode === "subscribe"
                  ? "border-clinical-teal text-clinical-teal font-bold"
                  : "border-transparent text-text-secondary hover:text-deep-navy"
              }`}
            >
              Subscribe to Updates
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode("archive");
                setStatusMsg("");
              }}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                activeMode === "archive"
                  ? "border-clinical-teal text-clinical-teal font-bold"
                  : "border-transparent text-text-secondary hover:text-deep-navy"
              }`}
            >
              Past Newsletters
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode("unsubscribe");
                setStatusMsg("");
              }}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                activeMode === "unsubscribe"
                  ? "border-clinical-teal text-clinical-teal font-bold"
                  : "border-transparent text-text-secondary hover:text-deep-navy"
              }`}
            >
              Unsubscribe
            </button>
          </div>

          {activeMode === "subscribe" ? (
            isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl">
                  ✓
                </div>
                <h2 className="font-serif text-2xl font-bold text-deep-navy">Subscription Confirmed!</h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name || "Patient"}</strong>. We have registered <strong>{email}</strong> for tailored clinical updates on <strong>{primaryInterest}</strong>.
                </p>
                <div className="pt-4 space-y-3">
                  <Link
                    href="/education"
                    className="bg-clinical-teal text-white font-bold text-sm py-3 px-6 rounded-xl hover:bg-clinical-teal-hover transition-colors inline-block"
                  >
                    Explore Knee Knowledge Hub →
                  </Link>
                  <p className="text-[10px] text-text-muted">
                    Made a mistake? You can{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("unsubscribe");
                        setUnsubscribeEmail(email);
                      }}
                      className="text-clinical-teal hover:underline font-bold"
                    >
                      unsubscribe here
                    </button>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-deep-navy mb-1">Tailored Patient Newsletter</h2>
                  <p className="text-xs text-text-secondary">
                    Select the topics you are interested in so we can send relevant clinical updates.
                  </p>
                </div>

                {/* Topic Selection Checkboxes */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-deep-navy uppercase tracking-wider">
                    Select Your Topics of Interest
                  </label>

                  {(dynamicTopicsList.length > 0
                    ? dynamicTopicsList
                    : [
                        {
                          id: "topic-1",
                          label: "Knee Preservation & Non-Surgical Injections (Arthrosamid / PRP)",
                          category: "Injections & Preservation",
                        },
                        {
                          id: "topic-2",
                          label: "Surgical Options & Recovery (Total & Partial Knee Replacement)",
                          category: "Knee Replacement & Surgery",
                        },
                        {
                          id: "topic-3",
                          label: "Sports Knee Injuries & Ligament Rehab (ACL / Meniscus)",
                          category: "Sports Injuries & ACL",
                        },
                        {
                          id: "topic-4",
                          label: "General Knee Health",
                          category: "General Knee Health",
                        },
                      ]
                  ).map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        selectedTopics.includes(item.label)
                          ? "bg-pale-clinical-blue border-clinical-teal"
                          : "bg-white border-border-clinical hover:border-text-secondary"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(item.label)}
                          onChange={() => {
                            handleTopicToggle(item.label);
                            if (item.category) setPrimaryInterest(item.category);
                          }}
                          className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
                        />
                        <span className="text-xs font-semibold text-text-main leading-snug">{item.label}</span>
                      </div>
                      {item.isAiDiscovered && (
                        <span className="bg-cyan-500/10 text-clinical-teal border border-clinical-teal/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                          ★ Patient Trending
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Contact Inputs */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label htmlFor="patient-name" className="block text-xs font-semibold text-text-main mb-1.5">
                      Your Name (Optional)
                    </label>
                    <input
                      id="patient-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Smith"
                      className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <div>
                    <label htmlFor="patient-email" className="block text-xs font-semibold text-text-main mb-1.5">
                      Email Address <span className="text-status-error">*</span>
                    </label>
                    <input
                      id="patient-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jane.smith@example.com"
                      className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
                    />
                  </div>
                </div>

                {/* Mandatory UK GDPR Opt-In Checkbox */}
                <div className="p-4 bg-pale-clinical-blue border border-clinical-teal/30 rounded-xl space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-main">
                    <input
                      type="checkbox"
                      required
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-clinical-teal rounded border-border-clinical focus:ring-clinical-teal shrink-0"
                    />
                    <span>
                      <strong>UK GDPR Consent:</strong> I agree to receive occasional clinical updates, joint health research, and educational newsletters from Lincolnshire Knee Clinic. I understand I can unsubscribe at any time using the link in any email.
                    </span>
                  </label>
                </div>

                {statusMsg && (
                  <div className="bg-status-error-bg border border-[#FAD8D8] text-status-error text-xs p-3 rounded-xl font-medium">
                    {statusMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !gdprConsent}
                  className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 ${
                    gdprConsent
                      ? "bg-clinical-teal hover:bg-clinical-teal-hover text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe to Tailored Updates →"}
                </button>

                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  🔒 We respect your privacy under the UK Data Protection Act 2018. Unsubscribe at any time with 1 click.
                </p>
              </form>
            )
          ) : activeMode === "archive" ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-navy mb-1">Previous Newsletters & Clinical Updates</h2>
                <p className="text-xs text-text-secondary">
                  Browse past releases and research bulletins compiled by Lincolnshire Knee Clinic specialists.
                </p>
              </div>

              {archiveLoading ? (
                <div className="text-center text-text-secondary text-xs py-12 flex flex-col items-center justify-center gap-2">
                  <span className="w-6 h-6 border-2 border-clinical-teal border-t-transparent rounded-full animate-spin" />
                  <span>Loading past editions…</span>
                </div>
              ) : archiveList.length === 0 ? (
                <div className="text-center text-text-secondary text-xs py-12 bg-warm-off-white border border-dashed border-border-clinical rounded-xl">
                  No previous editions available.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {archiveList.map((item: any) => (
                    <div key={item.slug} className="p-4 bg-warm-off-white border border-border-clinical hover:border-clinical-teal/50 rounded-xl space-y-2 hover:shadow-xs transition-all duration-200">
                      <div className="flex justify-between items-center text-[10px] text-text-secondary">
                        <span className="bg-pale-clinical-blue text-clinical-teal border border-clinical-teal/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{item.category}</span>
                        <span className="font-mono">{new Date(item.dateSent).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-deep-navy leading-snug">{item.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{item.excerpt}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-text-muted font-mono">{item.readTime} read</span>
                        <Link href={item.url} target="_blank" className="text-clinical-teal hover:text-clinical-teal-hover hover:underline text-xs font-bold flex items-center gap-1">
                          Read Full Update →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-navy mb-1">Unsubscribe from Clinical Updates</h2>
                <p className="text-xs text-text-secondary">
                  Enter your email address below to stop receiving clinical newsletters, joint preservation research updates, and recovery guides.
                </p>
              </div>

              {unsubscribeSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center mx-auto text-slate-700 text-2xl font-bold">
                    ✓
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-deep-navy">You Have Been Unsubscribed</h2>
                  <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                    {unsubscribeStatus || "Your email address has been successfully unsubscribed from Lincolnshire Knee Clinic marketing updates."}
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("subscribe");
                        setUnsubscribeSuccess(false);
                        setUnsubscribeEmail("");
                        setUnsubscribeStatus("");
                      }}
                      className="bg-clinical-teal text-white font-bold text-sm py-3 px-6 rounded-xl hover:bg-clinical-teal-hover transition-colors inline-block cursor-pointer"
                    >
                      Resubscribe to Newsletters
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUnsubscribeSubmit} className="space-y-4">
                  {unsubscribeStatus && (
                    <div className={`text-xs p-3 border rounded-xl font-semibold ${
                      unsubscribeStatus.toLowerCase().includes("processing")
                        ? "bg-pale-clinical-blue border-clinical-teal/30 text-clinical-teal"
                        : "bg-status-error-bg border-[#FAD8D8] text-status-error"
                    }`}>
                      {unsubscribeStatus}
                    </div>
                  )}

                  <div>
                    <label htmlFor="unsub-email" className="block text-xs font-semibold text-text-main mb-1.5">
                      Email Address <span className="text-status-error">*</span>
                    </label>
                    <input
                      id="unsub-email"
                      type="email"
                      required
                      value={unsubscribeEmail}
                      onChange={(e) => setUnsubscribeEmail(e.target.value)}
                      placeholder="e.g. jane.smith@example.com"
                      className="w-full px-4 py-2.5 text-sm bg-warm-off-white border border-border-clinical rounded-xl text-text-main focus:outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUnsubscribe}
                    className="w-full bg-deep-navy hover:bg-clinical-teal text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingUnsubscribe ? "Processing Request..." : "Unsubscribe from All Updates"}
                  </button>

                  <p className="text-[11px] text-text-muted text-center leading-relaxed">
                    We respect your privacy. You can unsubscribe at any time. Once unsubscribed, we immediately cease all automated patient marketing communications.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Clinical Value & Benefits Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-soft-blue border border-clinical-teal/20 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-deep-navy">Why Subscribe?</h3>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li className="flex items-start gap-2.5">
                <span className="text-clinical-teal font-bold text-base">✓</span>
                <span><strong>Consultant-Reviewed Content</strong>: Written and verified by specialist knee surgeons and clinical teams.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-clinical-teal font-bold text-base">✓</span>
                <span><strong>Latest Clinical Evidence</strong>: Stay informed on single-dose Hydrogel injections (Arthrosamid) and biologic therapies (PRP).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-clinical-teal font-bold text-base">✓</span>
                <span><strong>Recovery & Rehab Guides</strong>: Exercise routines, return-to-sport protocols, and post-op care schedules.</span>
              </li>
            </ul>
          </div>

          {/* Patient Testimonial Quote */}
          <div className="bg-white border border-border-clinical rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="text-amber-400 font-bold text-sm">★★★★★</div>
            <p className="text-xs text-text-main italic leading-relaxed">
              "The tailored emails gave me clear, realistic expectations before my joint preservation injection. Extremely informative and reassuring."
            </p>
            <div className="text-[11px] text-text-muted font-bold">— Verified Patient, Lincolnshire</div>
          </div>

          {/* Interactive Patient Topic Poll Widget */}
          <NewsletterPollWidget />

          {/* Community cross-link */}
          <div className="bg-white border border-border-clinical rounded-2xl p-6 space-y-3 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-deep-navy">Join the Patient Community</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Prefer discussing your knee health with other patients rather than receiving
              emails? Our Community area has discussion rooms for topics like osteoarthritis,
              sports injuries, surgery recovery and more. Newsletter subscription is entirely
              optional there.
            </p>
            <Link
              href="/community"
              className="inline-block bg-deep-navy hover:bg-clinical-teal text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Explore the Community →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsletterPollWidget() {
  const [pollVoted, setPollVoted] = useState(false);
  const [votedOption, setVotedOption] = useState("");
  const [customSuggestion, setCustomSuggestion] = useState("");
  const [isSubmittingPoll, setIsSubmittingPoll] = useState(false);

  const handleVote = async (optText: string) => {
    setIsSubmittingPoll(true);
    try {
      await fetch("/api/newsletter/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optText }),
      });
      setVotedOption(optText);
      setPollVoted(true);
    } catch (err) {
      console.error("Poll vote error:", err);
    } finally {
      setIsSubmittingPoll(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSuggestion.trim()) return;
    setIsSubmittingPoll(true);
    try {
      await fetch("/api/newsletter/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customSuggestion }),
      });
      setVotedOption(`"${customSuggestion.trim()}"`);
      setPollVoted(true);
    } catch (err) {
      console.error("Poll suggestion error:", err);
    } finally {
      setIsSubmittingPoll(false);
    }
  };

  return (
    <div className="bg-white border border-clinical-teal/30 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-clinical-teal animate-pulse" />
        <h3 className="font-serif text-base font-bold text-deep-navy">What Should Our Consultant Cover Next?</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        Vote for the topic you would like our specialist knee surgeons to explain in an upcoming newsletter edition:
      </p>

      {pollVoted ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
          <div className="text-emerald-700 font-bold text-xs">✓ Vote Registered!</div>
          <p className="text-[11px] text-text-main">
            Thank you for voting for <strong>{votedOption}</strong>. Our clinical team will review this for the next newsletter release.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[
            "Hydrogel vs Corticosteroid Injection Longevity",
            "Post-Op Swelling & Ice Therapy Protocol",
            "Cartilage Repair vs Microfracture Surgery",
            "Returning to Golf & Tennis After Knee Replacement",
          ].map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(opt)}
              disabled={isSubmittingPoll}
              className="w-full text-left p-3 border border-border-clinical hover:border-clinical-teal bg-warm-off-white hover:bg-pale-clinical-blue rounded-xl text-xs font-semibold text-text-main transition-colors flex items-center justify-between group"
            >
              <span>{opt}</span>
              <span className="text-clinical-teal opacity-0 group-hover:opacity-100 transition-opacity font-bold">Vote →</span>
            </button>
          ))}

          {/* Custom Topic Suggestion Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2">
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Or suggest a custom question for the consultant:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSuggestion}
                onChange={(e) => setCustomSuggestion(e.target.value)}
                placeholder="e.g. Can I kneel after a partial knee replacement?"
                className="flex-1 px-3 py-2 text-xs bg-warm-off-white border border-border-clinical rounded-lg text-text-main focus:outline-none focus:border-clinical-teal"
              />
              <button
                type="submit"
                disabled={isSubmittingPoll || !customSuggestion.trim()}
                className="bg-deep-navy hover:bg-clinical-teal text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shrink-0"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
