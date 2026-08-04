import { VisualAsset } from "@/types/visuals";

export const visualsInventory: VisualAsset[] = [
  // --- CONDITIONS PAGES ---
  // Knee Arthritis
  {
    id: "knee-arthritis-overview",
    page: "conditions/knee-arthritis",
    section: "overview",
    title: "Knee Arthritis Joint Anatomy",
    type: "anatomy",
    imagePath: "/images/conditions/knee-arthritis-overview.png",
    altText: "Diagram of a knee joint with osteoarthritis, highlighting loss of articular cartilage, joint space narrowing, and bone spurs.",
    caption: "Anatomical changes associated with osteoarthritis of the knee, showing cartridge degradation.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 },
    annotations: [
      { id: "cartilage-wear", x: 45, y: 35, label: "Cartilage Degeneration", description: "Thinning and erosion of the protective articular cartilage.", highlightColor: "coral" },
      { id: "bone-spurs", x: 65, y: 48, label: "Osteophytes (Bone Spurs)", description: "Bony projections forming along the joint margins in response to load changes.", highlightColor: "coral" },
      { id: "joint-space", x: 35, y: 52, label: "Narrowed Joint Space", description: "Reduced clearance between femur and tibia due to cartilage loss.", highlightColor: "coral" }
    ]
  },
  {
    id: "knee-arthritis-comparison",
    page: "conditions/knee-arthritis",
    section: "comparison",
    title: "Healthy Knee vs Osteoarthritic Knee Joint",
    type: "comparison",
    imagePath: "/images/conditions/knee-arthritis-comparison.png",
    altText: "Side-by-side comparison of a healthy knee joint showing smooth thick cartilage vs an arthritic knee showing cartilage erosion and rough bone contact.",
    caption: "Comparison showing normal anatomy vs degenerative joint changes of osteoarthritis.",
    placeholderLabel: "Comparison diagram pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 900, height: 500 }
  },
  {
    id: "knee-arthritis-imaging",
    page: "conditions/knee-arthritis",
    section: "imaging",
    title: "Weight-Bearing X-Ray: Knee Osteoarthritis",
    type: "imaging",
    imagePath: "/images/imaging/knee-arthritis-xray.png",
    altText: "Weight-bearing X-ray of an osteoarthritic knee demonstrating asymmetrical medial joint space narrowing.",
    caption: "Weight-bearing anterior-posterior (AP) X-ray showing medial joint space narrowing.",
    placeholderLabel: "Annotated X-ray example pending clinical approval",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "photography",
    requiredDimensions: { width: 800, height: 800 },
    annotations: [
      { id: "narrowing", x: 60, y: 47, label: "Medial Joint Space Narrowing", description: "Indicates loss of cartilage loading surface on the inner side of the knee.", highlightColor: "coral" },
      { id: "sclerosis", x: 62, y: 54, label: "Subchondral Sclerosis", description: "Increased bone density (whitening) under the worn cartilage zone.", highlightColor: "coral" }
    ]
  },
  {
    id: "knee-arthritis-pathway",
    page: "conditions/knee-arthritis",
    section: "pathway",
    title: "Osteoarthritis Treatment Pathway",
    type: "pathway",
    imagePath: "/images/conditions/knee-arthritis-pathway.png",
    altText: "Diagram mapping the progressive stages of knee arthritis treatment: lifestyle and physiotherapy, injections, and surgical replacement options.",
    caption: "Staged clinical management pathway for knee arthritis, focusing on conservative preservation first.",
    placeholderLabel: "Treatment pathway diagram pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 1000, height: 400 }
  },

  // Meniscal Tear
  {
    id: "meniscal-tear-overview",
    page: "conditions/meniscal-tear",
    section: "overview",
    title: "Meniscus Structure and Common Tears",
    type: "anatomy",
    imagePath: "/images/conditions/meniscal-tear-overview.png",
    altText: "Diagram of the meniscus cartilage from a top-down view showing medial and lateral menisci and typical tear configurations.",
    caption: "Anatomical view of the meniscus showing radial, longitudinal, and flap tear locations.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 },
    annotations: [
      { id: "medial-meniscus", x: 30, y: 45, label: "Medial Meniscus", description: "C-shaped inner cartilage shock absorber, frequently torn.", highlightColor: "navy" },
      { id: "lateral-meniscus", x: 70, y: 45, label: "Lateral Meniscus", description: "More circular outer cartilage shock absorber.", highlightColor: "navy" },
      { id: "tear-zone", x: 25, y: 38, label: "Tear Location", description: "Typical tear occurring in the posterior horn of the medial meniscus.", highlightColor: "coral" }
    ]
  },
  {
    id: "meniscal-tear-comparison",
    page: "conditions/meniscal-tear",
    section: "comparison",
    title: "Healthy Meniscus vs Torn Meniscus",
    type: "comparison",
    imagePath: "/images/conditions/meniscal-tear-comparison.png",
    altText: "Illustration displaying a smooth intact meniscus next to a torn meniscus with unstable edges.",
    caption: "Intact C-shaped meniscus disc compared to a vertical longitudinal meniscus tear.",
    placeholderLabel: "Comparison diagram pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 900, height: 500 }
  },
  {
    id: "meniscal-tear-imaging",
    page: "conditions/meniscal-tear",
    section: "imaging",
    title: "MRI Scan: Posterior Horn Medial Meniscal Tear",
    type: "imaging",
    imagePath: "/images/imaging/meniscal-tear-mri.png",
    altText: "Sagittal MRI view of a knee demonstrating high signal intensity extending to the inferior articular surface of the medial meniscus posterior horn.",
    caption: "Sagittal T2-weighted MRI scan showing a high-signal tear line in the posterior horn of the medial meniscus.",
    placeholderLabel: "Annotated MRI example pending clinical approval",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "photography",
    requiredDimensions: { width: 800, height: 800 },
    annotations: [
      { id: "mri-tear-line", x: 48, y: 62, label: "Tear Line", description: "White linear signal extending to the joint surface indicating a tear.", highlightColor: "coral" }
    ]
  },
  {
    id: "meniscal-tear-pathway",
    page: "conditions/meniscal-tear",
    section: "pathway",
    title: "Meniscal Tear Management Pathway",
    type: "pathway",
    imagePath: "/images/conditions/meniscal-tear-pathway.png",
    altText: "Flowchart showing conservative treatment (RICE and physio) vs surgical keyhole repair indicators.",
    caption: "Decision pathway for meniscal tears, separating degenerative tears from acute mechanical blocks.",
    placeholderLabel: "Treatment pathway diagram pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 1000, height: 400 }
  },

  // ACL Injury
  {
    id: "acl-injury-overview",
    page: "conditions/acl-injury",
    section: "overview",
    title: "Anterior Cruciate Ligament (ACL) Rupture",
    type: "anatomy",
    imagePath: "/images/conditions/acl-injury-overview.png",
    altText: "Diagram showing an anterior cruciate ligament tear inside the center of the knee joint.",
    caption: "Location of the Anterior Cruciate Ligament (ACL) and common mid-substance tear site.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 },
    annotations: [
      { id: "torn-acl", x: 50, y: 48, label: "Torn ACL Fibres", description: "Mid-substance discontinuity of the stabilizing ligament.", highlightColor: "coral" },
      { id: "pcl", x: 58, y: 42, label: "Posterior Cruciate Ligament (PCL)", description: "Remains intact behind the ACL, stabilizing posterior drawer.", highlightColor: "navy" }
    ]
  },
  {
    id: "acl-injury-imaging",
    page: "conditions/acl-injury",
    section: "imaging",
    title: "MRI Scan: Complete ACL Rupture",
    type: "imaging",
    imagePath: "/images/imaging/acl-injury-mri.png",
    altText: "Sagittal MRI slice showing absence of the normal dark, taut diagonal ACL band, replaced by amorphous high signal.",
    caption: "Sagittal MRI scan showing a full-thickness rupture of the Anterior Cruciate Ligament (ACL).",
    placeholderLabel: "Annotated MRI scan pending clinical approval",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "photography",
    requiredDimensions: { width: 800, height: 800 },
    annotations: [
      { id: "empty-notch", x: 52, y: 45, label: "Disorganized ACL Ligament notch", description: "Wavy, disconnected fibers and fluid accumulation in the femoral notch.", highlightColor: "coral" },
      { id: "bone-bruise", x: 30, y: 72, label: "Bone Contusion (Tibial)", description: "Bone bruising from translation during the initial pivot injury.", highlightColor: "coral" }
    ]
  },

  // Patellofemoral Pain
  {
    id: "patellofemoral-pain-overview",
    page: "conditions/patellofemoral-pain",
    section: "overview",
    title: "Patellofemoral Tracking and Joint Anatomy",
    type: "anatomy",
    imagePath: "/images/conditions/patellofemoral-pain-overview.png",
    altText: "Illustration of the kneecap resting in the trochlear groove showing lateral tracking forces.",
    caption: "The patellofemoral joint showing the sliding path of the kneecap in the femoral groove.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Cartilage Injury
  {
    id: "cartilage-injury-overview",
    page: "conditions/cartilage-injury",
    section: "overview",
    title: "Focal Articular Cartilage Defect (Chondral Defect)",
    type: "anatomy",
    imagePath: "/images/conditions/cartilage-injury-overview.png",
    altText: "Diagram showing a localized defect in the cartilage lining the femoral condyle, exposing the bone underneath.",
    caption: "Focal articular cartilage defect (chondral pothole) surrounded by healthy thick cartilage.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 },
    annotations: [
      { id: "focal-defect", x: 48, y: 38, label: "Chondral Defect", description: "Localized area of missing articular cartilage exposing subchondral bone.", highlightColor: "coral" }
    ]
  },

  // Knee Instability
  {
    id: "knee-instability-overview",
    page: "conditions/knee-instability",
    section: "overview",
    title: "Knee Joint Laxity and Structural Insufficiency",
    type: "anatomy",
    imagePath: "/images/conditions/knee-instability-overview.png",
    altText: "Illustration of the knee joint showing path of abnormal tibia translation under joint laxity.",
    caption: "Biomechanical translation indicating potential joint translation or knee instability.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Baker's Cyst
  {
    id: "bakers-cyst-overview",
    page: "conditions/bakers-cyst",
    section: "overview",
    title: "Popliteal Space and Baker's Cyst Anatomy",
    type: "anatomy",
    imagePath: "/images/conditions/bakers-cyst-overview.png",
    altText: "Posterior diagram of a knee showing a fluid-filled popliteal cyst emerging from the joint space.",
    caption: "Baker's cyst located in the popliteal space behind the knee joint.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Knee Tendinopathy
  {
    id: "knee-tendinopathy-overview",
    page: "conditions/knee-tendinopathy",
    section: "overview",
    title: "Patellar Tendon Structure and Inflammation Zone",
    type: "anatomy",
    imagePath: "/images/conditions/knee-tendinopathy-overview.png",
    altText: "Diagram showing the patellar tendon connecting the kneecap to the shin bone with micro-tears highlighted.",
    caption: "Patellar tendinopathy affecting the proximal tendon attachment near the inferior pole of the patella.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Patellar Instability
  {
    id: "patellar-instability-overview",
    page: "conditions/patellar-instability",
    section: "overview",
    title: "Kneecap Subluxation and Trochlear Groove Tracking",
    type: "anatomy",
    imagePath: "/images/conditions/patellar-instability-overview.png",
    altText: "Anterior diagram showing a kneecap displacing laterally outside the boundaries of the trochlear groove.",
    caption: "Lateral patellar dislocation showing rupture of the stabilizing medial patellofemoral ligament (MPFL).",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Loose Bodies
  {
    id: "loose-bodies-overview",
    page: "conditions/loose-bodies",
    section: "overview",
    title: "Free-Floating Loose Bodies in the Knee Joint",
    type: "anatomy",
    imagePath: "/images/conditions/loose-bodies-overview.png",
    altText: "Anterior diagram of a knee joint showing small free-floating fragments of bone or cartilage, including one wedged at the joint line.",
    caption: "Loose bodies floating within the joint cavity, with one fragment wedged at the joint line causing mechanical locking.",
    placeholderLabel: "Medical illustration pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 }
  },


  // --- TREATMENTS PAGES ---
  // Physiotherapy
  {
    id: "treatment-physiotherapy-overview",
    page: "treatments/physiotherapy",
    section: "overview",
    title: "Knee Rehabilitation Exercise Categories",
    type: "infographic",
    imagePath: "/images/treatments/physiotherapy-overview.jpg",
    altText: "Infographic displaying progressive knee exercises: range of motion, isometric quad sets, and balance training.",
    caption: "The structured phases of conservative physiotherapy and progressive strengthening.",
    placeholderLabel: "Rehabilitation guide visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 500 }
  },

  // Weight Management
  {
    id: "treatment-weight-management-overview",
    page: "treatments/weight-management",
    section: "overview",
    title: "Knee Joint Load Mechanical Principles",
    type: "infographic",
    imagePath: "/images/treatments/weight-management-overview.png",
    altText: "Biomechanical diagram showing how 1kg of body weight translates to 4kg of force across the patellofemoral joint during knee loading.",
    caption: "Mechanical loading magnification across the knee joint during walking and deep bending.",
    placeholderLabel: "Mechanical load visual pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 500 }
  },

  // ACL Reconstruction
  {
    id: "treatment-acl-reconstruction-overview",
    page: "treatments/acl-reconstruction",
    section: "overview",
    title: "ACL Reconstruction Graft Harvest and Tunnel Drilling",
    type: "procedure",
    imagePath: "/images/treatments/acl-reconstruction-overview.png",
    altText: "Diagram of keyhole knee surgery showing femoral and tibial bone tunnels and tendon graft insertion to reconstruct the ACL.",
    caption: "ACL Reconstruction showing reconstruction tunnels and graft placement.",
    placeholderLabel: "Procedure illustration pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Osteotomy (Realignment Procedures)
  {
    id: "treatment-osteotomy-overview",
    page: "treatments/osteotomy",
    section: "overview",
    title: "Knee Realignment Osteotomy — Bone Cut and Plate Fixation",
    type: "procedure",
    imagePath: "/images/treatments/osteotomy-overview.png",
    altText: "Medical illustration of a high tibial osteotomy showing an angular bone wedge opened in the upper tibia and secured with a titanium locking plate and screws to correct varus knee alignment.",
    caption: "Opening-wedge high tibial osteotomy: the corrected mechanical axis is maintained by a titanium locking plate while the bone gap heals.",
    placeholderLabel: "Osteotomy procedure illustration pending",
    status: "pending",
    priority: "high",
    clinicalReviewStatus: "pending-clinical-review",
    photographyOrIllustration: "illustration",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Total Knee Replacement
  {
    id: "treatment-total-knee-replacement-overview",
    page: "treatments/total-knee-replacement",
    section: "overview",
    title: "Total Knee Replacement Prosthesis Layout",
    type: "procedure",
    imagePath: "/images/treatments/total-knee-replacement-overview.png",
    altText: "Diagram illustrating femoral component, tibial tray, and polyethylene spacer resurfacing the arthritic joint.",
    caption: "Tricompartmental total knee replacement showing prosthetic alignment.",
    placeholderLabel: "Prosthesis visual pending",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },


  
  // Activity Modification
  {
    id: "treatment-activity-modification-overview",
    page: "treatments/activity-modification",
    section: "overview",
    title: "Activity Modification Overview",
    type: "procedure",
    imagePath: "/images/treatments/activity-modification-overview.png",
    altText: "Clinical illustration for activity modification",
    caption: "Overview of activity modification.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Pain Management
  {
    id: "treatment-pain-management-overview",
    page: "treatments/pain-management",
    section: "overview",
    title: "Pain Management Overview",
    type: "procedure",
    imagePath: "/images/treatments/pain-management-overview.png",
    altText: "Clinical illustration for pain management",
    caption: "Overview of pain management.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Knee Bracing
  {
    id: "treatment-knee-bracing-overview",
    page: "treatments/knee-bracing",
    section: "overview",
    title: "Knee Bracing Overview",
    type: "procedure",
    imagePath: "/images/treatments/knee-bracing-overview.png",
    altText: "Clinical illustration for knee bracing",
    caption: "Overview of knee bracing.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Knee Arthroscopy
  {
    id: "treatment-knee-arthroscopy-overview",
    page: "treatments/knee-arthroscopy",
    section: "overview",
    title: "Knee Arthroscopy Overview",
    type: "procedure",
    imagePath: "/images/treatments/knee-arthroscopy-overview.png",
    altText: "Clinical illustration for knee arthroscopy",
    caption: "Overview of knee arthroscopy.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Meniscal Surgery
  {
    id: "treatment-meniscal-surgery-overview",
    page: "treatments/meniscal-surgery",
    section: "overview",
    title: "Meniscal Surgery Overview",
    type: "procedure",
    imagePath: "/images/treatments/meniscal-surgery-overview.png",
    altText: "Clinical illustration for meniscal surgery",
    caption: "Overview of meniscal surgery.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Cartilage Procedures
  {
    id: "treatment-cartilage-procedures-overview",
    page: "treatments/cartilage-procedures",
    section: "overview",
    title: "Cartilage Procedures Overview",
    type: "procedure",
    imagePath: "/images/treatments/cartilage-procedures-overview.png",
    altText: "Clinical illustration for cartilage procedures",
    caption: "Overview of cartilage procedures.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Patellar Stabilisation
  {
    id: "treatment-patellar-stabilisation-overview",
    page: "treatments/patellar-stabilisation",
    section: "overview",
    title: "Patellar Stabilisation Overview",
    type: "procedure",
    imagePath: "/images/treatments/patellar-stabilisation-overview.png",
    altText: "Clinical illustration for patellar stabilisation",
    caption: "Overview of patellar stabilisation.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Partial Knee Replacement
  {
    id: "treatment-partial-knee-replacement-overview",
    page: "treatments/partial-knee-replacement",
    section: "overview",
    title: "Partial Knee Replacement Overview",
    type: "procedure",
    imagePath: "/images/treatments/partial-knee-replacement-overview-v2.png",
    altText: "Clinical illustration for partial knee replacement",
    caption: "Overview of partial knee replacement.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Revision Knee Replacement
  {
    id: "treatment-revision-knee-replacement-overview",
    page: "treatments/revision-knee-replacement",
    section: "overview",
    title: "Revision Knee Replacement Overview",
    type: "procedure",
    imagePath: "/images/treatments/revision-knee-replacement-overview.png",
    altText: "Clinical illustration for revision knee replacement",
    caption: "Overview of revision knee replacement.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Preparing For Surgery
  {
    id: "treatment-preparing-for-surgery-overview",
    page: "treatments/preparing-for-surgery",
    section: "overview",
    title: "Preparing For Surgery Overview",
    type: "procedure",
    imagePath: "/images/treatments/preparing-for-surgery-overview.png",
    altText: "Clinical illustration for preparing for surgery",
    caption: "Overview of preparing for surgery.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Enhanced Recovery
  {
    id: "treatment-enhanced-recovery-overview",
    page: "treatments/enhanced-recovery",
    section: "overview",
    title: "Enhanced Recovery Overview",
    type: "procedure",
    imagePath: "/images/treatments/enhanced-recovery-overview.png",
    altText: "Clinical illustration for enhanced recovery",
    caption: "Overview of enhanced recovery.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Physiotherapy After Surgery
  {
    id: "treatment-physiotherapy-after-surgery-overview",
    page: "treatments/physiotherapy-after-surgery",
    section: "overview",
    title: "Physiotherapy After Surgery Overview",
    type: "procedure",
    imagePath: "/images/treatments/physiotherapy-after-surgery-overview.png",
    altText: "Clinical illustration for physiotherapy after surgery",
    caption: "Overview of physiotherapy after surgery.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Returning To Driving
  {
    id: "treatment-returning-to-driving-overview",
    page: "treatments/returning-to-driving",
    section: "overview",
    title: "Returning To Driving Overview",
    type: "procedure",
    imagePath: "/images/treatments/returning-to-driving-overview.png",
    altText: "Clinical illustration for returning to driving",
    caption: "Overview of returning to driving.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Returning To Work
  {
    id: "treatment-returning-to-work-overview",
    page: "treatments/returning-to-work",
    section: "overview",
    title: "Returning To Work Overview",
    type: "procedure",
    imagePath: "/images/treatments/returning-to-work-overview.png",
    altText: "Clinical illustration for returning to work",
    caption: "Overview of returning to work.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Returning To Sport
  {
    id: "treatment-returning-to-sport-overview",
    page: "treatments/returning-to-sport",
    section: "overview",
    title: "Returning To Sport Overview",
    type: "procedure",
    imagePath: "/images/treatments/returning-to-sport-overview.png",
    altText: "Clinical illustration for returning to sport",
    caption: "Overview of returning to sport.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Recovery Faqs
  {
    id: "treatment-recovery-faqs-overview",
    page: "treatments/recovery-faqs",
    section: "overview",
    title: "Recovery Faqs Overview",
    type: "procedure",
    imagePath: "/images/treatments/recovery-faqs-overview.png",
    altText: "Clinical illustration for recovery faqs",
    caption: "Overview of recovery faqs.",
    placeholderLabel: "Visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // --- INJECTIONS PAGES ---
  // Corticosteroid
  {
    id: "injection-corticosteroid-anatomy",
    page: "injections/corticosteroid",
    section: "overview",
    title: "Intra-Articular Knee Joint Injection Access Point",
    type: "procedure",
    imagePath: "/images/injections/corticosteroid-anatomy.png",
    altText: "Anatomy of the knee joint showing lateral retropatellar approach for needle path.",
    caption: "Clinical needle path for lateral retropatellar injection into the suprapatellar pouch.",
    placeholderLabel: "Injection needle path visual pending clinical approval",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Hyaluronic Acid
  {
    id: "injection-hyaluronic-acid-anatomy",
    page: "injections/hyaluronic-acid",
    section: "overview",
    title: "Hyaluronic Acid Viscosupplementation lubricating effect",
    type: "procedure",
    imagePath: "/images/injections/hyaluronic-acid-anatomy.png",
    altText: "Concept diagram of hyaluronic acid gel lubricating joint surfaces.",
    caption: "Viscosupplementation gel lubricating and shock-absorbing in the osteoarthritic joint space.",
    placeholderLabel: "Viscosupplementation visual pending clinical approval",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // PRP (Platelet-Rich Plasma)
  {
    id: "injection-prp-anatomy",
    page: "injections/prp",
    section: "overview",
    title: "PRP Centrifugation and Growth Factor Delivery",
    type: "procedure",
    imagePath: "/images/injections/prp-anatomy.png",
    altText: "Diagram outlining blood spin sequence and growth factor density isolation.",
    caption: "Centrifugation process separating concentrated platelet-rich plasma from red blood cells.",
    placeholderLabel: "PRP process infographic pending clinical approval",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Subtlety of Arthrosamid
  {
    id: "injection-arthrosamid-anatomy",
    page: "injections/arthrosamid",
    section: "overview",
    title: "Arthrosamid Polyacrylamide Hydrogel Integration",
    type: "procedure",
    imagePath: "/images/injections/arthrosamid-anatomy.png",
    altText: "Diagram showing Arthrosamid hydrogel integrating into the synovial lining of the knee joint.",
    caption: "Non-resorbable hydrogel cushion coating the inner synovium of the joint capsule.",
    placeholderLabel: "Hydrogel integration illustration pending clinical approval",
    status: "approved",
    priority: "high",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },

  // Ultrasound-Guided Injections
  {
    id: "injection-ultrasound-anatomy",
    page: "injections/ultrasound-guided-knee-injections",
    section: "overview",
    title: "Real-Time Ultrasound Injection Guidance",
    type: "imaging",
    imagePath: "/images/injections/ultrasound-guided-knee-injections.png",
    altText: "Drawing representing ultrasound transducer placement on the knee joint showing real-time visualization of needle tip positioning.",
    caption: "Ultrasound probe placement guiding needle access into the joint space with precision.",
    placeholderLabel: "Ultrasound needle path visual pending clinical approval",
    status: "pending",
    priority: "high",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },

  // --- SYMPTOMS PAGES ---
  {
    id: "symptom-back-of-knee-pain-overview",
    page: "symptoms/back-of-knee-pain",
    section: "overview",
    title: "Anatomical Location: Back of Knee Pain",
    type: "anatomy",
    imagePath: "/images/symptoms/back-of-knee-pain-overview.png",
    altText: "Posterior view of the knee joint with the popliteal space highlighted in orange, representing common sources of back-of-knee pain.",
    caption: "Posterior anatomy of the knee joint, highlighting the popliteal fossa zone.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-clicking-knee-overview",
    page: "symptoms/clicking-knee",
    section: "overview",
    title: "Anatomical Location: Clicking/Grinding Knee",
    type: "anatomy",
    imagePath: "/images/symptoms/clicking-knee-overview.jpg",
    altText: "Clinical photograph showing a clinician placing their hand over a patient's patella (kneecap) to assess for clicking, popping, or grinding sensations (joint crepitus).",
    caption: "Palpation and assessment of the patella to evaluate joint crepitus and tracking.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-front-of-knee-pain-overview",
    page: "symptoms/front-of-knee-pain",
    section: "overview",
    title: "Anatomical Location: Front of Knee Pain",
    type: "anatomy",
    imagePath: "/images/symptoms/front-of-knee-pain-overview.png",
    altText: "Anterior view of the knee joint with the patella and patellar tendon highlighted in orange, showing pain zones.",
    caption: "Anterior anatomy highlighting patellofemoral tracking and tendon load zones.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-inner-knee-pain-overview",
    page: "symptoms/inner-knee-pain",
    section: "overview",
    title: "Anatomical Location: Inner Knee Pain",
    type: "anatomy",
    imagePath: "/images/symptoms/inner-knee-pain-overview.png",
    altText: "Medial view of the knee joint with the medial compartment and collateral ligament highlighted in orange.",
    caption: "Medial anatomy of the knee, highlighting the inner joint line and collateral ligament.",
    placeholderLabel: "Anatomical visual pending — awaiting a correct medial-view illustration",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-knee-giving-way-overview",
    page: "symptoms/knee-giving-way",
    section: "overview",
    title: "Anatomical Location: Knee Giving Way",
    type: "anatomy",
    imagePath: "/images/symptoms/knee-giving-way-overview.jpg",
    altText: "Clinical action photograph showing a female runner experiencing sudden joint instability, causing her knee to buckle/collapse inward during motion.",
    caption: "Sudden knee buckling and collapse (instability) during athletic activity.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-knee-pain-overview",
    page: "symptoms/knee-pain",
    section: "overview",
    title: "Anatomical Location: Diffuse Knee Pain",
    type: "anatomy",
    imagePath: "/images/symptoms/knee-pain-overview.png",
    altText: "Anterior view of the knee joint with a generalized orange highlight representing diffuse pain across the joint capsule.",
    caption: "Diffuse pain representation across the main knee joint capsule.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-knee-pain-after-injury-overview",
    page: "symptoms/knee-pain-after-injury",
    section: "overview",
    title: "Anatomical Location: Knee Pain After Injury",
    type: "anatomy",
    imagePath: "/images/symptoms/knee-pain-after-injury-overview.png",
    altText: "High-fidelity 3D medical illustration of a human knee joint showing skeletal structures and highlighted pain zone.",
    caption: "3D anatomical render of the knee joint, showing the patella, femur, tibia, and patellar tendon with pain indications.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-locked-knee-overview",
    page: "symptoms/locked-knee",
    section: "overview",
    title: "Anatomical Location: Locked Knee",
    type: "anatomy",
    imagePath: "/images/symptoms/locked-knee-overview.jpg",
    altText: "Clinical photograph showing a patient's knee stuck in a flexed (bent) position on an examination table, unable to fully extend.",
    caption: "Knee joint locked in a flexed position due to mechanical obstruction.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-outer-knee-pain-overview",
    page: "symptoms/outer-knee-pain",
    section: "overview",
    title: "Anatomical Location: Outer Knee Pain",
    type: "anatomy",
    imagePath: "/images/symptoms/outer-knee-pain-overview.png",
    altText: "Lateral view of the knee joint with the lateral compartment and collateral ligament highlighted in orange.",
    caption: "Lateral anatomy of the knee, highlighting the outer joint line and collateral ligament.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-stiff-knee-overview",
    page: "symptoms/stiff-knee",
    section: "overview",
    title: "Anatomical Location: Stiff Knee",
    type: "anatomy",
    imagePath: "/images/symptoms/stiff-knee-overview.png",
    altText: "Clinical photograph demonstrating passive/assisted knee flexion range of motion testing in the prone position.",
    caption: "Knee flexion range of motion assessment using an assistance strap to evaluate stiffness.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-swollen-knee-overview",
    page: "symptoms/swollen-knee",
    section: "overview",
    title: "Anatomical Location: Swollen Knee",
    type: "anatomy",
    imagePath: "/images/symptoms/swollen-knee-overview.png",
    altText: "Clinical photograph of a swollen right knee showing joint effusion in the suprapatellar compartment.",
    caption: "Clinical photograph demonstrating a right knee joint effusion (swollen knee).",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  },
  {
    id: "symptom-unable-to-straighten-knee-overview",
    page: "symptoms/unable-to-straighten-knee",
    section: "overview",
    title: "Anatomical Location: Unable to Straighten Knee",
    type: "anatomy",
    imagePath: "/images/symptoms/unable-to-straighten-knee-overview.jpg",
    altText: "Clinical photograph showing a patient's leg lying on an examination couch, with the knee unable to fully straighten (extension deficit).",
    caption: "Clinical presentation of an extension deficit, where the knee remains locked or held in a flexed position.",
    placeholderLabel: "Anatomical visual pending",
    status: "approved",
    priority: "medium",
    clinicalReviewStatus: "clinically-approved",
    requiredDimensions: { width: 800, height: 600 }
  }
];

export const getVisualAsset = (page: string, section: string): VisualAsset => {
  const found = visualsInventory.find((asset) => asset.page === page && asset.section === section);
  if (found) {
    // Override placeholder labels to exactly match user's visual verification terms for Pass 1
    if (page.startsWith("conditions/") && section === "overview") {
      found.placeholderLabel = "Medical illustration pending clinical review";
    } else if (page.startsWith("treatments/") && section === "overview") {
      found.placeholderLabel = "Treatment visual pending clinical review";
    } else if (page.startsWith("injections/") && section === "overview") {
      found.placeholderLabel = "Injection procedure visual pending clinical review";
    } else if (page.startsWith("symptoms/") && section === "overview") {
      found.placeholderLabel = "Pain-location visual pending clinical review";
    }
    return found;
  }

  // Generate dynamic fallback visual asset so it never returns null/empty
  let type: any = "anatomy";
  if (section === "imaging") type = "imaging";
  if (section === "pathway") type = "pathway";
  if (section === "comparison") type = "comparison";

  let placeholderLabel = "Visual asset pending clinical review";
  if (page.startsWith("conditions/")) {
    placeholderLabel = "Medical illustration pending clinical review";
  } else if (page.startsWith("treatments/")) {
    placeholderLabel = "Treatment visual pending clinical review";
    type = "procedure";
  } else if (page.startsWith("injections/")) {
    placeholderLabel = "Injection procedure visual pending clinical review";
    type = "procedure";
  } else if (page.startsWith("symptoms/")) {
    placeholderLabel = "Pain-location visual pending clinical review";
    type = "symptom-locator";
  }

  // Generate readable title
  const parts = page.split("/");
  const pageName = parts[parts.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const sectionName = section.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `${page.replace(/\//g, "-")}-${section}`,
    page,
    section,
    title: `${pageName} ${sectionName}`,
    type,
    imagePath: "",
    altText: `${pageName} ${sectionName} visual pending clinical review.`,
    caption: `${pageName} ${sectionName} diagram pending clinical verification.`,
    placeholderLabel,
    status: "pending",
    priority: "medium",
    clinicalReviewStatus: "pending-clinical-review",
    requiredDimensions: { width: 800, height: 600 }
  };
};

export const getVisualAssetsByPage = (page: string): VisualAsset[] => {
  return visualsInventory.filter((asset) => asset.page === page);
};
