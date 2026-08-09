// ============================================================
// Lincolnshire Knee Clinic — Visual Asset Type Definitions
// Pass 1 types preserved; Pass 2 types appended below.
// ============================================================

// ──────────────────────────────────────────────────────────────
// PASS 1 TYPES (unchanged)
// ──────────────────────────────────────────────────────────────

export type VisualType =
  | "anatomy"
  | "comparison"
  | "imaging"
  | "pathway"
  | "timeline"
  | "symptom-locator"
  | "procedure"
  | "aftercare"
  | "clinic-map"
  | "infographic";

export type ClinicalReviewStatus =
  | "pending-clinical-review"
  | "clinically-approved"
  | "draft-under-review";

export type VisualStatus = "pending" | "draft" | "approved";

export type VisualPriority = "high" | "medium" | "low";

export interface Annotation {
  id: string;
  x: number;
  y: number;
  label: string;
  description?: string;
  highlightColor?: "teal" | "coral" | "navy";
}

export interface VisualAsset {
  id: string;
  page: string;
  section: string;
  title: string;
  type: VisualType;
  imagePath: string;
  altText: string;
  caption: string;
  placeholderLabel: string;
  annotations?: Annotation[];
  relatedRoute?: string;
  status: VisualStatus;
  priority: VisualPriority;
  clinicalReviewStatus: ClinicalReviewStatus;
  photographyOrIllustration?: "photography" | "illustration" | "both" | "none";
  requiredDimensions: {
    width: number;
    height: number;
  };
}

// ──────────────────────────────────────────────────────────────
// PASS 2 TYPES — Asset Classification & Licensing System
// ──────────────────────────────────────────────────────────────

/**
 * A = Existing approved asset
 * B = Open-licensed illustration suitable for adaptation
 * C = Commercially licensed asset required
 * D = Bespoke medical illustration required
 * E = Consultant-supplied anonymised X-ray or MRI required
 * F = Clinic-supplied photograph or map required
 * G = Interactive component using an approved underlying illustration
 * H = Placeholder pending clinical review
 */
export type AssetCategory = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type AssetApprovalStatus =
  | "Proposed"
  | "Sourced"
  | "Awaiting licence check"
  | "Awaiting clinical review"
  | "Approved"
  | "Published"
  | "Rejected";

export interface AssetClassificationRecord {
  id: string;
  page: string;
  section: string;
  assetName: string;
  category: AssetCategory;
  proposedSource: string;
  licence: string;
  attributionRequired: boolean;
  clinicalReviewRequired: boolean;
  status: AssetApprovalStatus;
  finalFilePath: string;
  interactive: boolean;
  accessibilityRequirements: string;
}

export interface LicensingRecord {
  id: string;
  assetFilename: string;
  creator: string;
  source: string;
  sourceUrl: string;
  licenceName: string;
  licenceUrl: string;
  attributionText: string;
  dateRetrieved: string;
  modificationAllowed: boolean;
  commercialUseAllowed: boolean;
  publicationStatus: AssetApprovalStatus;
}

/**
 * STRICT RULES:
 * - publicationApprovalConfirmed must be TRUE before any public rendering.
 * - anonymisationConfirmed must be TRUE before any public rendering.
 * - No imaging asset is auto-approved.
 */
export interface ImagingAsset {
  id: string;
  modality: "X-ray" | "MRI" | "CT" | "Ultrasound" | "Arthroscopy";
  bodyRegion: string;
  viewOrSequence: string;
  educationalFinding: string;
  annotationLabels: string[];
  /**
   * Marker position for each entry in annotationLabels, as a percentage
   * (0-100) of the rendered image's width/height. Index-matched to
   * annotationLabels. Optional — falls back to a right-side column if
   * omitted for a given index.
   */
  annotationPositions?: { x: number; y: number }[];
  anonymisationConfirmed: boolean;
  publicationApprovalConfirmed: boolean;
  clinicalReviewStatus: ClinicalReviewStatus;
  source: string;
  caption: string;
  altText: string;
  filePath: string;
  status: AssetApprovalStatus;
}
