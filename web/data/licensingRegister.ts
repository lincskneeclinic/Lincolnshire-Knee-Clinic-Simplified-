import { LicensingRecord } from "@/types/visuals";

// ============================================================
// Lincolnshire Knee Clinic — Licensing Register
//
// This register records every third-party or open-licensed asset
// that is a candidate for use on the website.
//
// IMPORTANT:
// - Do NOT assume an asset is reusable because it appears in a search.
// - Every record must be manually verified before publication.
// - commercialUseAllowed must be confirmed true before use.
// - Modification permission must be confirmed before adaptation.
// - No asset with publicationStatus other than "Approved" or "Published"
//   may appear on the public website.
// ============================================================

export const licensingRegister: LicensingRecord[] = [

  // ──────────────────────────────────────────────────────────────
  // SERVIER MEDICAL ART — CC BY 4.0
  // https://smart.servier.com/
  // Licence: Creative Commons Attribution 4.0 International
  // Commercial use: PERMITTED
  // Modification: PERMITTED (with attribution)
  // Attribution required: YES
  // Notes: Style is clean scientific line art on white background.
  //        Visual style differs from bespoke clinical illustration.
  //        Assets must be adapted to match LKC design palette.
  //        All candidate files below require clinical review before use.
  // ──────────────────────────────────────────────────────────────

  {
    id: "servier-knee-joint-sagittal",
    assetFilename: "knee-joint-sagittal-servier.png",
    creator: "Servier Medical Art",
    source: "Servier Medical Art",
    sourceUrl: "https://smart.servier.com/servier-medical-art/",
    licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.",
    dateRetrieved: "Pending — not yet retrieved",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "servier-knee-anatomy-lateral",
    assetFilename: "knee-anatomy-lateral-servier.png",
    creator: "Servier Medical Art",
    source: "Servier Medical Art",
    sourceUrl: "https://smart.servier.com/servier-medical-art/",
    licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.",
    dateRetrieved: "Pending — not yet retrieved",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "servier-meniscus-top-view",
    assetFilename: "meniscus-top-view-servier.png",
    creator: "Servier Medical Art",
    source: "Servier Medical Art",
    sourceUrl: "https://smart.servier.com/servier-medical-art/",
    licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.",
    dateRetrieved: "Pending — not yet retrieved",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "servier-tendon-patellar",
    assetFilename: "tendon-patellar-servier.png",
    creator: "Servier Medical Art",
    source: "Servier Medical Art",
    sourceUrl: "https://smart.servier.com/servier-medical-art/",
    licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.",
    dateRetrieved: "Pending — not yet retrieved",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "servier-cartilage-anatomy",
    assetFilename: "cartilage-anatomy-servier.png",
    creator: "Servier Medical Art",
    source: "Servier Medical Art",
    sourceUrl: "https://smart.servier.com/servier-medical-art/",
    licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    attributionText: "Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.",
    dateRetrieved: "Pending — not yet retrieved",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },

  // ──────────────────────────────────────────────────────────────
  // WIKIMEDIA COMMONS — Individual files (each licence verified separately)
  // NOTE: Wikimedia hosts files under many different licences.
  //       Each file must be individually checked.
  //       The entries below are CANDIDATES ONLY — not approved.
  // ──────────────────────────────────────────────────────────────

  {
    id: "wikimedia-knee-anatomy-gray",
    assetFilename: "knee-anatomy-gray-wikimedia.png",
    creator: "Henry Gray (original); uploader varies",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gray347.png",
    licenceName: "Public Domain (pre-1924 publication) — verify upload date and modifications",
    licenceUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing",
    attributionText: "Gray's Anatomy, public domain. Verify via Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Gray347.png",
    dateRetrieved: "Pending — not yet retrieved; individual file licence must be verified",
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Awaiting licence check",
  },

  // ──────────────────────────────────────────────────────────────
  // CONSULTANT-SUPPLIED IMAGING
  // Imaging examples must be supplied directly by Mr R J Pacheco.
  // Each must be fully anonymised and explicitly approved.
  // ──────────────────────────────────────────────────────────────

  {
    id: "consultant-supplied-knee-arthritis-xray",
    assetFilename: "knee-arthritis-xray.png",
    creator: "Mr R J Pacheco — Lincolnshire Knee Clinic",
    source: "Consultant-supplied clinical practice image",
    sourceUrl: "",
    licenceName: "Consultant-supplied — explicit written permission for website publication",
    licenceUrl: "",
    attributionText: "Educational imaging example. Not for diagnostic use. Image supplied and approved for publication by Mr R J Pacheco, Consultant Orthopaedic Surgeon.",
    dateRetrieved: "Pending — image not yet supplied",
    modificationAllowed: false,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "consultant-supplied-acl-mri",
    assetFilename: "acl-injury-mri.png",
    creator: "Mr R J Pacheco — Lincolnshire Knee Clinic",
    source: "Consultant-supplied clinical practice image",
    sourceUrl: "",
    licenceName: "Consultant-supplied — explicit written permission for website publication",
    licenceUrl: "",
    attributionText: "Educational imaging example. Not for diagnostic use. Image supplied and approved for publication by Mr R J Pacheco, Consultant Orthopaedic Surgeon.",
    dateRetrieved: "Pending — image not yet supplied",
    modificationAllowed: false,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },
  {
    id: "consultant-supplied-meniscal-mri",
    assetFilename: "meniscal-tear-mri-sagittal.png",
    creator: "Mr R J Pacheco — Lincolnshire Knee Clinic",
    source: "Consultant-supplied clinical practice image",
    sourceUrl: "",
    licenceName: "Consultant-supplied — explicit written permission for website publication",
    licenceUrl: "",
    attributionText: "Educational imaging example. Not for diagnostic use. Image supplied and approved for publication by Mr R J Pacheco, Consultant Orthopaedic Surgeon.",
    dateRetrieved: "Pending — image not yet supplied",
    modificationAllowed: false,
    commercialUseAllowed: true,
    publicationStatus: "Proposed",
  },

  // ──────────────────────────────────────────────────────────────
  // INTERNAL / BESPOKE
  // Commissioned illustrations — licence held by Lincolnshire Knee Clinic.
  // These entries are created when artwork is commissioned.
  // ──────────────────────────────────────────────────────────────

  {
    id: "internal-knee-anatomy-schematic-svg",
    assetFilename: "knee-anatomy-schematic.svg",
    creator: "Lincolnshire Knee Clinic — hand-coded SVG schematic",
    source: "Internal",
    sourceUrl: "",
    licenceName: "Internal — All rights reserved Lincolnshire Knee Clinic",
    licenceUrl: "",
    attributionText: "Educational schematic diagram. Awaiting clinical review.",
    dateRetrieved: new Date().toISOString().split("T")[0],
    modificationAllowed: true,
    commercialUseAllowed: true,
    publicationStatus: "Awaiting clinical review",
  },
];

/**
 * Look up a licensing record by asset filename.
 */
export const getLicencingRecordByFilename = (
  filename: string
): LicensingRecord | undefined =>
  licensingRegister.find((r) => r.assetFilename === filename);

/**
 * Return all records awaiting licence verification.
 */
export const getLicencingRecordsAwaitingCheck = (): LicensingRecord[] =>
  licensingRegister.filter((r) => r.publicationStatus === "Awaiting licence check");

/**
 * Return all records where commercial use is confirmed.
 */
export const getLicencingRecordsCommerciallyApproved = (): LicensingRecord[] =>
  licensingRegister.filter((r) => r.commercialUseAllowed && r.publicationStatus === "Approved");
