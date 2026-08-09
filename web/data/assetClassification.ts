import { AssetClassificationRecord } from "@/types/visuals";

// ============================================================
// Lincolnshire Knee Clinic — Asset Classification Register
// Every visual asset required across all pages, classified A–H.
//
// Category key:
// A = Existing approved asset
// B = Open-licensed illustration suitable for adaptation
// C = Commercially licensed asset required
// D = Bespoke medical illustration required
// E = Consultant-supplied anonymised X-ray or MRI required
// F = Clinic-supplied photograph or map required
// G = Interactive SVG/component (no raster asset required)
// H = Placeholder pending clinical review
//
// Default status: "Proposed" — nothing published without full approval.
// ============================================================

export const assetClassificationRegister: AssetClassificationRecord[] = [

  // ──────────────────────────────────────────────────────────────
  // CONDITIONS
  // ──────────────────────────────────────────────────────────────

  // Knee Arthritis
  {
    id: "cond-knee-arthritis-anatomy",
    page: "conditions/knee-arthritis",
    section: "overview",
    assetName: "Knee Arthritis Joint Anatomy Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/knee-arthritis-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text required; annotation labels in visible legend; colour not used alone",
  },
  {
    id: "cond-knee-arthritis-interactive-anatomy",
    page: "conditions/knee-arthritis",
    section: "interactive-anatomy",
    assetName: "Interactive Knee Anatomy Diagram (SVG schematic)",
    category: "G",
    proposedSource: "Hand-coded SVG — schematic only, no traced artwork",
    licence: "Internal — no external licence required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "/images/illustrations/knee-anatomy-schematic.svg",
    interactive: true,
    accessibilityRequirements: "SVG title/desc; labelled regions; keyboard navigable; ARIA roles; reduced-motion support",
  },
  {
    id: "cond-knee-arthritis-xray",
    page: "conditions/knee-arthritis",
    section: "imaging",
    assetName: "Weight-Bearing AP X-Ray: Knee Osteoarthritis",
    category: "E",
    proposedSource: "Consultant-supplied anonymised image from clinical practice",
    licence: "Consultant-supplied — explicit written permission required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/imaging/knee-arthritis-xray.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation list fallback; educational disclaimer; not rendered until publicationApprovalConfirmed=true",
  },
  {
    id: "cond-knee-arthritis-comparison",
    page: "conditions/knee-arthritis",
    section: "comparison",
    assetName: "Healthy vs Arthritic Knee Comparison Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/knee-arthritis-comparison.png",
    interactive: false,
    accessibilityRequirements: "Both panels labelled; tabular comparison provided as text fallback",
  },
  {
    id: "cond-knee-arthritis-pathway",
    page: "conditions/knee-arthritis",
    section: "pathway",
    assetName: "Osteoarthritis Treatment Pathway Diagram",
    category: "G",
    proposedSource: "Interactive SVG component — TreatmentPathway",
    licence: "Internal — no external licence required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "Keyboard navigable steps; ARIA current step; reduced-motion static fallback",
  },

  // ACL Injury
  {
    id: "cond-acl-injury-anatomy",
    page: "conditions/acl-injury",
    section: "overview",
    assetName: "ACL Anatomy and Tear Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/acl-injury-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels in legend",
  },
  {
    id: "cond-acl-injury-comparison",
    page: "conditions/acl-injury",
    section: "comparison",
    assetName: "Intact ACL vs Torn ACL Before/After Comparison",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/acl-injury-comparison.png",
    interactive: true,
    accessibilityRequirements: "Slider with ARIA label; keyboard navigable; non-interactive fallback showing both panels",
  },
  {
    id: "cond-acl-injury-mri",
    page: "conditions/acl-injury",
    section: "imaging",
    assetName: "Sagittal MRI: ACL Tear",
    category: "E",
    proposedSource: "Consultant-supplied anonymised image",
    licence: "Consultant-supplied — explicit written permission required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/imaging/acl-injury-mri.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation list; educational disclaimer; not rendered until publicationApprovalConfirmed=true",
  },

  // Meniscal Tear
  {
    id: "cond-meniscal-tear-anatomy",
    page: "conditions/meniscal-tear",
    section: "overview",
    assetName: "Meniscus Anatomy and Tear Types Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/meniscal-tear-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels in legend",
  },
  {
    id: "cond-meniscal-tear-mri",
    page: "conditions/meniscal-tear",
    section: "imaging",
    assetName: "Sagittal MRI: Medial Meniscal Tear",
    category: "E",
    proposedSource: "Consultant-supplied anonymised image",
    licence: "Consultant-supplied — explicit written permission required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/imaging/meniscal-tear-mri-sagittal.png",
    interactive: false,
    accessibilityRequirements: "Not rendered until publicationApprovalConfirmed=true",
  },

  // Patellofemoral Pain
  {
    id: "cond-patellofemoral-anatomy",
    page: "conditions/patellofemoral-pain",
    section: "overview",
    assetName: "Patellofemoral Joint and Tracking Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/patellofemoral-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Cartilage Injury
  {
    id: "cond-cartilage-injury-anatomy",
    page: "conditions/cartilage-injury",
    section: "overview",
    assetName: "Articular Cartilage Defect Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/cartilage-injury-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Baker's Cyst
  {
    id: "cond-bakers-cyst-anatomy",
    page: "conditions/bakers-cyst",
    section: "overview",
    assetName: "Baker's Cyst Location Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/bakers-cyst-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Knee Instability
  {
    id: "cond-knee-instability-anatomy",
    page: "conditions/knee-instability",
    section: "overview",
    assetName: "Knee Ligament Stability Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/knee-instability-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Patellar Instability
  {
    id: "cond-patellar-instability-anatomy",
    page: "conditions/patellar-instability",
    section: "overview",
    assetName: "Patellar Tracking and Instability Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/patellar-instability-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Knee Tendinopathy
  {
    id: "cond-knee-tendinopathy-anatomy",
    page: "conditions/knee-tendinopathy",
    section: "overview",
    assetName: "Patellar and Quadriceps Tendon Anatomy",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Published",
    finalFilePath: "/images/conditions/knee-tendinopathy-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // ──────────────────────────────────────────────────────────────
  // TREATMENTS
  // ──────────────────────────────────────────────────────────────

  // Total Knee Replacement
  {
    id: "treat-tkr-anatomy",
    page: "treatments/total-knee-replacement",
    section: "overview",
    assetName: "Total Knee Replacement Implant Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — commissioned artwork",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/total-knee-replacement-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels in legend",
  },
  {
    id: "treat-tkr-pathway",
    page: "treatments/total-knee-replacement",
    section: "pathway",
    assetName: "TKR Treatment Pathway — Interactive Component",
    category: "G",
    proposedSource: "TreatmentPathway SVG component — internal",
    licence: "Internal — no external licence required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "Keyboard navigable; ARIA current; reduced-motion fallback",
  },
  {
    id: "treat-tkr-recovery",
    page: "treatments/total-knee-replacement",
    section: "recovery",
    assetName: "TKR Recovery Pathway — Interactive Component",
    category: "G",
    proposedSource: "RecoveryPathway component — internal",
    licence: "Internal — no external licence required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "Keyboard navigable; recovery disclaimer; reduced-motion fallback",
  },

  // Partial Knee Replacement
  {
    id: "treat-pkr-anatomy",
    page: "treatments/partial-knee-replacement",
    section: "overview",
    assetName: "Partial Knee Replacement — Unicompartmental Implant Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/partial-knee-replacement-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // ACL Reconstruction
  {
    id: "treat-acl-reconstruction-anatomy",
    page: "treatments/acl-reconstruction",
    section: "overview",
    assetName: "ACL Graft Reconstruction Technique Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/acl-reconstruction-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Physiotherapy
  {
    id: "treat-physiotherapy-overview",
    page: "treatments/physiotherapy",
    section: "overview",
    assetName: "Physiotherapy Knee Exercise Illustration",
    category: "H",
    proposedSource: "Placeholder — awaiting clinical review",
    licence: "Pending",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/physiotherapy-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text required",
  },

  // Meniscal Surgery
  {
    id: "treat-meniscal-surgery-anatomy",
    page: "treatments/meniscal-surgery",
    section: "overview",
    assetName: "Arthroscopic Meniscal Surgery Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/meniscal-surgery-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Cartilage Procedures
  {
    id: "treat-cartilage-procedures-anatomy",
    page: "treatments/cartilage-procedures",
    section: "overview",
    assetName: "Cartilage Repair Procedure Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/cartilage-procedures-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Knee Arthroscopy
  {
    id: "treat-knee-arthroscopy-anatomy",
    page: "treatments/knee-arthroscopy",
    section: "overview",
    assetName: "Knee Arthroscopy Setup Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/knee-arthroscopy-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Patellar Stabilisation
  {
    id: "treat-patellar-stabilisation-anatomy",
    page: "treatments/patellar-stabilisation",
    section: "overview",
    assetName: "Patellar Stabilisation Procedure Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/treatments/patellar-stabilisation-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },

  // Recovery pages (generic recovery stage diagram)
  {
    id: "treat-enhanced-recovery-pathway",
    page: "treatments/enhanced-recovery",
    section: "pathway",
    assetName: "Enhanced Recovery Programme Pathway",
    category: "G",
    proposedSource: "RecoveryPathway component — internal",
    licence: "Internal",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "Keyboard navigable; disclaimer present",
  },

  // ──────────────────────────────────────────────────────────────
  // INJECTIONS
  // ──────────────────────────────────────────────────────────────

  {
    id: "inj-ultrasound-guided-viewer",
    page: "injections/ultrasound-guided-knee-injections",
    section: "procedure",
    assetName: "Ultrasound-Guided Injection Step Viewer",
    category: "G",
    proposedSource: "InjectionStepViewer component — internal; step illustrations to be commissioned",
    licence: "Internal component; illustrations: Proposed — Proprietary",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "ARIA live; keyboard prev/next; reduced-motion static list; no guaranteed outcome claims",
  },
  {
    id: "inj-corticosteroid-anatomy",
    page: "injections/corticosteroid",
    section: "overview",
    assetName: "Corticosteroid Injection Anatomy Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/injections/corticosteroid-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },
  {
    id: "inj-prp-anatomy",
    page: "injections/prp",
    section: "overview",
    assetName: "PRP Injection Anatomy Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/injections/prp-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },
  {
    id: "inj-hyaluronic-acid-anatomy",
    page: "injections/hyaluronic-acid",
    section: "overview",
    assetName: "Hyaluronic Acid Injection Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/injections/hyaluronic-acid-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },
  {
    id: "inj-arthrosamid-anatomy",
    page: "injections/arthrosamid",
    section: "overview",
    assetName: "Arthrosamid® Injection Diagram",
    category: "D",
    proposedSource: "Bespoke medical illustration — may need manufacturer coordination",
    licence: "Proprietary — commissioned or manufacturer-approved",
    attributionRequired: true,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/injections/arthrosamid-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels; attribution displayed",
  },

  // ──────────────────────────────────────────────────────────────
  // SYMPTOMS
  // ──────────────────────────────────────────────────────────────

  {
    id: "sym-front-of-knee-pain-map",
    page: "symptoms/front-of-knee-pain",
    section: "pain-map",
    assetName: "Interactive Knee Pain Location Map (SVG)",
    category: "G",
    proposedSource: "PainLocationMap component — hand-coded SVG schematic",
    licence: "Internal — no external licence required",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "SVG roles; keyboard navigable; disclaimer: pain location alone cannot determine cause; educational links only",
  },
  {
    id: "sym-front-of-knee-pain-anatomy",
    page: "symptoms/front-of-knee-pain",
    section: "overview",
    assetName: "Front of Knee Anatomy Illustration",
    category: "D",
    proposedSource: "Bespoke medical illustration",
    licence: "Proprietary — commissioned artwork",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/symptoms/front-of-knee-pain-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text; annotation labels",
  },
  {
    id: "sym-swollen-knee-anatomy",
    page: "symptoms/swollen-knee",
    section: "overview",
    assetName: "Swollen Knee Causes Diagram",
    category: "H",
    proposedSource: "Placeholder pending illustration commission",
    licence: "Pending",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/symptoms/swollen-knee-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text required",
  },
  {
    id: "sym-locked-knee-anatomy",
    page: "symptoms/locked-knee",
    section: "overview",
    assetName: "Locked Knee Mechanical Block Diagram",
    category: "H",
    proposedSource: "Placeholder pending illustration commission",
    licence: "Pending",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/symptoms/locked-knee-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text required",
  },
  {
    id: "sym-stiff-knee-anatomy",
    page: "symptoms/stiff-knee",
    section: "overview",
    assetName: "Knee Stiffness Causes Diagram",
    category: "H",
    proposedSource: "Placeholder pending illustration commission",
    licence: "Pending",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Proposed",
    finalFilePath: "/images/symptoms/stiff-knee-overview.png",
    interactive: false,
    accessibilityRequirements: "Alt text required",
  },

  // Pain map for all symptom pages (shared SVG component)
  {
    id: "sym-all-pain-map",
    page: "symptoms/*",
    section: "pain-map",
    assetName: "Shared Knee Pain Location Map SVG",
    category: "G",
    proposedSource: "PainLocationMap component — internal SVG",
    licence: "Internal",
    attributionRequired: false,
    clinicalReviewRequired: true,
    status: "Awaiting clinical review",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "Disclaimer required; keyboard navigable; educational only",
  },

  // ──────────────────────────────────────────────────────────────
  // CLINICS
  // ──────────────────────────────────────────────────────────────

  {
    id: "clinic-st-hughs-map",
    page: "clinics",
    section: "st-hughs-hospital",
    assetName: "St Hugh's Hospital Google Map Embed",
    category: "G",
    proposedSource: "Google Maps embed — standard terms",
    licence: "Google Maps Platform Terms of Service",
    attributionRequired: true,
    clinicalReviewRequired: false,
    status: "Approved",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "iframe title; directions link as text fallback",
  },
  {
    id: "clinic-inspire-health-map",
    page: "clinics",
    section: "inspire-health",
    assetName: "Inspire Health Google Map Embed",
    category: "G",
    proposedSource: "Google Maps embed — standard terms",
    licence: "Google Maps Platform Terms of Service",
    attributionRequired: true,
    clinicalReviewRequired: false,
    status: "Approved",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "iframe title; directions link as text fallback",
  },
  {
    id: "clinic-parkhill-map",
    page: "clinics",
    section: "parkhill-hospital",
    assetName: "Parkhill Hospital Google Map Embed",
    category: "G",
    proposedSource: "Google Maps embed — standard terms",
    licence: "Google Maps Platform Terms of Service",
    attributionRequired: true,
    clinicalReviewRequired: false,
    status: "Approved",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "iframe title; directions link as text fallback",
  },
  {
    id: "clinic-lincoln-private-map",
    page: "clinics",
    section: "lincoln-private-hospital",
    assetName: "Lincoln Private Hospital Google Map Embed",
    category: "G",
    proposedSource: "Google Maps embed — standard terms",
    licence: "Google Maps Platform Terms of Service",
    attributionRequired: true,
    clinicalReviewRequired: false,
    status: "Approved",
    finalFilePath: "",
    interactive: true,
    accessibilityRequirements: "iframe title; directions link as text fallback",
  },
];

/**
 * Look up classification records for a given page.
 */
export const getClassificationsByPage = (
  page: string
): AssetClassificationRecord[] =>
  assetClassificationRegister.filter((r) => r.page === page || r.page === `${page.split("/")[0]}/*`);

/**
 * Look up all records awaiting a given status.
 */
export const getClassificationsByStatus = (
  status: AssetClassificationRecord["status"]
): AssetClassificationRecord[] =>
  assetClassificationRegister.filter((r) => r.status === status);

/**
 * Look up all records requiring clinical review.
 */
export const getClassificationsRequiringClinicalReview =
  (): AssetClassificationRecord[] =>
    assetClassificationRegister.filter((r) => r.clinicalReviewRequired);
