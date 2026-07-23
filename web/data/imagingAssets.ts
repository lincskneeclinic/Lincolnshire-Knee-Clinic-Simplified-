import { ImagingAsset } from "@/types/visuals";

// ============================================================
// Lincolnshire Knee Clinic — Imaging Asset Registry
//
// STRICT RULES — NO EXCEPTIONS:
//
// 1. publicationApprovalConfirmed MUST be TRUE before any
//    image is publicly rendered anywhere on the website.
//
// 2. anonymisationConfirmed MUST be TRUE before any
//    image is publicly rendered.
//
// 3. All imaging must be physically supplied by the consultant
//    or an explicitly authorised source.
//
// 4. No imaging asset is automatically approved.
//
// 5. No fake, AI-generated, scraped, or unverified imaging
//    is permitted. No Radiopaedia or journal article copies.
//
// 6. Every asset must be checked for:
//    - Burned-in patient identifiers (name, DOB, NHS number)
//    - DICOM metadata (strip before file delivery)
//    - Accession numbers or institution names
//
// Components (AnnotatedImagingViewer) enforce these flags.
// ============================================================

export const imagingAssets: ImagingAsset[] = [

  // ──────────────────────────────────────────────────────────────
  // OSTEOARTHRITIS
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-knee-arthritis-ap-xray",
    modality: "X-ray",
    bodyRegion: "Knee — bilateral weight-bearing",
    viewOrSequence: "AP (anterior-posterior) weight-bearing",
    educationalFinding: "Asymmetrical medial joint space narrowing with subchondral sclerosis",
    annotationLabels: [
      "Medial Joint Space Narrowing",
      "Subchondral Sclerosis",
      "Lateral Compartment (Preserved)",
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Weight-bearing AP X-ray demonstrating medial compartment osteoarthritis. Educational example only.",
    altText: "Weight-bearing AP X-ray of an arthritic knee showing narrowing of the medial joint space and increased bone density beneath the worn cartilage zone. Annotation markers highlight key radiological changes.",
    filePath: "/images/imaging/knee-arthritis-xray.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // ACL INJURY
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-acl-injury-mri-sagittal",
    modality: "MRI",
    bodyRegion: "Knee — sagittal plane",
    viewOrSequence: "Sagittal T2-weighted",
    educationalFinding: "Complete ACL tear with oedema at ligament origin",
    annotationLabels: [
      "ACL — Absent/Disrupted Signal",
      "Bone Bruising (Lateral Femoral Condyle)",
      "PCL — Intact",
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Sagittal T2 MRI demonstrating complete ACL disruption. Educational example only — not for diagnostic interpretation.",
    altText: "Sagittal MRI scan of the knee showing disruption of the anterior cruciate ligament with associated bone bruising. Annotations identify key structural changes.",
    filePath: "/images/imaging/acl-injury-mri.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // MENISCAL TEAR
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-meniscal-tear-mri-coronal",
    modality: "MRI",
    bodyRegion: "Knee — coronal plane",
    viewOrSequence: "Coronal PD fat-saturated",
    educationalFinding: "Medial meniscal tear — posterior horn",
    annotationLabels: [
      "Medial Meniscal Tear Signal",
      "Medial Joint Space",
      "Lateral Meniscus — Intact",
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Coronal fat-saturated MRI demonstrating a posterior horn medial meniscal tear. Educational example only.",
    altText: "Coronal MRI of the knee demonstrating bright signal within the medial meniscus consistent with a tear of the posterior horn. Annotated for educational use.",
    filePath: "/images/imaging/meniscal-tear-mri.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // CARTILAGE INJURY
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-cartilage-injury-mri",
    modality: "MRI",
    bodyRegion: "Knee — axial/coronal",
    viewOrSequence: "Axial T2 fat-saturated",
    educationalFinding: "Full-thickness cartilage defect, medial femoral condyle",
    annotationLabels: [
      "Cartilage Defect",
      "Subchondral Bone Exposure",
      "Adjacent Intact Cartilage",
    ],
    anonymisationConfirmed: false,
    publicationApprovalConfirmed: false,
    clinicalReviewStatus: "pending-clinical-review",
    source: "Awaiting consultant supply — Mr R J Pacheco",
    caption: "MRI demonstrating a focal cartilage defect on the medial femoral condyle. Educational example only.",
    altText: "Axial MRI of the knee showing a focal area of cartilage loss on the medial femoral condyle with underlying bone exposed. Annotated for educational use only.",
    filePath: "/images/imaging/cartilage-injury-mri.png",
    status: "Proposed",
  },

  // ──────────────────────────────────────────────────────────────
  // ULTRASOUND GUIDED INJECTION
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-ultrasound-injection-concept",
    modality: "Ultrasound",
    bodyRegion: "Knee — suprapatellar recess",
    viewOrSequence: "Longitudinal",
    educationalFinding: "Needle visualisation during intra-articular injection",
    annotationLabels: [
      "Needle Tip",
      "Joint Recess",
      "Probe Position",
    ],
    anonymisationConfirmed: false,
    publicationApprovalConfirmed: false,
    clinicalReviewStatus: "pending-clinical-review",
    source: "Awaiting consultant supply — Mr R J Pacheco",
    caption: "Ultrasound image illustrating real-time needle guidance into the knee joint recess. Educational concept only — does not guarantee needle placement accuracy.",
    altText: "Ultrasound scan showing a needle being guided into the suprapatellar recess of the knee joint under real-time visualisation. Annotated for educational use.",
    filePath: "/images/imaging/ultrasound-injection-concept.png",
    status: "Proposed",
  },

  // ──────────────────────────────────────────────────────────────
  // TOTAL KNEE REPLACEMENT — POST-OPERATIVE X-RAY
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-tkr-postop-xray",
    modality: "X-ray",
    bodyRegion: "Knee — post total knee replacement",
    viewOrSequence: "AP and Lateral post-operative",
    educationalFinding: "Well-positioned total knee replacement implant components",
    annotationLabels: [
      "Femoral Component",
      "Tibial Component",
      "Patellar Resurfacing (if applicable)",
    ],
    anonymisationConfirmed: false,
    publicationApprovalConfirmed: false,
    clinicalReviewStatus: "pending-clinical-review",
    source: "Awaiting consultant supply — Mr R J Pacheco",
    caption: "Post-operative AP X-ray demonstrating a total knee replacement in satisfactory position. Educational example only.",
    altText: "Post-operative AP X-ray of a total knee replacement showing the femoral and tibial components in anatomical alignment. Annotated for educational purposes only.",
    filePath: "/images/imaging/tkr-postop-xray.png",
    status: "Proposed",
  },
];

/**
 * Returns true if an imaging asset is safe to render publicly.
 * Both anonymisation AND publication approval must be confirmed.
 */
export const isImagingAssetPublishable = (asset: ImagingAsset): boolean =>
  asset.anonymisationConfirmed &&
  asset.publicationApprovalConfirmed &&
  asset.status === "Published";

/**
 * Look up a specific imaging asset by ID.
 */
export const getImagingAsset = (id: string): ImagingAsset | undefined =>
  imagingAssets.find((a) => a.id === id);

/**
 * Return all assets awaiting consultant supply.
 */
export const getImagingAssetsAwaitingSupply = (): ImagingAsset[] =>
  imagingAssets.filter(
    (a) => !a.anonymisationConfirmed || !a.publicationApprovalConfirmed
  );
