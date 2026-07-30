/**
 * Server-only PIN check for the /portal/clinician-intake tool. This is a
 * secondary "who's at this shared terminal" convenience layer on top of the
 * real access control (HTTP Basic Auth, enforced in middleware.ts) — never
 * import this from a client component, and never send the configured PIN
 * value to the browser.
 */
export function verifyClinicianPin(candidate: unknown): boolean {
  const configuredPin = process.env.CLINICIAN_INTAKE_PIN;
  if (!configuredPin) return false; // fail closed if not configured
  return typeof candidate === "string" && candidate === configuredPin;
}
