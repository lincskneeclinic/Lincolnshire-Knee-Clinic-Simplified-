/**
 * FUTURE SUPABASE MARKETING TABLE ARCHITECTURE
 * =============================================
 * This file documents the intended database schema for managing consented
 * marketing email opt-ins. This is a Phase 2 implementation.
 *
 * Do NOT connect Supabase until explicitly instructed.
 *
 * IMPORTANT GDPR/DPA 2018 RULES:
 * - Only patients who have explicitly ticked the optional checkbox may be added.
 * - The checkbox is unticked by default; consent cannot be inferred or assumed.
 * - Marketing consent is not required to book an appointment or contact the clinic.
 * - No clinical data, symptoms, diagnoses, treatment interests, or sensitive
 *   medical history may ever be stored in the marketing_consents table.
 *
 * Supabase table: marketing_consents
 *
 * SQL Schema (for future reference):
 *
 *   CREATE TABLE marketing_consents (
 *     id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name                 TEXT NOT NULL,
 *     email                TEXT NOT NULL UNIQUE,
 *     consent_status       BOOLEAN NOT NULL DEFAULT FALSE,
 *     consent_timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     consent_source       TEXT NOT NULL,          -- e.g. 'contact-form', 'booking-form'
 *     consent_text_version TEXT NOT NULL,          -- e.g. 'v1.0-2024-07' (tracks consent wording version)
 *     unsubscribe_status   BOOLEAN NOT NULL DEFAULT FALSE,
 *     unsubscribed_at      TIMESTAMPTZ,
 *     created_at           TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 * TypeScript type definition (for future Supabase client use):
 */

export type MarketingConsent = {
  id: string;
  name: string;
  email: string;
  consent_status: boolean;
  consent_timestamp: string; // ISO 8601 timestamptz string
  consent_source: "contact-form" | "booking-form" | string;
  consent_text_version: string; // e.g. "v1.0-2024-07"
  unsubscribe_status: boolean;
  unsubscribed_at?: string | null;
  created_at?: string;
};

/**
 * Current consent wording version (update this if the checkbox text changes).
 * Version history is important for GDPR audit trails.
 */
export const MARKETING_CONSENT_TEXT_VERSION = "v1.0-2024-07";

export const MARKETING_CONSENT_TEXT =
  "I agree to receive occasional email updates from Lincolnshire Knee Clinic about knee health, clinic services and patient education. I understand I can unsubscribe at any time.";

/**
 * STRICTLY PROHIBITED in the marketing_consents table:
 * - Knee symptoms or complaints
 * - Diagnoses or suspected conditions
 * - Treatment preferences or interests
 * - Post-operative or clinical status
 * - Any special category health data (UK GDPR Article 9)
 */
