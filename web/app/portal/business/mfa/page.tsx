"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MfaMode = "loading" | "verify" | "enroll";
type TotpFactor = { id: string; status: string };

function getInitialNextPath(): string {
  if (typeof window === "undefined") return "/portal/business";
  const requestedNext = new URLSearchParams(window.location.search).get("next");
  return requestedNext?.startsWith("/") ? requestedNext : "/portal/business";
}

export default function BusinessMfaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<MfaMode>("loading");
  const [nextPath] = useState(getInitialNextPath);
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMfa = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/portal/business/login");
        return;
      }

      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance?.currentLevel === "aal2") {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        setError(listError.message);
        setMode("verify");
        return;
      }

      const totpFactors = factors?.totp as TotpFactor[] | undefined;
      const verifiedTotp = totpFactors?.find((factor) => factor.status === "verified");
      if (verifiedTotp?.id) {
        setFactorId(verifiedTotp.id);
        setMode("verify");
        return;
      }

      const { data: enrollment, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Lincolnshire Knee Clinic Admin",
      });

      if (enrollError || !enrollment) {
        setError(enrollError?.message || "Could not start MFA enrolment.");
        setMode("verify");
        return;
      }

      setFactorId(enrollment.id);
      setQrCode(enrollment.totp.qr_code);
      setSecret(enrollment.totp.secret);
      setMode("enroll");
    };

    loadMfa().catch((err) => {
      console.error(err);
      setError("Could not load MFA setup. Please try again.");
      setMode("verify");
    });
  }, [nextPath, router]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!factorId) {
      setError("No MFA factor is available. Please refresh and try again.");
      return;
    }

    const cleanCode = code.trim().replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Enter the six-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanCode,
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const qrCodeSrc = qrCode.startsWith("data:")
    ? qrCode
    : `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`;

  return (
    <main className="min-h-screen bg-warm-off-white px-4 py-10 text-text-main">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="w-full rounded-2xl border border-border-clinical bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-clinical-teal">
            Admin Portal
          </p>
          <h1 className="text-2xl font-bold text-deep-navy">Multi-Factor Verification</h1>

          {mode === "loading" ? (
            <p className="mt-6 text-sm text-text-secondary">Loading security check...</p>
          ) : (
            <form onSubmit={handleVerify} className="mt-6 space-y-5">
              {mode === "enroll" && (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    Scan this QR code in an authenticator app, then enter the six-digit code.
                  </p>
                  {qrCode && (
                    <div className="flex justify-center rounded-xl border border-border-clinical bg-warm-off-white p-4">
                      <Image
                        src={qrCodeSrc}
                        alt="Authenticator app QR code"
                        width={192}
                        height={192}
                        unoptimized
                      />
                    </div>
                  )}
                  {secret && (
                    <p className="break-all rounded-xl border border-border-clinical bg-warm-off-white p-3 text-xs text-text-secondary">
                      Manual setup key: <strong>{secret}</strong>
                    </p>
                  )}
                </div>
              )}

              {mode === "verify" && (
                <p className="text-sm leading-relaxed text-text-secondary">
                  Enter the six-digit code from your authenticator app.
                </p>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="mfa-code" className="text-xs font-semibold text-text-secondary">
                  Authenticator Code
                </label>
                <input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="w-full rounded-xl border border-border-clinical bg-warm-off-white px-4 py-2.5 text-sm text-text-main focus:border-clinical-teal focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[#FAD8D8] bg-status-error-bg p-3 text-xs font-medium text-status-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-xl bg-deep-navy px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#111827] disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
