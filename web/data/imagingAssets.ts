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
    annotationPositions: [
      { x: 62, y: 55 },
      { x: 64, y: 63 },
      { x: 30, y: 53 },
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
    annotationPositions: [
      { x: 38, y: 40 },
      { x: 62, y: 20 },
      { x: 48, y: 48 },
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
    bodyRegion: "Knee — sagittal plane",
    viewOrSequence: "Sagittal MRI",
    educationalFinding: "Medial meniscal tear — posterior horn",
    annotationLabels: [
      "Medial Meniscal Tear Signal",
    ],
    annotationPositions: [
      { x: 48, y: 65 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Sagittal MRI demonstrating a posterior horn medial meniscal tear. Educational example only.",
    altText: "Sagittal MRI of the knee demonstrating signal change within the meniscus consistent with a posterior horn tear. Annotated for educational use.",
    filePath: "/images/imaging/meniscal-tear-mri-sagittal.png",
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
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "MRI demonstrating a focal cartilage defect on the medial femoral condyle. Educational example only.",
    altText: "Axial MRI of the knee showing a focal area of cartilage loss on the medial femoral condyle with underlying bone exposed. Annotated for educational use only.",
    filePath: "/images/imaging/cartilage-injury-mri.png",
    status: "Published",
  },
  {
    id: "imaging-cartilage-injury-arthroscopy",
    modality: "Arthroscopy",
    bodyRegion: "Knee — femoral condyle",
    viewOrSequence: "Intra-operative arthroscopic view",
    educationalFinding: "Grade III focal cartilage defect (chondral pothole) exposing subchondral bone",
    annotationLabels: [
      "Focal Cartilage Defect (Chondral Defect)",
      "Exposed Yellowish Subchondral Bone",
      "Surrounding White Articular Cartilage Edge",
    ],
    annotationPositions: [
      { x: 38, y: 42 },
      { x: 48, y: 58 },
      { x: 68, y: 20 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Intra-operative arthroscopic view demonstrating a localized Grade III cartilage defect (pothole) on the femoral condyle, showing exposed bone. Educational example only.",
    altText: "Arthroscopic camera image of the knee joint showing a focal area of cartilage wear on the femoral condyle exposing the subchondral bone.",
    filePath: "/images/imaging/cartilage-injury-arthroscopy.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // KNEE INSTABILITY — awaiting consultant-supplied imaging
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-knee-instability-mri",
    modality: "MRI",
    bodyRegion: "Knee — ligamentous complex",
    viewOrSequence: "Sagittal / Coronal MRI",
    educationalFinding: "Ligamentous laxity pattern associated with chronic knee instability",
    annotationLabels: [
      "Primary Restraint Ligament",
      "Secondary Stabilisers",
      "Joint Line Reference",
    ],
    anonymisationConfirmed: false,
    publicationApprovalConfirmed: false,
    clinicalReviewStatus: "pending-clinical-review",
    source: "Awaiting consultant-supplied anonymised imaging",
    caption: "Example imaging illustrating chronic knee instability will appear here once a consultant-supplied, anonymised scan has been clinically approved.",
    altText: "MRI of the knee demonstrating the ligamentous structures relevant to chronic knee instability, annotated for educational use.",
    filePath: "/images/imaging/knee-instability-mri.png",
    status: "Awaiting clinical review",
  },

  // ──────────────────────────────────────────────────────────────
  // BAKER'S CYST — awaiting consultant-supplied imaging
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-bakers-cyst-ultrasound",
    modality: "MRI",
    bodyRegion: "Knee — popliteal fossa",
    viewOrSequence: "Axial MRI",
    educationalFinding: "Large, well-defined fluid-filled popliteal (Baker's) cyst",
    annotationLabels: [
      "Cyst Fluid Collection",
      "Gastrocnemius–Semimembranosus Bursa",
      "Adjacent Joint Recess",
    ],
    annotationPositions: [
      { x: 34, y: 78 },
      { x: 27, y: 60 },
      { x: 45, y: 30 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Axial MRI demonstrating a large popliteal (Baker's) cyst. Educational example only.",
    altText: "Axial MRI of the knee showing a large fluid-filled Baker's cyst in the popliteal fossa, annotated for educational use.",
    filePath: "/images/imaging/bakers-cyst-mri-axial.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // KNEE TENDINOPATHY — awaiting consultant-supplied imaging
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-knee-tendinopathy-ultrasound",
    modality: "MRI",
    bodyRegion: "Knee — sagittal plane",
    viewOrSequence: "Sagittal MRI",
    educationalFinding: "Patellar tendinopathy at the tendon origin, inferior pole of the patella",
    annotationLabels: [
      "Patellar Tendinopathy",
    ],
    annotationPositions: [
      { x: 30, y: 70 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Sagittal MRI of the knee demonstrating patellar tendinopathy at the tendon's origin from the inferior pole of the patella. Educational example only.",
    altText: "Sagittal MRI of the knee showing the joint and surrounding soft tissue, annotated for educational use.",
    filePath: "/images/imaging/knee-tendinopathy-mri-sagittal.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // PATELLAR INSTABILITY — awaiting consultant-supplied imaging
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-patellar-instability-mri",
    modality: "MRI",
    bodyRegion: "Knee — patellofemoral joint",
    viewOrSequence: "Axial MRI",
    educationalFinding: "Patellar tracking within the trochlear groove",
    annotationLabels: [
      "Patellar Tilt / Position",
      "Trochlear Groove Contour",
      "Medial Patellofemoral Ligament (MPFL) Region",
    ],
    annotationPositions: [
      { x: 50, y: 14 },
      { x: 40, y: 26 },
      { x: 62, y: 20 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Axial MRI demonstrating patellar position within the trochlear groove. Educational example only — not for diagnostic use.",
    altText: "Axial MRI of the patellofemoral joint showing patellar tracking and trochlear groove anatomy, annotated for educational use.",
    filePath: "/images/imaging/patellar-instability-mri-axial.png",
    status: "Published",
  },

  // ──────────────────────────────────────────────────────────────
  // LOOSE BODIES — awaiting consultant-supplied imaging
  // ──────────────────────────────────────────────────────────────
  {
    id: "imaging-loose-bodies-xray",
    modality: "X-ray",
    bodyRegion: "Knee — intra-articular",
    viewOrSequence: "AP",
    educationalFinding: "Radio-opaque intra-articular loose body within the intercondylar notch",
    annotationLabels: [
      "Loose Body",
      "Joint Space",
    ],
    annotationPositions: [
      { x: 49, y: 46 },
      { x: 50, y: 58 },
    ],
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "AP X-ray demonstrating a radio-opaque loose body within the knee joint. Educational example only.",
    altText: "AP X-ray of the knee showing a small round radio-opaque loose body within the intercondylar notch, annotated for educational use.",
    filePath: "/images/imaging/loose-bodies-xray.png",
    status: "Published",
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
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Ultrasound image illustrating real-time needle guidance into the knee joint recess. Educational concept only — does not guarantee needle placement accuracy.",
    altText: "Ultrasound scan showing a needle being guided into the suprapatellar recess of the knee joint under real-time visualisation. Annotated for educational use.",
    filePath: "/images/imaging/ultrasound-injection-concept.png",
    status: "Published",
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
    anonymisationConfirmed: true,
    publicationApprovalConfirmed: true,
    clinicalReviewStatus: "clinically-approved",
    source: "Provided by consultant — Mr R J Pacheco",
    caption: "Post-operative AP X-ray demonstrating a total knee replacement in satisfactory position. Educational example only.",
    altText: "Post-operative AP X-ray of a total knee replacement showing the femoral and tibial components in anatomical alignment. Annotated for educational purposes only.",
    filePath: "/images/imaging/tkr-postop-xray.png",
    status: "Published",
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
