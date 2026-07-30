export interface ConditionData {
  slug: string;
  name: string;
  alternateName?: string;
  shortDescription: string;
  introduction: string;
  whatIs: string;
  symptoms: string[];
  causes: string[];
  assessment: string[];
  investigations: string[];
  treatments: string[];
  surgeryTitle?: string;
  surgeryDetails?: string[];
  faqs: { question: string; answer: string }[];
  relatedSymptoms: string[]; // e.g. ["Knee Pain", "Stiff Knee"]
  relatedConditions: string[]; // e.g. ["meniscal-tear", "acl-injury"]
  relatedTreatments: string[]; // e.g. ["Physiotherapy", "Knee Injections"]
  references?: { text: string; url: string }[];
  metadataTitle: string;
  metadataDescription: string;
  reviewStatus: string;
}

export const conditionsData: Record<string, ConditionData> = {
  "knee-arthritis": {
    slug: "knee-arthritis",
    name: "Knee Arthritis",
    alternateName: "Osteoarthritis of the Knee",
    shortDescription: "Degeneration of the knee joint cartilage leading to progressive pain, stiffness, and restricted mobility.",
    introduction: "Knee arthritis is a common cause of pain, stiffness and reduced mobility. This page explains how it may affect the knee, how it is assessed and the treatment options that may be considered.",
    whatIs: "Knee arthritis is a clinical condition characterised by the gradual loss or damage of the smooth articular cartilage lining the joint surfaces. As the cartilage thins and wears, the underlying bone surfaces can experience friction, narrowing the joint space. This can lead to joint stiffness, pain, and reduced function. Wording is cautious: symptoms vary greatly between individuals, and X-ray findings do not always correlate with symptom severity.",
    symptoms: [
      "Knee pain (especially during weight-bearing or walking)",
      "Joint stiffness, particularly in the morning",
      "Reduced movement and difficulty bending the knee",
      "Intermittent swelling or joint warmth",
      "Crepitus (grinding or creaking sensations) during motion"
    ],
    causes: [
      "Age-related degenerative wear of joint surfaces",
      "Previous knee trauma or fractures (post-traumatic arthritis)",
      "Previous meniscal or ligament injury altering loading",
      "Leg alignment factors or genetic predispositions"
    ],
    assessment: [
      "Discussion of symptoms, duration, and mechanical triggers",
      "Assessment of impact on work, sleep, walking, and daily activity",
      "Review of previous knee injuries, operations, and treatments",
      "Physical examination of alignment, movement, swelling, and stability",
      "Evaluation of patient goals and review of existing imaging"
    ],
    investigations: [
      "Weight-bearing X-rays to assess joint space narrowing and bone spurs",
      "MRI scans (if diagnostic uncertainty or concurrent soft-tissue pathology exists)",
      "Blood tests (to rule out inflammatory arthritis in selected cases)"
    ],
    treatments: [
      "Education and lifestyle or activity modification",
      "Physiotherapy and quadriceps strengthening exercises",
      "Weight management strategies to reduce mechanical load",
      "Pain-relieving medication and clinical joint injections",
      "Surgical replacement (partial or total knee replacement) when appropriate"
    ],
    surgeryTitle: "Knee Replacement Procedures",
    surgeryDetails: [
      "Partial Knee Replacement (unicompartmental) for single-compartment wear",
      "Total Knee Replacement for widespread tricompartmental degeneration"
    ],
    faqs: [
      {
        question: "Is surgery always required for knee arthritis?",
        answer: "No, surgical intervention is not always required. We prioritise non-surgical joint preservation strategies, such as physical therapy, activity modifications, and clinical knee injections, recommending surgery only when conservative options have been fully explored and joint pain continues to restrict your quality of life.",
      },
      {
        question: "What is the typical recovery time after a knee replacement?",
        answer: "Hospital stay is usually 1-3 days. Patients typically walk with aids for 4-6 weeks and require structured physiotherapy. Significant pain relief and functional improvement are observed by 3 months, with full recovery continuing up to 1 year.",
      },
      {
        question: "Does knee arthritis always get worse?",
        answer: "Knee arthritis is typically a progressive condition, meaning it can change over time. However, the rate of progression varies significantly between individuals. Many patients manage symptoms effectively for years using non-surgical strategies like physical therapy, weight management, and targeted injections, without requiring surgery.",
      },
      {
        question: "Do I need an MRI for knee arthritis?",
        answer: "No, an MRI is not required for every patient. In most cases of knee arthritis, a detailed clinical examination and standard weight-bearing X-rays are sufficient to establish a diagnosis. An MRI may be recommended if there is diagnostic uncertainty, or if another soft-tissue condition (such as a meniscus tear or ligament injury) is suspected.",
      },
      {
        question: "Can exercise make arthritis worse?",
        answer: "No, appropriate low-impact exercise does not make knee arthritis worse. In fact, exercise is a primary recommendation for managing symptoms. Strengthening the muscles surrounding the joint (such as the quadriceps) and maintaining flexibility can reduce pain and improve knee stability. High-impact or repetitive overloading, however, should be managed carefully.",
      },
      {
        question: "Are knee injections suitable for everyone?",
        answer: "No, knee injections are not suitable for all individuals. Suitability depends on the severity of the arthritis, your medical history, and any existing health conditions (e.g., active infections or uncontrolled diabetes). Benefits vary and are often temporary. A full clinical discussion is required to evaluate the risks and alternatives.",
      },
      {
        question: "When should I consider knee replacement?",
        answer: "Knee replacement surgery is typically discussed when knee pain and stiffness significantly restrict your daily activities, sleep, or mobility, and when appropriate non-surgical treatments (such as physical therapy and injections) have failed to provide sufficient relief. The decision is made through a shared process between you and your consultant.",
      },
      {
        question: "Can I continue working or exercising?",
        answer: "Yes, maintaining active participation in work and low-impact exercise is generally encouraged. It helps preserve joint range of motion and overall health. Modifying activities—such as swimming or cycling instead of high-impact running—and taking regular breaks can help manage symptoms while keeping you active.",
      },
      {
        question: "Can arthritis affect only one part of the knee?",
        answer: "Yes. The knee joint has three main compartments: medial (inside), lateral (outside), and patellofemoral (under the kneecap). Arthritis can be localized to just one compartment (unicompartmental arthritis) or affect multiple areas (tricompartmental arthritis). If localized, a partial knee replacement may be a clinical option.",
      },
      {
        question: "Do I need a GP referral for a private consultation?",
        answer: "While a GP referral is highly recommended and often required by private medical insurance companies to authorize cover, self-paying patients can typically self-refer and schedule a consultation directly with the clinic. We recommend checking with your insurance provider prior to booking.",
      }
    ],
    relatedSymptoms: ["Knee Pain", "Stiff Knee", "Swollen Knee", "Clicking or Grinding"],
    relatedConditions: ["meniscal-tear", "patellofemoral-pain", "cartilage-injury", "bakers-cyst", "loose-bodies"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health", "Partial Knee Replacement", "Total Knee Replacement"],
    references: [
      { text: "NICE guideline NG226 — Osteoarthritis in over 16s: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng226" },
      { text: "NHS — Osteoarthritis", url: "https://www.nhs.uk/conditions/osteoarthritis/" }
    ],
    metadataTitle: "Knee Arthritis: Causes & Care | Lincolnshire Knee Clinic",
    metadataDescription: "Knee arthritis causes pain, stiffness and swelling that worsen with activity. Explore diagnosis, investigations and treatments from conservative care to replacement.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "meniscal-tear": {
    slug: "meniscal-tear",
    name: "Meniscal Tear",
    alternateName: "Torn Meniscus",
    shortDescription: "A tear in the shock-absorbing C-shaped cartilage discs of the knee, often caused by twisting forces or age-related changes.",
    introduction: "A meniscal tear involves damage to the C-shaped shock-absorbing cartilage discs situated inside the knee joint. This page explains the role of the meniscus, common symptoms, assessment, and treatment pathways.",
    whatIs: "The medial and lateral menisci are vital C-shaped cartilage discs that act as shock absorbers, protecting the joint surfaces and distributing weight. Meniscal tears can occur from acute twisting injuries (common in sports) or as part of gradual degenerative changes in older joints. Wording is cautious: not all tears cause symptoms, and not all require surgery. Suitability for repair or conservative care depends on tear configuration, location, and clinical findings.",
    symptoms: [
      "Sharp pain localized along the knee joint line",
      "Delayed swelling and joint stiffness developing over 24-48 hours",
      "Mechanical symptoms, including clicking, catching, or the joint locking in a bent position",
      "Difficulty with deep knee bending, kneeling, or twisting under load"
    ],
    causes: [
      "Acute twisting movements or pivoting during sports",
      "Degenerative wear of meniscal cartilage in older joints under normal daily load",
      "Sudden knee flexion or landing awkwardly from a jump"
    ],
    assessment: [
      "Discussion of symptoms, onset, and injury mechanism (e.g., twisting)",
      "Evaluation of locking, catching, or giving way episodes",
      "Assessment of impact on work, sleep, walking, and sport",
      "Physical examination checking joint line tenderness, range of motion, and mechanical provocation tests"
    ],
    investigations: [
      "MRI scan (the gold standard for visualizing meniscus tear size and position)",
      "Standard X-rays (to check for joint degeneration or loose bony fragments)"
    ],
    treatments: [
      "RICE protocol (Rest, Ice, Compression, Elevation) and load modification",
      "Physiotherapy focusing on leg alignment and muscle control",
      "Knee injections to manage localized pain and swelling in degenerative cases",
      "Knee arthroscopy (keyhole surgery) for repair or debridement in selected cases"
    ],
    surgeryTitle: "Meniscal Surgical Options",
    surgeryDetails: [
      "Arthroscopic Meniscal Repair (stitching the tear back together for vascularized tears)",
      "Arthroscopic Partial Meniscectomy (trimming away unstable torn cartilage edges)"
    ],
    faqs: [
      {
        question: "Do I need an MRI for a meniscal tear?",
        answer: "Yes, an MRI is the standard investigation to confirm a meniscal tear and evaluate its size, shape, and location. It also helps check for associated injuries to the ligaments or articular cartilage."
      },
      {
        question: "Does every meniscal tear need surgery?",
        answer: "No. Many meniscal tears, particularly degenerative tears in older adults, can be managed effectively without surgery using structured physical therapy, activity modification, and pain management."
      },
      {
        question: "Can a meniscal tear heal on its own?",
        answer: "Tears located in the outer 'red zone' (which has a good blood supply) have some potential to heal without surgery. Tears in the inner 'white zone' lack a direct blood supply and do not heal, though they may become asymptomatic with rehabilitation."
      },
      {
        question: "How long is recovery after meniscus surgery?",
        answer: "For a partial meniscectomy (trimming), recovery is relatively fast, often 2-4 weeks. For a meniscal repair (stitching), recovery is longer—typically 6-12 weeks—and may require temporary crutches and a protective brace."
      },
      {
        question: "Can I exercise with a torn meniscus?",
        answer: "Low-impact exercises such as swimming and cycling are encouraged to maintain joint mobility and strength. However, activities involving twisting, pivoting, or deep squatting should be avoided as they can worsen symptoms."
      },
      {
        question: "Do I need a GP referral for a private consultation?",
        answer: "A GP referral is usually required by private medical insurance companies to authorize coverage. Self-paying patients can self-refer and schedule a consultation directly."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Swollen Knee", "Locking Knee", "Clicking or Grinding"],
    relatedConditions: ["knee-arthritis", "acl-injury", "cartilage-injury", "knee-instability", "loose-bodies"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health"],
    references: [
      { text: "NHS — Meniscus tear (knee cartilage damage)", url: "https://www.nhs.uk/conditions/meniscus-tear/" },
      { text: "NICE Clinical Knowledge Summary — Knee pain – assessment", url: "https://cks.nice.org.uk/topics/knee-pain-assessment/" }
    ],
    metadataTitle: "Meniscal Tear: Causes & Care | Lincolnshire Knee Clinic",
    metadataDescription: "A torn meniscus can cause knee locking, swelling and catching after a twisting injury. See how MRI diagnosis guides surgical and non-surgical treatment choices.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "acl-injury": {
    slug: "acl-injury",
    name: "ACL Injury",
    alternateName: "Anterior Cruciate Ligament Tear",
    shortDescription: "A sprain or rupture of the Anterior Cruciate Ligament, a primary stabilizer inside the knee joint, common in pivoting sports.",
    introduction: "An ACL injury is a stretch, partial tear, or complete rupture of the Anterior Cruciate Ligament. This page explains the role of the ACL, sports injuries, and treatment options.",
    whatIs: "The Anterior Cruciate Ligament (ACL) is a primary stabilizer inside the knee, preventing the shin bone from sliding too far forward and providing rotational stability during pivoting. ACL injuries are often sports-related and occur during sudden deceleration, cutting, or landing. Wording is cautious: functional goals vary, and reconstruction is not mandatory for everyone. Rehabilitation is essential to recover neuromuscular control.",
    symptoms: [
      "A loud 'pop' or popping sensation at the time of injury",
      "Severe pain and rapid joint swelling within a few hours",
      "A feeling of instability, shift, or the knee 'giving way'",
      "Difficulty bearing weight on the leg or walking normally"
    ],
    causes: [
      "Sudden change of direction, twisting, or cutting movements",
      "Landing awkwardly from a jump or stopping suddenly while running",
      "Direct trauma to the outside of the knee (e.g., contact sports tackle)"
    ],
    assessment: [
      "Discussion of symptoms, onset, and injury mechanism (e.g. non-contact pivot)",
      "Physical examination checking joint swelling, tenderness, and ligament laxity",
      "Laxity tests including Lachman's, Pivot Shift, and Anterior Drawer tests",
      "Evaluation of patient goals, physical demands, and activity expectations"
    ],
    investigations: [
      "MRI scan to assess the integrity of the ACL fibers and check for associated meniscus, cartilage, or bone bruising injuries",
      "Standard X-rays to rule out fractures or bone avulsions"
    ],
    treatments: [
      "RICE protocol (Rest, Ice, Compression, Elevation) and initial swelling control",
      "Specialist physical rehabilitation focused on hamstring, quadriceps, and core strength",
      "Proprioception and balance training to restore joint position sense",
      "Knee bracing in the early recovery or return-to-sport phase",
      "Surgical ACL reconstruction using a tendon graft for patients with persistent instability"
    ],
    surgeryTitle: "ACL Reconstruction",
    surgeryDetails: [
      "ACL Reconstruction using a hamstring tendon graft",
      "ACL Reconstruction using a patellar or quadriceps tendon graft"
    ],
    faqs: [
      {
        question: "Do I need surgery for a torn ACL?",
        answer: "No. Reconstruction is not mandatory. Sedentary individuals or those who do not play pivoting sports can often achieve stable, pain-free knees through high-quality physical rehabilitation. Surgery is recommended for patients experiencing persistent instability or wishing to return to pivoting sports."
      },
      {
        question: "How long is the recovery after ACL reconstruction?",
        answer: "Recovery is a gradual, phased process. It typically takes 9 to 12 months of structured physical therapy to safely return to contact or pivoting sports, though daily light activities can be resumed much sooner."
      },
      {
        question: "Can I walk after tearing my ACL?",
        answer: "Immediately after the injury, pain, swelling, and muscle inhibition may make walking difficult. Once the acute symptoms subside (often in 1-2 weeks), most patients can walk normally, though the knee may still feel unstable during twisting movements."
      },
      {
        question: "What exercises help after an ACL injury?",
        answer: "Initial exercises focus on restoring full range of motion and reducing swelling. Progressive strengthening of the hamstrings, quadriceps, and glutes is followed by balance and agility training."
      },
      {
        question: "How is an ACL tear diagnosed?",
        answer: "It is diagnosed through a combination of clinical physical assessment (including the Lachman's test) and confirmed by an MRI scan."
      },
      {
        question: "Can I bring my previous MRI to the clinic?",
        answer: "Yes, bringing any previous imaging discs and reports to your consultation is highly recommended to assist your consultant in planning your care."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Swollen Knee", "Knee Giving Way"],
    relatedConditions: ["meniscal-tear", "knee-instability", "cartilage-injury"],
    relatedTreatments: ["Physiotherapy"],
    references: [
      { text: "North Tees and Hartlepool NHS Foundation Trust — Anterior Cruciate Ligament (ACL) Injury", url: "https://www.nth.nhs.uk/resources/acl-injury/" },
      { text: "Royal Berkshire NHS Foundation Trust — ACL injury: non-operative management", url: "https://www.royalberkshire.nhs.uk/media/ycqhnrh4/anterior-cruciate-ligament-injury-non-operative-management_nov24.pdf" }
    ],
    metadataTitle: "ACL Injury: Symptoms & Treatment | Lincolnshire Knee Clinic",
    metadataDescription: "An ACL tear often causes a pop, swelling and a feeling the knee gives way. Understand diagnosis, laxity testing and whether reconstruction or rehab suits you.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "patellofemoral-pain": {
    slug: "patellofemoral-pain",
    name: "Patellofemoral Pain",
    alternateName: "Runner's Knee / Kneecap Pain",
    shortDescription: "Pain located at the front of the knee around or behind the kneecap, often aggravated by climbing stairs or prolonged sitting.",
    introduction: "Patellofemoral pain is a common clinical cause of anterior knee pain. This page covers contributing factors, symptoms, and non-surgical load management strategies.",
    whatIs: "Patellofemoral Pain Syndrome (PFPS) describes pain arising from the articulation between the kneecap (patella) and the groove on the thigh bone (femur). Wording is cautious: it is a complex, multi-factorial biomechanical issue, and oversimplified statements about alignment are avoided. Contributing factors include muscle weakness, training overload, and biomechanics. Suitable load management is the cornerstone of treatment.",
    symptoms: [
      "Dull, aching pain behind or around the kneecap",
      "Pain aggravated by activities that load the joint (climbing stairs, squatting, kneeling)",
      "Discomfort after sitting with knees bent for long periods ('moviegoer's sign')",
      "Creaking, clicking, or grinding sensations (crepitus) under the kneecap"
    ],
    causes: [
      "Repetitive overloading of the patellofemoral joint (running, jumping)",
      "Muscle imbalances, particularly quadriceps or hip stabilizer weakness",
      "Abnormal kneecap tracking or altered lower limb biomechanics (e.g., foot overpronation)",
      "Sudden increases in training volume or intensity"
    ],
    assessment: [
      "Discussion of symptoms, training history, and exacerbating activities",
      "Physical examination checking patellar tracking, glide, and tenderness",
      "Assessment of hip abductor, quadriceps, and core muscle strength",
      "Evaluation of foot biomechanics and leg alignment"
    ],
    investigations: [
      "Standard X-rays (including skyline views) to check patellar tracking and alignment",
      "MRI scan to assess the articular cartilage lining the back of the kneecap in select cases"
    ],
    treatments: [
      "Targeted physical therapy focusing on quadriceps and hip strength",
      "Activity modification and structured load management",
      "Patellar taping or bracing to support kneecap tracking",
      "Orthotics to address foot biomechanics where appropriate",
      "Simple anti-inflammatory pain relief in acute phases"
    ],
    surgeryTitle: "Surgical Considerations",
    surgeryDetails: [
      "Lateral Release or alignment procedures in rare, selected cases failing rehab"
    ],
    faqs: [
      {
        question: "Can exercise make patellofemoral pain worse?",
        answer: "Only if overloaded. Appropriate, pain-free strengthening of the hips, glutes, and quadriceps is the primary cure and helps reduce joint stress."
      },
      {
        question: "Do I need an MRI for patellofemoral pain?",
        answer: "No. It is primarily a clinical diagnosis, though an MRI can rule out cartilage defects if symptoms persist despite high-quality rehabilitation."
      },
      {
        question: "What is 'moviegoer's sign'?",
        answer: "Aching or pain behind the kneecap after sitting for prolonged periods with bent knees, typical of patellofemoral pain."
      },
      {
        question: "Will patellofemoral pain resolve on its own?",
        answer: "It often requires structured biomechanical rehab to correct imbalances, modify training loads, and manage joint loading."
      },
      {
        question: "Can knee taping help?",
        answer: "Yes, taping or bracing can temporarily support patellar tracking and reduce pain during exercises, facilitating rehab."
      },
      {
        question: "Do I need a GP referral?",
        answer: "Usually only required for private insurance authorization; self-paying patients can book directly."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Stiff Knee", "Clicking or Grinding"],
    relatedConditions: ["knee-arthritis", "knee-tendinopathy", "knee-instability"],
    relatedTreatments: ["Physiotherapy", "Weight Management & Knee Health"],
    references: [
      { text: "Sussex Community NHS Foundation Trust — Patellofemoral Pain Syndrome", url: "https://www.sussexcommunity.nhs.uk/patients-and-visitors/resources/patient-resources/patellofemoral-pain-syndrome" },
      { text: "Whittington Health NHS Trust — Patellofemoral Pain Syndrome (PFPS)", url: "https://www.whittington.nhs.uk/default.asp?c=47702" }
    ],
    metadataTitle: "Patellofemoral Pain: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Pain around or behind the kneecap, worse on stairs and sitting, is often patellofemoral pain (runner's knee). See causes, diagnosis and treatment options.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "cartilage-injury": {
    slug: "cartilage-injury",
    name: "Cartilage Injury",
    alternateName: "Chondral Defect of the Knee",
    shortDescription: "Focal damage to the protective articular cartilage lining the bones, leading to localized pain, clicking, or swelling.",
    introduction: "Articular cartilage damage can cause localized pain and catching. This page explains cartilage defects, assessment, and surgical vs non-surgical pathways.",
    whatIs: "Articular cartilage is a highly specialized, low-friction tissue lining the bone ends. Cartilage injuries involve localized 'potholes' or focal damage rather than widespread wear. Since cartilage has no direct blood supply, its healing capacity is limited. Wording is cautious: surgical options are considered only when clinically indicated. Suitability depends on defect size, depth, alignment, and symptoms.",
    symptoms: [
      "Localized joint pain, worse with weight-bearing or impact",
      "Intermittent joint swelling or effusion after exercise",
      "Catching, clicking, or locking sensations during knee movements",
      "Reduced range of motion or joint stiffness"
    ],
    causes: [
      "Acute impact trauma or falls during sporting activities",
      "Shearing forces associated with ligament or meniscal injuries",
      "Chronic localized overloading due to joint misalignment"
    ],
    assessment: [
      "Discussion of injury history, symptoms, and activity levels",
      "Physical examination checking localized joint line tenderness",
      "Assessment of ligamentous stability and meniscal signs",
      "Review of functional limitations in daily activities"
    ],
    investigations: [
      "High-resolution MRI scan (cartilage sequences) to evaluate defect size, depth, and subchondral bone",
      "Diagnostic arthroscopy (in select cases) for direct visual inspection and probing of the cartilage"
    ],
    treatments: [
      "Physiotherapy to optimize joint loading and muscle support",
      "Hyaluronic acid or PRP joint injections to reduce friction",
      "Activity modification and weight management to reduce impact",
      "Surgical joint preservation procedures for symptomatic focal defects"
    ],
    surgeryTitle: "Joint Preservation Surgery",
    surgeryDetails: [
      "Microfracture to stimulate fibrocartilage healing",
      "Autologous Chondrocyte Implantation (ACI) or cartilage transfer"
    ],
    faqs: [
      {
        question: "How does a cartilage defect differ from arthritis?",
        answer: "A cartilage defect is a focal, localized area of damage. Arthritis is widespread cartilage wear across the entire joint surface."
      },
      {
        question: "Can articular cartilage heal on its own?",
        answer: "Due to a lack of blood supply, cartilage has very limited self-repair capacity, often requiring intervention to prevent progression."
      },
      {
        question: "What is microfracture surgery?",
        answer: "A keyhole procedure that creates tiny holes in the bone to release stem cells, forming a scar-like cartilage repair."
      },
      {
        question: "Are joint injections helpful?",
        answer: "Yes, lubricating or anti-inflammatory injections can manage pain and support rehabilitation."
      },
      {
        question: "When is surgery considered?",
        answer: "When focal cartilage damage causes persistent mechanical symptoms or pain that limits rehab."
      },
      {
        question: "Do I need a GP referral?",
        answer: "Highly recommended for insurance validation; self-paying patients can contact us directly."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Swollen Knee", "Clicking or Grinding"],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "acl-injury", "loose-bodies"],
    relatedTreatments: ["Physiotherapy", "Knee Injections"],
    references: [
      { text: "NICE guidance TA477 — Autologous chondrocyte implantation for treating symptomatic articular cartilage defects of the knee", url: "https://www.nice.org.uk/guidance/ta477" },
      { text: "NICE guideline NG226 — Osteoarthritis in over 16s: diagnosis and management", url: "https://www.nice.org.uk/guidance/ng226" }
    ],
    metadataTitle: "Cartilage Injury: Symptoms & Care | Lincolnshire Knee Clinic",
    metadataDescription: "A focal cartilage defect in the knee can cause pain, swelling and catching during movement. Explore MRI diagnosis and joint preservation treatment options.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-instability": {
    slug: "knee-instability",
    name: "Knee Instability",
    alternateName: "Giving Way of the Knee",
    shortDescription: "A sensation of the knee giving way or slipping out of place, typically indicating ligament weakness, joint laxity, or a patellar subluxation.",
    introduction: "Knee instability is a symptom that makes the joint feel unreliable. This page covers ligamentous laxity, muscle control, and treatment pathways.",
    whatIs: "Knee instability is a functional symptom characterized by the knee joint feeling unreliable, shifting abnormally under load, or giving way. It can stem from ligament laxity (e.g. ACL/MCL tear), muscle weakness, or kneecap tracking issues. Wording is cautious: rehabilitation is the key first step, and surgery is reserved for selected cases. Restoration of dynamic stability is the primary clinical goal.",
    symptoms: [
      "A sensation of the knee shifting or slipping out of position",
      "Complete episodes of the knee giving way during walking or pivoting",
      "Apprehension or fear of joint collapse during activities",
      "Associated swelling or pain after instability episodes"
    ],
    causes: [
      "Chronic ligament deficiency (e.g., untreated ACL or MCL sprains)",
      "Patellar instability (recurrent subluxation or dislocation of the kneecap)",
      "Severe quadriceps or hip muscle weakness and poor control",
      "Joint capsule laxity or hypermobility"
    ],
    assessment: [
      "Discussion of giving-way events, activity context, and history",
      "Physical examination assessing ligamentous stability (Lachman, Varus/Valgus)",
      "Assessment of patella stability and apprehension testing",
      "Evaluation of neuromuscular control and balance"
    ],
    investigations: [
      "MRI scan to evaluate the integrity of stabilizing ligaments and soft tissues",
      "Stress X-rays to assess joint translation under mechanical load",
      "Standard X-rays to check for bone abnormalities or tracking alignment"
    ],
    treatments: [
      "Neuromuscular physical rehabilitation to restore active joint control",
      "Custom-fitted functional knee bracing for stability",
      "Activity modification to manage rotational joint stresses",
      "Surgical stabilization (ligament reconstruction or patellar surgery)"
    ],
    surgeryTitle: "Stabilisation Surgery",
    surgeryDetails: [
      "Ligament Reconstruction (e.g., ACL, MCL, or MPFL)",
      "Patellar stabilization or osteotomy in selected cases"
    ],
    faqs: [
      {
        question: "What causes the knee to give way?",
        answer: "Common causes include ligament tears, muscle weakness, or patellar subluxation."
      },
      {
        question: "Can knee instability be treated without surgery?",
        answer: "Yes. Intensive neuromuscular physiotherapy can train muscles to provide excellent dynamic stability, avoiding the need for surgery in many patients."
      },
      {
        question: "Do I need a brace for knee instability?",
        answer: "A custom brace can provide mechanical support and confidence during rehab or high-demand tasks, depending on which ligament is affected."
      },
      {
        question: "What is patellar dislocation?",
        answer: "When the kneecap slips completely out of its groove, causing pain and swelling, often requiring stabilization if it becomes recurrent."
      },
      {
        question: "How is instability diagnosed?",
        answer: "Through physical examination of ligament laxity and patellar tracking, confirmed by MRI scans."
      },
      {
        question: "Do I need a GP referral?",
        answer: "Usually only required for private insurance; self-paying patients can self-refer."
      }
    ],
    relatedSymptoms: ["Knee Giving Way", "Knee Pain", "Swollen Knee"],
    relatedConditions: ["acl-injury", "patellofemoral-pain", "meniscal-tear", "patellar-instability", "bakers-cyst"],
    relatedTreatments: ["Physiotherapy"],
    references: [
      { text: "NHS Greater Glasgow and Clyde (Right Decisions) — Ligament injuries", url: "https://www.rightdecisions.scot.nhs.uk/ggc-msk-index/knee/ligament-injuries/" },
      { text: "Whittington Health NHS Trust — Ligament Injuries", url: "https://www.whittington.nhs.uk/default.asp?c=47694" }
    ],
    metadataTitle: "Knee Instability: Causes & Care | Lincolnshire Knee Clinic",
    metadataDescription: "A knee that gives way or feels unstable during twisting or pivoting may signal ligament or patellar tracking problems. See assessment and stabilisation options.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "bakers-cyst": {
    slug: "bakers-cyst",
    name: "Baker's Cyst",
    alternateName: "Popliteal Cyst",
    shortDescription: "A fluid-filled swelling that develops at the back of the knee, usually arising from an underlying joint problem like arthritis or a meniscus tear.",
    introduction: "A Baker's cyst causes swelling and tightness behind the knee. This page covers its association with underlying joint issues, symptoms, and management.",
    whatIs: "A Baker's cyst is a fluid-filled swelling located in the space behind the knee (the popliteal space). It develops when the joint produces excess synovial fluid in response to intra-articular irritation (such as arthritis or a meniscus tear), which then escapes into a small pocket. Wording is cautious: it is NOT a tumor, and treating the underlying joint cause is essential. Complete cyst removal is rarely indicated.",
    symptoms: [
      "Visible or feelable swelling behind the knee joint",
      "Discomfort, tightness, or stiffness, worse with full knee bending",
      "A dull ache behind the knee, particularly after standing",
      "Pain that may radiate into the calf muscle"
    ],
    causes: [
      "Chronic joint irritation secondary to knee arthritis",
      "Intra-articular pathology, such as a degenerative meniscus tear",
      "Gout or other inflammatory joint conditions causing excess fluid",
      "Previous knee trauma causing chronic swelling"
    ],
    assessment: [
      "Physical examination of the back of the knee for swelling and warmth",
      "Assessment of knee joint range of motion and extension blocks",
      "Evaluation of underlying conditions (osteoarthritis, meniscal signs)",
      "Review of symptoms that might suggest a ruptured cyst"
    ],
    investigations: [
      "Ultrasound scan of the popliteal space to confirm the fluid-filled nature of the cyst",
      "MRI scan to identify the underlying internal joint problem (arthritis, meniscus tear)"
    ],
    treatments: [
      "Managing the underlying joint condition (e.g., meniscus tear or arthritis)",
      "Activity modification, compression, and elevation to reduce swelling",
      "Aspiration (draining) and steroid injection in symptomatic cases",
      "Physiotherapy to manage joint swelling and preserve range of motion"
    ],
    surgeryTitle: "Surgical Considerations",
    surgeryDetails: [
      "Treating the underlying cause (e.g., arthroscopy) rather than removing the cyst directly"
    ],
    faqs: [
      {
        question: "Is a Baker's cyst a tumor?",
        answer: "No. It is a completely benign, fluid-filled pocket arising from excess joint lubrication fluid."
      },
      {
        question: "Should a Baker's cyst be surgically removed?",
        answer: "Rarely. If the underlying cause, like a meniscus tear or arthritis, is not treated, the cyst will likely recur."
      },
      {
        question: "What happens if a Baker's cyst bursts?",
        answer: "Fluid leaks into the calf, causing sudden pain, redness, and swelling that can mimic a Deep Vein Thrombosis (DVT). Urgent review is advised."
      },
      {
        question: "How is a Baker's cyst diagnosed?",
        answer: "A physical examination of the knee and an ultrasound scan are typically used to confirm the diagnosis."
      },
      {
        question: "Can exercise make it worse?",
        answer: "Excessive activity can increase joint fluid and make the cyst tighter, so load modification is recommended."
      },
      {
        question: "Do I need a GP referral?",
        answer: "Highly recommended for insurance; self-paying patients can book directly."
      }
    ],
    relatedSymptoms: ["Swollen Knee", "Stiff Knee", "Knee Pain"],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "cartilage-injury"],
    relatedTreatments: ["Pain Management", "Knee Injections", "Physiotherapy"],
    references: [
      { text: "NHS — Baker's cyst", url: "https://www.nhs.uk/conditions/bakers-cyst/" }
    ],
    metadataTitle: "Baker's Cyst: Causes & Care | Lincolnshire Knee Clinic",
    metadataDescription: "A Baker's cyst is a fluid-filled swelling behind the knee that can radiate into the calf. See how ultrasound diagnosis identifies the underlying cause.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-tendinopathy": {
    slug: "knee-tendinopathy",
    name: "Knee Tendinopathy",
    alternateName: "Patellar or Quadriceps Tendonitis",
    shortDescription: "Irritation, inflammation, or micro-tearing of the tendons surrounding the knee joint, such as the patellar or quadriceps tendon.",
    introduction: "Knee tendinopathy is an overuse condition affecting the tendons. This page covers loading principles, assessment, and progressive rehabilitation.",
    whatIs: "Knee tendinopathy is an overuse condition affecting the tendons surrounding the joint (most commonly the patellar tendon below the kneecap). It involves micro-tearing and collagen degeneration in response to repetitive loading. Wording is cautious: there is no guaranteed recovery time, and progressive loading is the gold standard for rehabilitation. Rest alone is rarely curative.",
    symptoms: [
      "Localized pain and tenderness over the tendon, worse at the start of load",
      "Morning stiffness in the tendon that improves with light movement",
      "Pain triggered by explosive actions like jumping, running, or squatting",
      "Thickening or mild swelling of the tendon tissue"
    ],
    causes: [
      "Repetitive overloading of the tendon without adequate rest",
      "Sudden increases in training volume, intensity, or surface changes",
      "Lower limb biomechanics or muscle tightness (e.g., tight quadriceps)",
      "Inappropriate footwear or training surfaces"
    ],
    assessment: [
      "Discussion of activity logs, training load, and symptom onset",
      "Physical examination checking tenderness over the patellar or quadriceps tendon",
      "Pain response testing during single-leg decline squats or hopping",
      "Assessment of lower limb alignment and flexibility"
    ],
    investigations: [
      "Diagnostic ultrasound (preferred) to visualize tendon thickness, structure, and micro-tears",
      "MRI scan to evaluate the tendon in detail and rule out internal joint issues"
    ],
    treatments: [
      "Progressive loading rehabilitation (eccentric or heavy slow resistance)",
      "Activity modification and load management",
      "Extracorporeal Shockwave Therapy (ESWT) to stimulate tendon healing",
      "Targeted injection therapies in selected chronic cases",
      "Biomechanical adjustments and stretching"
    ],
    surgeryTitle: "Surgical Debridement",
    surgeryDetails: [
      "Tendon debridement or tenotomy in rare, recalcitrant cases failing rehab"
    ],
    faqs: [
      {
        question: "What is the difference between tendonitis and tendinopathy?",
        answer: "Tendonitis implies acute inflammation. Tendinopathy is chronic collagen degeneration from overload."
      },
      {
        question: "Is rest the best treatment for tendinopathy?",
        answer: "No. Complete rest makes the tendon weaker. Controlled, progressive loading is the key to recovery."
      },
      {
        question: "How long does knee tendinopathy take to heal?",
        answer: "Healing can be slow due to limited tendon blood supply, often taking 3-6 months of rehabilitation."
      },
      {
        question: "What is Shockwave Therapy (ESWT)?",
        answer: "A non-invasive treatment that uses acoustic waves to stimulate healing and blood flow in chronic tendons."
      },
      {
        question: "Can I continue sports with tendinopathy?",
        answer: "Yes, if load is modified. Exercise should be kept within a low, manageable pain threshold."
      },
      {
        question: "Do I need a GP referral?",
        answer: "Recommended for private insurance; self-paying patients can self-refer."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Stiff Knee"],
    relatedConditions: ["patellofemoral-pain", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health"],
    references: [
      { text: "NHS Lanarkshire — Patellar Tendinopathy", url: "https://www.nhslanarkshire.scot.nhs.uk/services/physiotherapy-msk/patellar-tendinopathy/" },
      { text: "Musculoskeletal Matters (Dorset) — Knee pain: Patella tendinopathy", url: "https://www.mskdorset.nhs.uk/knee-pain/knee-pain-patella-tendinopathy/" }
    ],
    metadataTitle: "Knee Tendinopathy: Causes & Care | Lincolnshire Knee Clinic",
    metadataDescription: "Persistent pain at the front of the knee during jumping or running may be tendinopathy. See ultrasound diagnosis and progressive loading rehabilitation options.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "patellar-instability": {
    slug: "patellar-instability",
    name: "Patellar Instability and Kneecap Dislocation",
    alternateName: "Patellofemoral Instability",
    shortDescription: "Information about kneecap instability, first-time or recurrent dislocation, assessment and possible treatment options.",
    introduction: "Patellar instability occurs when the kneecap moves abnormally or dislocates from its usual position. This page explains common symptoms, assessment and treatment options.",
    whatIs: "The kneecap (patella) normally moves within a groove at the front of the thigh bone (femur), known as the trochlear groove. Patellar instability is a clinical term used when the kneecap moves abnormally within or outside this groove. This may involve partial displacement (subluxation) or complete dislocation. Symptoms vary considerably between individuals, and the degree of instability does not always reflect how much discomfort a patient experiences. Instability may follow a specific injury or may recur over time without a single clear cause.",
    symptoms: [
      "Sudden kneecap displacement or a sensation that the kneecap has moved",
      "Pain around or behind the kneecap",
      "Swelling following an episode of instability",
      "Apprehension or fear that the kneecap may dislocate when bending or twisting",
      "Recurrent giving way of the knee",
      "Difficulty twisting, changing direction, or pivoting",
      "Pain on stairs or during squatting movements",
      "Reduced confidence in the knee during activity"
    ],
    causes: [
      "Traumatic injury causing the kneecap to be pushed out of its groove",
      "Previous kneecap dislocation (which itself increases the risk of recurrence)",
      "Injury to the medial patellofemoral ligament (MPFL), which helps hold the kneecap in place",
      "Trochlear shape (shallow or absent groove may allow the kneecap to displace more easily)",
      "Patellar height (a high-riding kneecap may engage the groove later during bending)",
      "Limb or rotational alignment factors that alter the direction of force through the kneecap",
      "Muscle control and strength imbalances around the hip and thigh",
      "Ligamentous laxity or generalised joint hypermobility",
      "Sporting activity involving sudden pivoting, twisting, or change of direction"
    ],
    assessment: [
      "Discussion of the mechanism of injury and how instability episodes occur",
      "Clarification of whether this is a first-time or recurrent dislocation or subluxation",
      "Assessment of swelling and any joint effusion",
      "Review of any previous episodes, operations, or physiotherapy",
      "Examination of kneecap tracking, position, and glide",
      "Assessment for apprehension when the kneecap is displaced laterally",
      "Review of limb alignment and rotational profile",
      "Assessment of ligament stability, range of motion, and muscle strength",
      "Discussion of patient goals, sporting demands, and activity requirements"
    ],
    investigations: [
      "X-rays: to assess kneecap position, trochlear shape, and bony anatomy",
      "MRI: to assess the MPFL, articular cartilage, and any soft-tissue injury following dislocation",
      "CT: occasionally used in selected cases to assess alignment, rotational anatomy, or trochlear morphology"
    ],
    treatments: [
      "Activity modification to reduce loading on the patellofemoral joint during the acute phase",
      "Physiotherapy and rehabilitation focusing on quadriceps, hip, and core strengthening",
      "Swelling and pain management in the early stages",
      "Knee bracing where appropriate to support the kneecap and improve confidence",
      "Progressive strengthening and movement control exercises",
      "Return-to-sport rehabilitation programme for athletes",
      "Surgery in selected cases of recurrent instability or where non-surgical management has not resolved symptoms"
    ],
    surgeryTitle: "When Surgery May Be Considered",
    surgeryDetails: [
      "MPFL reconstruction: reconstructing the medial patellofemoral ligament to restore kneecap stability, commonly considered after recurrent dislocations",
      "Tibial tubercle osteotomy: a bony realignment procedure considered in selected cases where patellar height or alignment is a contributing factor",
      "Trochleoplasty: a procedure to deepen the trochlear groove, considered only in carefully selected cases where trochlear dysplasia is severe",
      "Treatment of associated cartilage injury: where a dislocation has caused damage to the articular cartilage surface"
    ],
    faqs: [
      {
        question: "Does every kneecap dislocation need surgery?",
        answer: "Not every first-time dislocation requires surgery. Many patients recover well with physiotherapy and rehabilitation. Surgery may be considered in cases of recurrent instability or where specific anatomical factors are contributing. An individual assessment is needed to determine the most appropriate pathway."
      },
      {
        question: "What is the difference between subluxation and dislocation?",
        answer: "A subluxation is a partial displacement of the kneecap from its groove, where it moves abnormally but may return to position on its own. A dislocation is a complete displacement, where the kneecap moves entirely out of the groove and typically requires manual reduction. Both can cause significant symptoms."
      },
      {
        question: "Do I need an MRI?",
        answer: "Not every patient requires an MRI. Imaging is determined by the clinical assessment and history. MRI may be particularly useful after a first dislocation to assess the MPFL, articular cartilage, and other soft-tissue structures. Your surgeon will advise based on your specific situation."
      },
      {
        question: "Can physiotherapy help?",
        answer: "Yes. Physiotherapy plays an important role in patellar instability management, focusing on strengthening the muscles around the hip, quadriceps, and core to improve kneecap tracking and joint stability. Physiotherapy is often the first-line treatment for first-time dislocations."
      },
      {
        question: "Why does my kneecap keep dislocating?",
        answer: "Recurrent instability may occur because of anatomical factors (such as trochlear shape or patellar height), soft-tissue factors (such as MPFL laxity following initial injury), or muscle control issues. An individual assessment with imaging can help identify any contributing factors."
      },
      {
        question: "When may surgery be considered?",
        answer: "Surgery may be considered in cases of recurrent patellar instability that has not responded to adequate physiotherapy, or in first-time cases where specific anatomical risk factors are present. The surgical approach depends on the individual anatomy, symptoms, and patient goals and is discussed in a shared decision-making consultation."
      },
      {
        question: "Can I return to sport?",
        answer: "Many patients with patellar instability are able to return to sport following appropriate treatment and rehabilitation. However, return to sport depends on the individual clinical situation, treatment pathway, rehabilitation progress, and the specific demands of the sport. No guarantee of return to any activity can be made without an individual assessment."
      },
      {
        question: "Do I need a GP referral?",
        answer: "A GP referral is recommended for patients using private medical insurance, as most insurers require it to authorise cover. Self-paying patients can typically self-refer directly to the clinic. Please check your insurance policy prior to booking."
      }
    ],
    relatedSymptoms: ["Knee Pain", "Swollen Knee", "Knee Giving Way", "Front of Knee Pain", "Knee Pain After Injury"],
    relatedConditions: ["knee-instability", "patellofemoral-pain", "cartilage-injury", "acl-injury"],
    relatedTreatments: ["Physiotherapy", "Knee Bracing", "Patellar Stabilisation", "Cartilage Procedures"],
    references: [
      { text: "University Hospitals Sussex NHS Foundation Trust — Dislocation of your patella (kneecap)", url: "https://www.uhsussex.nhs.uk/resources/dislocation-of-your-patella-kneecap/" },
      { text: "Norfolk & Waveney Community MSK — Patella (Kneecap) Dislocation", url: "https://norfolkandwaveneycommunityhealth.nhs.uk/msk/self-help/knee/patella-kneecap-dislocation/" }
    ],
    metadataTitle: "Patellar Instability | Lincolnshire Knee Clinic",
    metadataDescription: "A kneecap that dislocates or feels loose indicates patellar instability. Review assessment, investigations, rehabilitation and surgical stabilisation options.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "loose-bodies": {
    slug: "loose-bodies",
    name: "Loose Bodies",
    alternateName: "Loose Bodies in the Knee Joint",
    shortDescription: "Fragments of bone or cartilage that float freely within the knee joint, potentially causing locking, catching, or sudden pain.",
    introduction: "Loose bodies are small fragments of cartilage or bone that break off and float freely inside the knee joint, which can cause sudden pain, locking, or swelling.",
    whatIs: "Loose bodies are fragments of cartilage or bone (or both) that have detached from the joint surfaces or other structures and float freely within the joint cavity. They can range in size from a few millimeters to several centimeters. When a loose body becomes caught between the moving surfaces of the knee joint, it can act like a wedge, causing sudden pain, clicking, or mechanical locking where the knee cannot be bent or straightened. Wording is cautious: loose bodies do not always cause symptoms, but if they cause mechanical block or damage to the surrounding cartilage, intervention is usually considered.",
    symptoms: [
      "Mechanical locking (knee gets stuck in one position)",
      "Sudden, sharp pain during movement",
      "Feeling something moving or shifting inside the joint",
      "Intermittent swelling and stiffness",
      "Catching or clicking sensations"
    ],
    causes: [
      "Osteochondral fracture (injury to cartilage and bone)",
      "Osteochondritis dissecans (OCD)",
      "Severe osteoarthritis where bone spurs (osteophytes) break off",
      "Synovial chondromatosis (rare condition causing multiple cartilage nodules)"
    ],
    assessment: [
      "History of sudden locking or catching episodes",
      "Physical examination of knee movement and palpation of any movable fragments",
      "Evaluation of potential cartilage or bone wear"
    ],
    investigations: [
      "Standard X-rays (useful for detecting bony/calcified loose bodies)",
      "MRI scan (ideal for detecting non-calcified cartilage loose bodies)"
    ],
    treatments: [
      "Observation (if small and not causing symptoms)",
      "Activity modification to avoid triggering symptoms",
      "Arthroscopic surgery (keyhole) to remove the loose bodies and address any underlying cartilage damage"
    ],
    surgeryTitle: "Arthroscopic Removal of Loose Bodies",
    surgeryDetails: [
      "A keyhole surgery to locate and extract the loose fragments",
      "Shaving or smoothing of any damaged cartilage edges (chondroplasty)",
      "Usually performed as a day-case procedure under general or regional anaesthetic"
    ],
    faqs: [
      {
        question: "Do all loose bodies need to be removed?",
        answer: "No. If a loose body is small and does not cause locking, pain, or damage to the joint surfaces, it may be monitored. However, if it causes mechanical symptoms or threatens joint cartilage, surgical removal is typically recommended."
      },
      {
        question: "How are loose bodies diagnosed?",
        answer: "They are diagnosed through a combination of clinical history and imaging. X-rays can show calcified or bony loose bodies, but an MRI is usually required to see cartilage fragments that do not show up on standard X-rays."
      }
    ],
    relatedSymptoms: ["Locked Knee", "Clicking or Grinding", "Swollen Knee", "Knee Pain"],
    relatedConditions: ["cartilage-injury", "meniscal-tear", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Knee Arthroscopy"],
    references: [
      { text: "NHS Tayside (Right Decisions) — Loose Bodies", url: "https://www.rightdecisions.scot.nhs.uk/nhs-tayside-refguide/surgery-and-orthopaedics/orthopaedic-and-trauma-surgery/knee/loose-bodies/" },
      { text: "NHS — Arthroscopy", url: "https://www.nhs.uk/tests-and-treatments/arthroscopy/" }
    ],
    metadataTitle: "Loose Bodies in the Knee | Lincolnshire Knee Clinic",
    metadataDescription: "Fragments of bone or cartilage floating in the knee joint can cause sudden locking, catching or pain. Find out how loose bodies are diagnosed and safely removed.",
    reviewStatus: "Draft - Awaiting clinical review"
  }
};

