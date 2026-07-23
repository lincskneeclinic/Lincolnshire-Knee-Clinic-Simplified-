export interface TreatmentData {
  slug: string;
  name: string;
  category: "non-surgical" | "surgical" | "recovery";
  shortDescription: string;
  introduction: string;
  whatIs: string;
  whatItInvolves: string[];
  suitability: string[];
  notSuitable: string[];
  alternatives: string[];
  risks: string[];
  recovery: string[];
  rehabilitation: string[];
  faqs: { question: string; answer: string }[];
  relatedConditions: string[]; // slugs
  relatedSymptoms: string[]; // slugs
  relatedTreatments: string[]; // slugs
  imagePath: string;
  imageAltText: string;
  metadataTitle: string;
  metadataDescription: string;
  reviewStatus: string;
}

export const treatmentsData: Record<string, TreatmentData> = {
  "physiotherapy": {
    slug: "physiotherapy",
    name: "Physiotherapy & Rehabilitation",
    category: "non-surgical",
    shortDescription: "Targeted exercise, muscle strengthening, and joint mobilization programs designed to restore knee function.",
    introduction: "Physiotherapy and rehabilitation are fundamental to managing most knee conditions. This page explains what physiotherapy involves, who may benefit, and how it is customized to individual goals.",
    whatIs: "Physiotherapy involves the clinical application of targeted exercises, stretching, manual therapy, and movement correction to optimize joint biomechanics, restore range of motion, and strengthen the supporting musculature around the knee. Wording is cautious: suitability and outcomes depend on individual diagnosis, consistency, and active participation.",
    whatItInvolves: [
      "Clinical assessment of knee range of motion, muscle strength, and gait",
      "Tailored exercise program focusing on quadriceps, hamstring, and gluteal strengthening",
      "Proprioception and balance training to restore joint stability and position sense",
      "Manual therapy techniques to reduce stiffness and improve joint mobility",
      "Progressive loading strategies to safely return to daily activities or sport"
    ],
    suitability: [
      "Patients with knee osteoarthritis experiencing mild to moderate pain",
      "Individuals recovering from acute sprains or ligament strains",
      "Before and after surgical procedures to optimize recovery potential",
      "Patients with patellofemoral tracking or biomechanical issues"
    ],
    notSuitable: [
      "Patients with acute fractures or joint dislocations prior to stabilization",
      "Severe mechanical blocks (true joint locking) requiring surgical release",
      "Severe joint infection or acute inflammatory flare-ups requiring urgent medical care"
    ],
    alternatives: [
      "Activity modification and load management",
      "Knee bracing and orthotic support",
      "Pain-relieving medication or joint injections",
      "Surgical intervention for structural or mechanical defects"
    ],
    risks: [
      "Temporary increase in muscle soreness or joint pain following exercises",
      "Local swelling if load is progressed too rapidly relative to joint capacity",
      "Risk of minor muscle strains if exercises are performed with incorrect technique"
    ],
    recovery: [
      "Expect some post-exercise fatigue or mild aching in the early phases",
      "Compliance with home exercises is a key driver of recovery timelines",
      "Rehabilitation is typically a gradual process over weeks to months"
    ],
    rehabilitation: [
      "Initial phase: focus on swelling control and restoring range of motion",
      "Strength phase: focus on progressive resistance training for the lower limb",
      "Functional phase: return to sport or work-specific movement drills"
    ],
    faqs: [
      {
        question: "Will I need physiotherapy?",
        answer: "Physiotherapy is recommended for almost all knee patients, either as a primary non-surgical treatment or as a critical part of recovery following a surgical procedure."
      },
      {
        question: "How long does a physiotherapy program last?",
        answer: "A typical program ranges from 6 to 12 weeks of structured sessions, combined with a home exercise plan. Chronic conditions or post-surgical rehab may require longer."
      },
      {
        question: "Can exercise make my knee arthritis worse?",
        answer: "Appropriate low-impact exercise does not make arthritis worse. It strengthens surrounding muscles to reduce the load on the joint surfaces, helping to manage pain."
      },
      {
        question: "Do I need a GP referral for physiotherapy?",
        answer: "For private self-paying consultations, a referral is not required. However, private medical insurance providers often require a referral to authorize coverage."
      }
    ],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "acl-injury", "patellofemoral-pain", "cartilage-injury", "knee-instability", "bakers-cyst", "knee-tendinopathy"],
    relatedSymptoms: ["knee-pain", "swollen-knee", "stiff-knee", "clicking-knee"],
    relatedTreatments: ["activity-modification", "pain-management", "knee-bracing", "preparing-for-surgery"],
    imagePath: "/images/treatments/physiotherapy/overview.png",
    imageAltText: "Patient performing rehabilitative exercises under guidance",
    metadataTitle: "Physiotherapy & Rehabilitation | Lincolnshire Knee Clinic",
    metadataDescription: "Explore physiotherapy and rehabilitation options for knee conditions. Learn about clinical exercise programs, suitability, and non-surgical care.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "activity-modification": {
    slug: "activity-modification",
    name: "Activity Modification",
    category: "non-surgical",
    shortDescription: "Adapting daily tasks, work, and sports loading patterns to reduce knee stress and promote healing.",
    introduction: "Activity modification is a key component of conservative management, helping you stay active while protecting your knee. This page covers load management and modifications.",
    whatIs: "Activity modification means identifying movements that put excessive, painful mechanical stress on the knee joint and adapting them. This involves switching from high-impact to low-impact sports, adjusting training volumes, using ergonomic aids, or restructuring daily tasks. Wording is cautious: it is about managing load rather than complete inactivity.",
    whatItInvolves: [
      "Reviewing your training logs, occupational loads, and daily habits",
      "Switching from high-impact activities (running, jumping) to low-impact (swimming, cycling)",
      "Pacing activities throughout the day to avoid pain flares",
      "Using supportive aids like walking poles or climbing stairs with correct leading legs",
      "Structuring return-to-activity pathways with gradual progressive increases"
    ],
    suitability: [
      "Patients with degenerative cartilage wear or knee osteoarthritis",
      "Individuals recovering from overuse conditions like tendinopathy",
      "Patients managing acute swelling or recovery from ligament strains"
    ],
    notSuitable: [
      "Acute, unstable injuries requiring immediate mechanical stabilization or surgery"
    ],
    alternatives: [
      "Physiotherapy and muscle strengthening",
      "Knee bracing to support joint alignment",
      "Pain-relieving medication or joint injections"
    ],
    risks: [
      "Deconditioning or loss of fitness if low-impact alternatives are not maintained",
      "Temporary stiffness if modification results in prolonged immobility"
    ],
    recovery: [
      "Patience is required as the joint adapts to altered loads",
      "Focus is on preserving general health and cardiovascular fitness using safe options"
    ],
    rehabilitation: [
      "Identifying low-impact options (swimming, cycling, elliptical cross-trainer)",
      "Gradual reinstitution of previous tasks once joint tissue settles"
    ],
    faqs: [
      {
        question: "Should I stop exercising completely if my knee hurts?",
        answer: "No. Complete rest is rarely recommended as it leads to muscle weakness. The goal is to modify activities, replacing painful impact with pain-free movement."
      },
      {
        question: "Is cycling better than running for knee pain?",
        answer: "Generally, yes. Cycling is low-impact and distributes weight through the saddle rather than the knee, which is highly beneficial for arthritis or cartilage defects."
      }
    ],
    relatedConditions: ["knee-arthritis", "patellofemoral-pain", "knee-tendinopathy", "cartilage-injury"],
    relatedSymptoms: ["knee-pain", "swollen-knee", "stiff-knee"],
    relatedTreatments: ["physiotherapy", "pain-management", "knee-bracing"],
    imagePath: "/images/treatments/activity-modification/overview.png",
    imageAltText: "Individual using stationary bicycle for low-impact joint mobility",
    metadataTitle: "Activity Modification for Knee Pain | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about activity modification, load management, and transitioning to low-impact exercises to protect the knee joint.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "pain-management": {
    slug: "pain-management",
    name: "Pain Management",
    category: "non-surgical",
    shortDescription: "A clinical framework to manage pain using medication, lifestyle changes, and non-invasive methods.",
    introduction: "Effective pain management supports active rehabilitation by reducing joint discomfort. This page explains clinical guidelines and management options.",
    whatIs: "Pain management involves using over-the-counter or prescribed analgesia, anti-inflammatories, local heat or cold applications, and load management strategies to keep discomfort at a level where daily tasks and physical therapy remain possible. Wording is cautious: medication details are general and depend entirely on a clinical review.",
    whatItInvolves: [
      "Assessment of pain severity, triggers, and impact on sleep and daily function",
      "Guidelines on anti-inflammatory and analgesic medications",
      "Application of local thermal therapies (ice for swelling, heat for stiffness)",
      "Neuromuscular education to manage chronic pain responses",
      "Coordinating joint injections for targeted localized pain control"
    ],
    suitability: [
      "Patients with knee arthritis experiencing regular aches that limit mobility",
      "Individuals recovering from acute sprains or postoperative discomfort",
      "Patients unable to undergo surgery due to medical comorbidities"
    ],
    notSuitable: [
      "Patients with undiagnosed severe pain, mechanical locking, or joint infection",
      "Using painkillers to mask pain in order to perform high-impact, damaging tasks"
    ],
    alternatives: [
      "Physiotherapy and muscle strengthening",
      "Activity modification and load management",
      "Joint preservation surgery or replacement options"
    ],
    risks: [
      "Gastrointestinal, renal, or cardiovascular side effects from long-term NSAID use",
      "Developing tolerance or dependency in rare cases of strong pain medications",
      "Masking pain, which can lead to inadvertent joint overloading"
    ],
    recovery: [
      "Pain relief is designed to facilitate active rehabilitation, not just passive rest",
      "Medication regimens should be reviewed regularly by a clinician"
    ],
    rehabilitation: [
      "Gradual reduction of medication doses as quadriceps strength and joint stability improve",
      "Transitioning to long-term exercise-based pain control"
    ],
    faqs: [
      {
        question: "What painkillers are best for knee arthritis?",
        answer: "This depends on your medical history. Paracetamol and topical or oral anti-inflammatories (NSAIDs) are commonly used, but must be clinically approved."
      },
      {
        question: "Is ice or heat better for knee pain?",
        answer: "Ice is generally best for acute pain and swelling (especially after activity). Heat is useful for warming up a stiff joint and relaxing muscles before moving."
      }
    ],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "patellofemoral-pain", "bakers-cyst"],
    relatedSymptoms: ["knee-pain", "stiff-knee", "swollen-knee"],
    relatedTreatments: ["physiotherapy", "activity-modification"],
    imagePath: "/images/treatments/pain-management/overview.png",
    imageAltText: "Ice pack application to manage localized joint swelling",
    metadataTitle: "Pain Management for Knee Conditions | Lincolnshire Knee Clinic",
    metadataDescription: "Explore pain management options for knee arthritis and injuries. Learn about medical guidelines, thermal therapies, and conservative care.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-bracing": {
    slug: "knee-bracing",
    name: "Knee Bracing",
    category: "non-surgical",
    shortDescription: "Using custom or standard braces to stabilize, offload, or protect the knee joint.",
    introduction: "Knee bracing provides external support to improve joint alignment and stability. This page explains offloader, functional, and sleeve bracing options.",
    whatIs: "Knee bracing involves using external orthotic devices to manage joint loading or translation. Braces include unloading braces (which shift weight away from a worn compartment in arthritis), functional stabilizing braces (for ligament-deficient knees), or neoprene sleeves (for compression and proprioception). Wording is cautious: braces are supplementary tools and do not replace muscle strengthening.",
    whatItInvolves: [
      "Clinical assessment of knee stability, alignment, and compartment wear",
      "Fitting a custom-molded or high-quality off-the-shelf knee brace",
      "Education on correct brace positioning, strap tension, and skin care",
      "Wearing the brace during specific high-load activities (walking, sports)",
      "Monitoring joint comfort and skin condition regularly"
    ],
    suitability: [
      "Patients with single-compartment knee osteoarthritis (medial or lateral)",
      "Individuals with chronic ligament laxity (e.g., ACL-deficient knee)",
      "Postoperative protection following ligament reconstruction or meniscus repair",
      "Patients experiencing patellar subluxation or tracking apprehension"
    ],
    notSuitable: [
      "Severe, widespread tricompartmental arthritis where offloading is not possible",
      "Patients with severe peripheral vascular disease or skin breakdown",
      "Using a brace as a substitute for active muscle rehabilitation"
    ],
    alternatives: [
      "Physiotherapy and quadriceps strengthening",
      "Activity modification and weight management",
      "Surgical correction of ligament laxity or joint alignment"
    ],
    risks: [
      "Skin irritation, rubbing, or pressure sores from ill-fitting braces",
      "Muscle weakness or dependency if the brace is worn constantly without muscle rehab",
      "False sense of security leading to joint overloading"
    ],
    recovery: [
      "Brace usage should be gradually integrated into daily routines",
      "Most braces are designed for active movement, not prolonged rest"
    ],
    rehabilitation: [
      "Neuromuscular exercises performed with and without the brace to maintain muscle activation",
      "Gradual weaning off the brace as natural joint stability is restored"
    ],
    faqs: [
      {
        question: "How does an offloader brace help arthritis?",
        answer: "It uses a three-point leverage system to gently push the knee, opening up the compressed, worn side of the joint to reduce bone-on-bone contact."
      },
      {
        question: "Can I wear a knee brace all day?",
        answer: "Generally, braces should only be worn during weight-bearing activities or sports. Wearing them constantly at rest can lead to muscle wasting."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "knee-instability", "patellofemoral-pain"],
    relatedSymptoms: ["knee-giving-way", "knee-pain", "swollen-knee"],
    relatedTreatments: ["physiotherapy", "activity-modification"],
    imagePath: "/images/treatments/knee-bracing/overview.png",
    imageAltText: "Patient wearing a supportive knee brace during rehabilitation",
    metadataTitle: "Knee Bracing: Offloader & Stabilising | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about knee bracing options, including unloading braces for arthritis, functional braces for stability, and recovery sleeves.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-arthroscopy": {
    slug: "knee-arthroscopy",
    name: "Knee Arthroscopy",
    category: "surgical",
    shortDescription: "Minimally invasive keyhole surgery to inspect, diagnose, and treat conditions inside the knee joint.",
    introduction: "Knee arthroscopy is a common minimally invasive keyhole procedure. This page explains what the surgery involves, suitability, and typical recovery stages.",
    whatIs: "Knee arthroscopy is a keyhole surgical procedure where a tiny camera (arthroscope) and specialized instruments are inserted through small incisions (portals) around the knee. This allows direct visualization and treatment of internal structures. Wording is cautious: arthroscopy is not a treatment for general arthritis, and is reserved for specific mechanical issues.",
    whatItInvolves: [
      "Preoperative assessment, general or spinal anaesthetic, and surgical preparation",
      "Making two or three small incisions (portals) around the kneecap",
      "Inflating the joint with sterile fluid to provide a clear view of structures",
      "Inspecting ligaments, menisci, and articular cartilage surfaces",
      "Performing meniscal trimming, loose body removal, or cartilage debridement",
      "Closing portals with sutures or adhesive strips, and applying compression dressing"
    ],
    suitability: [
      "Patients with mechanical joint locking due to meniscal tears or loose bodies",
      "Symptomatic cartilage flaps or localized cartilage defects failing rehab",
      "Persistent joint swelling or mechanical catching with clear pathology on MRI"
    ],
    notSuitable: [
      "Widespread, advanced knee osteoarthritis with general pain and no mechanical blocks",
      "Severe systemic infection or active localized skin infection at portal sites"
    ],
    alternatives: [
      "Structured physical therapy and quadriceps strengthening",
      "Therapeutic joint injections (steroid or lubrication)",
      "Joint replacement procedures if widespread arthritis is the cause of pain"
    ],
    risks: [
      "Deep vein thrombosis (DVT) or blood clots in the leg",
      "Joint infection (septic arthritis) requiring urgent surgery",
      "Persistent pain, joint swelling, or stiffness",
      "Numbness around portal incisions due to minor nerve irritation"
    ],
    recovery: [
      "Crutches may be required for 1 to 5 days depending on the procedure performed",
      "Portal wounds must be kept clean and dry for 10-14 days until sutures are removed",
      "Most patients can return to desk work in 1-2 weeks, and light driving in 1-2 weeks",
      "Full return to high-impact sports typically requires 6-12 weeks"
    ],
    rehabilitation: [
      "Early phase: ankle pumps and straight-leg raises to prevent swelling and DVT",
      "Mid phase: restoring full range of knee bending and extension",
      "Late phase: progressive quad and hamstring strengthening with physical therapy"
    ],
    faqs: [
      {
        question: "Can arthroscopy cure knee arthritis?",
        answer: "No. High-quality clinical trials show that keyhole surgery is not effective for washing out or curing general osteoarthritis. It is only useful if there is a distinct mechanical block like a torn meniscus."
      },
      {
        question: "How long after arthroscopy can I drive?",
        answer: "You can typically return to driving in 1-2 weeks, once you can safely perform an emergency stop and are no longer taking strong painkillers."
      }
    ],
    relatedConditions: ["meniscal-tear", "cartilage-injury", "bakers-cyst"],
    relatedSymptoms: ["locked-knee", "unable-to-straighten-knee", "clicking-knee", "swollen-knee"],
    relatedTreatments: ["meniscal-surgery", "cartilage-procedures", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/knee-arthroscopy/overview.png",
    imageAltText: "Diagram illustrating portal incisions for keyhole knee surgery",
    metadataTitle: "Knee Arthroscopy (Keyhole Surgery) | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about knee arthroscopy, what keyhole surgery involves, suitability, mechanical indications, and postoperative recovery.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "meniscal-surgery": {
    slug: "meniscal-surgery",
    name: "Meniscal Surgery",
    category: "surgical",
    shortDescription: "Arthroscopic procedures to repair or remove torn sections of the knee's shock-absorbing meniscus cartilage.",
    introduction: "Meniscal surgery is performed to address symptomatic meniscus tears that fail to settle. This page explains meniscal repair and partial meniscectomy procedures.",
    whatIs: "Meniscal surgery is a keyhole procedure designed to treat tears in the medial or lateral meniscus. Depending on the tear's location, size, and tissue quality, the surgeon will either repair the tear (stitching it back together) or perform a partial meniscectomy (trimming away only the unstable, torn cartilage). Wording is cautious: preserving meniscal tissue is the priority to protect the joint from arthritis.",
    whatItInvolves: [
      "Preoperative assessment, anaesthetic, and setup for knee arthroscopy",
      "Inspecting the meniscus tear using the arthroscope camera",
      "For Meniscal Repair: inserting specialized sutures or anchors to hold the torn edges together",
      "For Partial Meniscectomy: using micro-instruments to trim away the unstable, torn flaps",
      "Washing out the joint, closing portal wounds, and applying bandages"
    ],
    suitability: [
      "Patients with meniscal tears located in the vascularized 'red zone' (suitable for repair)",
      "Individuals experiencing persistent catching, locking, or joint line pain failing rehab",
      "Active patients with acute traumatic meniscus tears"
    ],
    notSuitable: [
      "Asymptomatic meniscus tears found incidentally on MRI scans",
      "Degenerative meniscus tears associated with advanced, widespread osteoarthritis",
      "Tears in the non-vascularized 'white zone' where repair is not biologically possible (debridement preferred)"
    ],
    alternatives: [
      "Structured physical therapy and load modification",
      "Clinical joint injections to settle localized inflammation",
      "Activity modification to avoid twisting movements"
    ],
    risks: [
      "Failure of the meniscal repair to heal, requiring a second operation",
      "Deep vein thrombosis (DVT) or leg blood clots",
      "Joint infection (septic arthritis)",
      "Accelerated wear of the joint surfaces (especially if a large amount of meniscus is removed)"
    ],
    recovery: [
      "For Meniscectomy: recovery is fast; crutches for 2-5 days, return to desk work in 1-2 weeks",
      "For Meniscal Repair: recovery is slow; partial weight-bearing in a brace for 4-6 weeks to protect stitches",
      "Return to sport requires 4-6 weeks (meniscectomy) or 3-6 months (meniscal repair)"
    ],
    rehabilitation: [
      "For repairs, range of motion is often restricted (e.g. no bending past 90 degrees in the first 4-6 weeks)",
      "Progressive loading and strengthening of the quadriceps and hamstrings are essential"
    ],
    faqs: [
      {
        question: "Is it better to repair or remove a torn meniscus?",
        answer: "Whenever possible, repair is preferred. The meniscus is a vital shock absorber; preserving it helps protect the joint cartilage from developing osteoarthritis."
      },
      {
        question: "What is the recovery time after meniscal repair?",
        answer: "Because the tissue needs time to heal, you may need a brace and crutches for up to 6 weeks, with a total rehabilitation period of 3 to 6 months before returning to sport."
      }
    ],
    relatedConditions: ["meniscal-tear", "knee-arthritis", "cartilage-injury"],
    relatedSymptoms: ["locked-knee", "unable-to-straighten-knee", "knee-pain", "swollen-knee"],
    relatedTreatments: ["knee-arthroscopy", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/meniscal-surgery/overview.png",
    imageAltText: "Illustration of meniscal repair sutures holding cartilage tear together",
    metadataTitle: "Meniscal Surgery: Repair & Meniscectomy | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about meniscal surgery, including keyhole meniscal repair and partial meniscectomy, suitability, and postoperative recovery.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "acl-reconstruction": {
    slug: "acl-reconstruction",
    name: "ACL Reconstruction",
    category: "surgical",
    shortDescription: "Surgical replacement of a torn Anterior Cruciate Ligament using a tendon graft to restore knee stability.",
    introduction: "ACL reconstruction is performed to address persistent knee instability following a ligament tear. This page explains graft options, the surgical process, and recovery stages.",
    whatIs: "ACL reconstruction is a surgical procedure where a ruptured Anterior Cruciate Ligament is replaced with a graft, typically harvested from the patient's own hamstring, patellar, or quadriceps tendon. The graft is secured in bone tunnels drilled into the femur and tibia. Wording is cautious: surgery is not always required, and success depends heavily on structured postoperative rehabilitation.",
    whatItInvolves: [
      "Preoperative checks, general anaesthetic, and surgical preparation",
      "Harvesting the chosen tendon graft through a small incision",
      "Using keyhole arthroscopy to clear the damaged ACL remnants",
      "Drilling precise bone tunnels in the tibia and femur at the anatomical ACL attachment sites",
      "Pulling the tendon graft through the tunnels and securing it with specialized screws or buttons",
      "Closing wounds, applying dressings, and placing a cooling wrap or brace"
    ],
    suitability: [
      "Patients experiencing recurrent episodes of the knee giving way or instability",
      "Athletes wishing to return to pivoting or contact sports (football, rugby, netball)",
      "Individuals with multi-ligament injuries or associated repairable meniscus tears"
    ],
    notSuitable: [
      "Patients with stable, asymptomatic ACL tears who do not participate in pivoting sports",
      "Advanced knee osteoarthritis where ligament reconstruction will not resolve the primary pain",
      "Individuals unable to commit to a rigorous 9-to-12-month rehabilitation program"
    ],
    alternatives: [
      "Intensive physical therapy focusing on hamstring and core strength",
      "Functional knee bracing for stability during activities",
      "Activity modification (avoiding pivoting sports)"
    ],
    risks: [
      "Graft failure or rupture, requiring revision surgery",
      "Persistent joint stiffness (arthrofibrosis) or loss of terminal extension",
      "Knee pain, particularly around the graft harvest site (e.g. kneecap pain)",
      "Deep vein thrombosis (DVT) or infection"
    ],
    recovery: [
      "Crutches are typically used for 1 to 2 weeks; weight-bearing is allowed as pain tolerates",
      "Return to desk work in 2-3 weeks; light driving in 3-4 weeks once muscle control is restored",
      "Full return to pivoting sports requires 9 to 12 months of progressive rehabilitation"
    ],
    rehabilitation: [
      "Early phase (0-6 weeks): restoring full knee extension and control of the quadriceps",
      "Mid phase (6 weeks - 6 months): progressive strength training, balance, and straight-line jogging",
      "Late phase (6-12 months): sport-specific agility drills, landing mechanics, and testing for return-to-sport clearance"
    ],
    faqs: [
      {
        question: "Is surgery necessary for a torn ACL?",
        answer: "No. Many patients, especially those who do not play pivoting sports, achieve excellent knee stability and function through high-quality physical therapy alone."
      },
      {
        question: "Which graft is best for ACL reconstruction?",
        answer: "The choice between hamstring, patellar, or quadriceps tendon grafts depends on your age, sport, anatomy, and physical demands, and is decided during consultation."
      }
    ],
    relatedConditions: ["acl-injury", "knee-instability", "meniscal-tear", "cartilage-injury"],
    relatedSymptoms: ["knee-giving-way", "knee-pain-after-injury", "swollen-knee"],
    relatedTreatments: ["physiotherapy", "knee-bracing", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/acl-reconstruction/overview.png",
    imageAltText: "Diagram showing ACL graft placement and bone tunnel fixation",
    metadataTitle: "ACL Reconstruction Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about ACL reconstruction surgery, including graft choices, bone tunnels, surgical suitability, and the 9-12 month rehabilitation process.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "cartilage-procedures": {
    slug: "cartilage-procedures",
    name: "Cartilage Procedures",
    category: "surgical",
    shortDescription: "Surgical options to repair, stimulate, or restore focal areas of damaged joint cartilage.",
    introduction: "Cartilage restoration procedures target symptomatic focal cartilage defects. This page explains microfracture, cartilage transplant, and other preservation options.",
    whatIs: "Cartilage procedures are joint preservation surgeries designed to address localized cartilage defects (potholes) in the knee. Techniques include microfracture (drilling small holes in the bone to stimulate healing), Autologous Chondrocyte Implantation (ACI - growing cartilage cells in a lab and implanting them), or osteochondral grafting (transferring cartilage/bone plugs). Wording is cautious: these procedures are not suitable for generalized arthritis.",
    whatItInvolves: [
      "Preoperative assessment, anaesthetic, and knee arthroscopy",
      "For Microfracture: using a small awl to make tiny holes in the exposed bone surface, releasing bone marrow stem cells",
      "For Cartilage Transplant (ACI): harvesting cells in a first procedure, growing them, and implanting them under a patch in a second surgery",
      "For Osteochondral Grafting: harvesting a plug of healthy cartilage/bone and inserting it into the defect site",
      "Closing wounds and applying a protective dressing"
    ],
    suitability: [
      "Active patients with symptomatic focal cartilage defects (grades III or IV)",
      "Defects resulting from acute injury, often associated with stable knees",
      "Patients failing to find relief from physiotherapy and injections"
    ],
    notSuitable: [
      "Generalized osteoarthritis with widespread, bone-on-bone cartilage wear",
      "Severe joint malalignment that has not been surgically corrected",
      "Patients unable to comply with non-weight-bearing restrictions post-surgery"
    ],
    alternatives: [
      "Physiotherapy and joint loading modifications",
      "Viscosupplementation or biological joint injections",
      "Unloading knee braces to shift pressure away from the defect"
    ],
    risks: [
      "The repaired cartilage tissue (often fibrocartilage) may fail to heal or wear out over time",
      "Persistent joint pain, stiffness, or recurrent swelling",
      "Deep vein thrombosis (DVT) or infection"
    ],
    recovery: [
      "Non-weight-bearing or restricted weight-bearing on crutches for 4 to 6 weeks is commonly required to protect the healing cells",
      "Use of a continuous passive motion (CPM) machine may be recommended",
      "Full recovery and return to impact sports typically takes 6 to 12 months"
    ],
    rehabilitation: [
      "Early phase: preserving joint motion without putting weight on the leg",
      "Progression to weight-bearing, focused on lower limb alignment and quad strength",
      "Gradual return to high-impact activities under strict guidance"
    ],
    faqs: [
      {
        question: "Can these procedures cure knee arthritis?",
        answer: "No. Cartilage restoration is designed for focal, localized defects in an otherwise healthy knee. It is not effective for widespread, generalized wear (osteoarthritis)."
      },
      {
        question: "What is the recovery time after cartilage surgery?",
        answer: "Because cartilage takes a long time to heal and mature, you will often need to use crutches and limit weight-bearing for 6 weeks, with full recovery taking up to a year."
      }
    ],
    relatedConditions: ["cartilage-injury", "knee-arthritis", "meniscal-tear"],
    relatedSymptoms: ["knee-pain", "swollen-knee", "clicking-knee", "locked-knee"],
    relatedTreatments: ["knee-arthroscopy", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/cartilage-procedures/overview.png",
    imageAltText: "Illustration of microfracture surgery stimulating cartilage repair",
    metadataTitle: "Cartilage Procedures & Restoration | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about knee cartilage procedures, including microfracture, cartilage cell implantation (ACI), suitability, and recovery restrictions.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "patellar-stabilisation": {
    slug: "patellar-stabilisation",
    name: "Patellar Stabilisation Surgery",
    category: "surgical",
    shortDescription: "Surgical reconstruction or realignment to prevent recurrent dislocation of the kneecap.",
    introduction: "Patellar stabilisation is performed to address recurrent kneecap dislocations or severe instability. This page covers MPFL reconstruction and bone alignment procedures.",
    whatIs: "Patellar stabilisation surgery aims to prevent the kneecap (patella) from slipping out of its groove (dislocating). The most common procedure is Medial Patellofemoral Ligament (MPFL) Reconstruction, which replaces the torn inner stabilizing ligament using a tendon graft. Bony realignment (tibial tubercle osteotomy) may also be performed if anatomical tracking issues are present. Wording is cautious: suitability depends on individual anatomy.",
    whatItInvolves: [
      "Preoperative assessment, anaesthetic, and surgical preparation",
      "Harvesting a tendon graft (typically hamstring) through a small incision",
      "Using keyhole arthroscopy to inspect the joint and check tracking",
      "Making small incisions on the inner kneecap and femur to attach the new MPFL graft",
      "Fixing the graft with specialized screws, ensuring correct tension to prevent dislocation",
      "Performing bony alignment (osteotomy) if needed, securing it with screws",
      "Closing wounds and applying dressings and a knee brace"
    ],
    suitability: [
      "Patients with recurrent patellar dislocations or subluxations (slipping)",
      "Individuals with chronic patellofemoral instability that limits daily activities or sports",
      "Patients with an acute dislocation accompanied by a bone/cartilage fracture"
    ],
    notSuitable: [
      "First-time patellar dislocation without structural fractures (physiotherapy preferred)",
      "General anterior knee pain without any mechanical instability or slipping",
      "Advanced patellofemoral arthritis where joint wear is the primary cause of symptoms"
    ],
    alternatives: [
      "Neuromuscular physical therapy focusing on quadriceps and hip strength",
      "Patellar stabilizing braces and taping",
      "Activity modification to avoid rapid twisting or deep squats"
    ],
    risks: [
      "Recurrent instability or graft failure",
      "Knee stiffness or loss of terminal bending (flexion)",
      "Persistent pain or hardware irritation (screws requiring removal later)",
      "Infection or deep vein thrombosis (DVT)"
    ],
    recovery: [
      "A knee brace locked in extension is often used for 2 to 6 weeks, with crutches",
      "Weight-bearing is allowed in the brace as pain permits",
      "Return to desk work in 2-3 weeks; driving in 4-6 weeks once the brace is removed",
      "Full return to pivoting sports requires 6 to 9 months of rehabilitation"
    ],
    rehabilitation: [
      "Early focus: reducing swelling, active quad firing, and achieving straight-leg raises",
      "Gradually increasing knee flexion within safe limits defined by the surgeon",
      " neuromuscular rehab to restore patellar tracking control"
    ],
    faqs: [
      {
        question: "Do I need surgery after my first kneecap dislocation?",
        answer: "Usually, no. First-time dislocations without fractures are managed conservatively with a brace and structured physiotherapy. Surgery is discussed for recurrent episodes."
      },
      {
        question: "What is an MPFL reconstruction?",
        answer: "It is a procedure to reconstruct the Medial Patellofemoral Ligament on the inside of the knee using a tendon graft, restoring the restraint that prevents the patella from slipping outwards."
      }
    ],
    relatedConditions: ["knee-instability", "patellofemoral-pain", "knee-arthritis"],
    relatedSymptoms: ["knee-giving-way", "front-of-knee-pain", "clicking-knee"],
    relatedTreatments: ["physiotherapy", "knee-bracing", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/patellar-stabilisation/overview.png",
    imageAltText: "Illustration of MPFL reconstruction graft securing the kneecap",
    metadataTitle: "Patellar Stabilisation Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about patellar stabilisation surgery, including MPFL reconstruction, bone realignment, suitability, and postoperative rehabilitation.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "partial-knee-replacement": {
    slug: "partial-knee-replacement",
    name: "Partial Knee Replacement",
    category: "surgical",
    shortDescription: "Surgical replacement of a single worn compartment of the knee joint, preserving healthy ligaments and bone.",
    introduction: "Partial knee replacement (unicompartmental replacement) is considered for localized arthritis. This page covers patient selection, advantages, and recovery.",
    whatIs: "Partial knee replacement is a surgical procedure where only the damaged compartment of the knee (medial, lateral, or patellofemoral) is replaced with metal and plastic implants, leaving the healthy compartments and ligaments (including the ACL and PCL) intact. Wording is cautious: suitability depends on localized arthritis and ligament integrity.",
    whatItInvolves: [
      "Preoperative assessment, anaesthetic, and surgical preparation",
      "Making an incision over the front of the knee to expose the worn compartment",
      "Removing the damaged cartilage and a thin layer of bone from the femur and tibia",
      "Cementing the metal implants to the bone ends and inserting a plastic spacer",
      "Checking joint alignment, range of motion, and stability",
      "Closing the incision in layers and applying dressings and compression"
    ],
    suitability: [
      "Patients with advanced osteoarthritis strictly localized to one compartment of the knee",
      "Patients with intact, functional cruciate ligaments (ACL and PCL)",
      "Individuals experiencing severe pain that restricts daily mobility and sleep"
    ],
    notSuitable: [
      "Widespread, multi-compartment knee osteoarthritis (total replacement preferred)",
      "Inflammatory arthritis (e.g. rheumatoid arthritis) which affects the whole joint",
      "Severe knee stiffness or fixed deformities prior to surgery",
      "Ligament-deficient knees (unstable joints)"
    ],
    alternatives: [
      "Physiotherapy, weight management, and activity modification",
      "Knee bracing (compartment offloader braces)",
      "Clinical joint injections (steroid, hyaluronic acid, hydrogel)",
      "Total knee replacement (if wear is more widespread than expected)"
    ],
    risks: [
      "Progression of arthritis in the unreplaced compartments of the knee",
      "Loosening or wear of the implants over time, requiring revision",
      "Deep vein thrombosis (DVT) or pulmonary embolism",
      "Joint infection requiring implant removal or antibiotics",
      "Nerve or blood vessel damage around the incision"
    ],
    recovery: [
      "Mobilisation begins on day 0 or 1, often with crutches for support",
      "Hospital stay is typically 1 to 2 days",
      "Return to desk work in 2-4 weeks; driving in 3-4 weeks once muscle control allows an emergency stop",
      "Significant improvement is observed by 3 months, with full recovery taking 6-12 months"
    ],
    rehabilitation: [
      "Early focus on swelling management, knee straightening, and active quad exercises",
      "Progression to walking distance increases and bending mobility",
      "Long-term low-impact strengthening to maintain joint health"
    ],
    faqs: [
      {
        question: "What are the advantages of a partial vs. total knee replacement?",
        answer: "Partial replacements preserve healthy ligaments (like the ACL), leading to a knee that often feels more natural, has better bending, recovers faster, and has lower surgical risks."
      },
      {
        question: "How long does a partial knee replacement last?",
        answer: "Most modern partial knee replacements last 15 years or more in the majority of patients, depending on activity levels and joint loading."
      }
    ],
    relatedConditions: ["knee-arthritis", "cartilage-injury", "meniscal-tear"],
    relatedSymptoms: ["knee-pain", "stiff-knee", "swollen-knee"],
    relatedTreatments: ["total-knee-replacement", "physiotherapy", "knee-bracing", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/partial-knee-replacement/overview.png",
    imageAltText: "Diagram showing unicompartmental partial knee replacement implants",
    metadataTitle: "Partial Knee Replacement | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about partial knee replacement (unicompartmental surgery), suitability criteria, preservation of ligaments, and recovery outcomes.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "total-knee-replacement": {
    slug: "total-knee-replacement",
    name: "Total Knee Replacement",
    category: "surgical",
    shortDescription: "Resurfacing the entire damaged knee joint with metal and plastic implants to relieve severe pain and restore function.",
    introduction: "Total knee replacement is a highly successful procedure for advanced, widespread joint wear. This page covers the surgery, suitability, risks, and recovery timeline.",
    whatIs: "Total knee replacement (total knee arthroplasty) is a major surgical procedure where all three compartments of the damaged joint are resurfaced. The worn cartilage and bone ends are replaced with metal alloy components, and a durable plastic spacer is inserted between them to recreate a smooth joint. Wording is cautious: it is major surgery, and recovery requires active commitment.",
    whatItInvolves: [
      "Preoperative preparation, spinal or general anaesthetic, and nerve blocks",
      "Making a vertical incision down the front of the knee",
      "Removing the worn bone ends from the femur, tibia, and sometimes the patella",
      "Sizing and cementing the metal implants onto the bone surfaces",
      "Inserting the polyethylene plastic spacer to facilitate smooth gliding",
      "Closing the incision with clips or sutures, and applying compression bandaging"
    ],
    suitability: [
      "Patients with severe, widespread tricompartmental osteoarthritis",
      "Individuals with inflammatory arthritis (rheumatoid) causing joint destruction",
      "Patients whose pain limits walking, stairs, sleep, and quality of life",
      "Those who have not found sufficient relief from conservative options"
    ],
    notSuitable: [
      "Active knee joint infection or systemic infection",
      "Severe medical comorbidities making major surgery unsafe",
      "Poor quadriceps muscle function or severe neurological deficits affecting the leg"
    ],
    alternatives: [
      "Non-surgical management (physiotherapy, bracing, injections)",
      "Partial knee replacement (if wear is strictly localized to one compartment)"
    ],
    risks: [
      "Deep vein thrombosis (DVT) or pulmonary embolism",
      "Joint infection (requires antibiotics or surgical washout/revision)",
      "Persistent stiffness, pain, or clicking sensations in the metal implants",
      "Instability or loosening of the implants requiring revision surgery later",
      "Numbness on the outer side of the knee incision (very common)"
    ],
    recovery: [
      "Early mobilization (walking within hours of surgery) is strongly encouraged",
      "Hospital stay is typically 1 to 3 days",
      "Return to desk work in 4-6 weeks; driving in 4-6 weeks once emergency stop control is confirmed",
      "Full recovery, swelling resolution, and maximum function continue to improve up to 12 months"
    ],
    rehabilitation: [
      "Daily physiotherapy exercises are critical to achieve full bending and extension",
      "Focus on quadriceps strengthening, balance, and gait retraining"
    ],
    faqs: [
      {
        question: "When should I consider a total knee replacement?",
        answer: "When knee pain and stiffness severely affect your daily quality of life, sleep, and walking distance, and conservative options no longer provide sufficient relief."
      },
      {
        question: "How long does a total knee replacement last?",
        answer: "Over 85-90% of total knee replacements last 15 to 20 years, depending on wear, activity, and weight."
      }
    ],
    relatedConditions: ["knee-arthritis"],
    relatedSymptoms: ["knee-pain", "stiff-knee", "swollen-knee", "unable-to-straighten-knee"],
    relatedTreatments: ["partial-knee-replacement", "revision-knee-replacement", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/total-knee-replacement/overview.png",
    imageAltText: "Illustration of total knee replacement implants on femur and tibia",
    metadataTitle: "Total Knee Replacement Arthroplasty | Lincolnshire Knee Clinic",
    metadataDescription: "Explore total knee replacement surgery. Learn about resurfacing joint surfaces, implant materials, suitability, and postoperative recovery stages.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "revision-knee-replacement": {
    slug: "revision-knee-replacement",
    name: "Revision Knee Replacement",
    category: "surgical",
    shortDescription: "Surgical replacement of a worn, loose, or infected previous knee replacement implant.",
    introduction: "Revision knee replacement is a specialized procedure to replace a previous implant. This page covers indications, complexity, and recovery.",
    whatIs: "Revision knee replacement is a complex surgical procedure where some or all of the parts of a previous artificial knee joint are removed and replaced with new, specialized revision implants. This is performed due to implant wear, loosening, instability, fracture, or chronic infection. Wording is cautious: revision surgery is more complex than primary replacement.",
    whatItInvolves: [
      "Comprehensive pre-op planning, infection screening, and imaging",
      "Making an incision (often through the previous scar) and exposing the joint",
      "Carefully removing the old metal and plastic components from the bone",
      "Preparing the remaining bone surfaces, which may require bone grafts or metal augments",
      "Inserting and cementing specialized, longer-stemmed revision implants",
      "Checking stability, alignment, and range of movement",
      "Closing the incision and applying compression dressings"
    ],
    suitability: [
      "Patients with aseptic loosening (implants coming loose from the bone)",
      "Individuals with chronic prosthetic joint infection failing non-surgical treatment",
      "Patients with significant joint instability or periprosthetic fractures"
    ],
    notSuitable: [
      "Unexplained knee pain where the primary implant is structurally sound and stable",
      "Patients with severe medical conditions making major, prolonged surgery unsafe"
    ],
    alternatives: [
      "Non-surgical symptom management (medication, brace support)",
      "Long-term suppressive antibiotic therapy (for infected joints in unfit patients)"
    ],
    risks: [
      "Higher risk of infection or recurrence of infection",
      "Higher risk of implant loosening or failure compared to primary replacement",
      "Loss of bone stock or fracture of the surrounding bones during surgery",
      "Persistent stiffness, pain, or leg length discrepancies"
    ],
    recovery: [
      "Mobilisation begins quickly, but weight-bearing restrictions may apply depending on bone quality",
      "Hospital stay is typically 3 to 5 days",
      "Rehabilitation is longer and more gradual than primary replacement, typically 6-12 months"
    ],
    rehabilitation: [
      "Intensive physiotherapy to restore range of movement and rebuild leg strength",
      "Close monitoring of wound healing and infection parameters"
    ],
    faqs: [
      {
        question: "Why do knee replacements fail?",
        answer: "Common reasons include mechanical wear of the plastic spacer, loosening of the metal parts from the bone over time, joint instability, or chronic low-grade infection."
      },
      {
        question: "How complex is revision knee surgery?",
        answer: "It is a highly specialized procedure that requires careful planning, custom implants, and a skilled surgeon, as there is often less bone stock to work with than in a primary surgery."
      }
    ],
    relatedConditions: ["knee-arthritis"],
    relatedSymptoms: ["knee-pain", "stiff-knee", "swollen-knee"],
    relatedTreatments: ["total-knee-replacement", "preparing-for-surgery", "enhanced-recovery", "physiotherapy-after-surgery", "returning-to-driving", "returning-to-work", "returning-to-sport", "recovery-faqs"],
    imagePath: "/images/treatments/revision-knee-replacement/overview.png",
    imageAltText: "Illustration of revision knee replacement implants with stems",
    metadataTitle: "Revision Knee Replacement Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about revision knee replacement, reasons for implant failure (loosening, infection), surgical complexity, and recovery.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "preparing-for-surgery": {
    slug: "preparing-for-surgery",
    name: "Preparing for Surgery",
    category: "recovery",
    shortDescription: "Practical advice and exercises to prepare your body and home for an upcoming knee operation.",
    introduction: "Preoperative preparation is key to a smooth surgical experience and faster recovery. This page covers health optimization, 'prehab' exercises, and home safety.",
    whatIs: "Preparing for surgery involves taking active steps in the weeks leading up to your operation to optimize your physical health and organize your home environment. This includes performing prehab exercises to build muscle strength, addressing medical factors, and arranging supportive equipment. Wording is cautious: preparation supports recovery but individual timelines vary.",
    whatItInvolves: [
      "Attending preoperative assessment clinics to check blood pressure, heart, and blood tests",
      "Performing 'prehab' exercises (straight leg raises, quadriceps sets) to build muscle bulk",
      "Optimizing nutrition, stopping smoking, and managing weight where appropriate",
      "Preparing your home (removing trip hazards, arranging handrails, placing chairs with armrests)",
      "Planning post-discharge support (arranging lifts, stocking meals)"
    ],
    suitability: [
      "All patients scheduled for elective knee surgery (replacement, reconstruction, arthroscopy)"
    ],
    notSuitable: [
      "Emergency surgeries where time does not permit preoperative planning"
    ],
    alternatives: [
      "Not applicable for surgical preparation guidelines"
    ],
    risks: [
      "Temporary fatigue or muscle soreness from starting prehab exercises",
      "Delaying surgery if preoperative health optimizations are not completed (e.g. infection or blood pressure issues)"
    ],
    recovery: [
      "Good preparation correlates with shorter hospital stays and a smoother return home",
      "Follow all specific instructions regarding fasting and medication stops before surgery"
    ],
    rehabilitation: [
      "Continuing prehab exercises daily until the day of surgery to maximize muscle memory"
    ],
    faqs: [
      {
        question: "What is prehab and why is it important?",
        answer: "Prehab is physical rehabilitation performed before surgery. The stronger your muscles are going into surgery, the faster and easier your recovery will be afterwards."
      },
      {
        question: "How should I prepare my home for recovery?",
        answer: "Remove loose rugs, clear cords, and ensure pathways are wide. Place frequently used items at waist height and arrange a firm chair with armrests."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "meniscal-tear"],
    relatedSymptoms: ["knee-pain", "stiff-knee"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "acl-reconstruction", "meniscal-surgery", "enhanced-recovery"],
    imagePath: "/images/treatments/preparing-for-surgery/overview.png",
    imageAltText: "Patient performing preoperative prehab exercises at home",
    metadataTitle: "Preparing for Knee Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Get guidelines on preparing for knee surgery, including prehab exercises, home preparation tips, and optimizing health prior to admission.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "enhanced-recovery": {
    slug: "enhanced-recovery",
    name: "Enhanced Recovery",
    category: "recovery",
    shortDescription: "A clinical pathway designed to speed up recovery, reduce pain, and get you mobile quickly after surgery.",
    introduction: "Enhanced Recovery After Surgery (ERAS) focuses on active mobilization and optimal pain control. This page explains key pathway components.",
    whatIs: "Enhanced Recovery is an evidence-based approach designed to help patients recover more quickly after major surgery. It involves a coordinated pathway between the surgeon, anaesthetist, and physiotherapist, focusing on early mobilization (walking within hours), optimal local pain relief (minimizing grogginess), and early nutrition. Wording is cautious: progression is tailored to safety.",
    whatItInvolves: [
      "Targeted preoperative education so you know what to expect",
      "Using specialized regional nerve blocks and local anaesthetics to manage pain during and after surgery",
      "Mobilizing and walking with crutches on the day of surgery",
      "Early intake of food and drinks once awake, avoiding prolonged fasting",
      "Coordinated discharge planning once safety milestones are achieved"
    ],
    suitability: [
      "Most patients undergoing total or partial knee replacements",
      "Patients undergoing major ligament reconstructions who are medically fit"
    ],
    notSuitable: [
      "Patients with severe medical comorbidities that require prolonged postoperative ICU monitoring"
    ],
    alternatives: [
      "Traditional postoperative pathways involving longer bed rest (no longer standard practice)"
    ],
    risks: [
      "Temporary dizziness or nausea when standing up early",
      "Minor falls if mobilizing without assistance from staff in the early hours"
    ],
    recovery: [
      "ERAS aims to safely reduce hospital stays to 1 to 2 days for most patients",
      "Early movement helps prevent deep vein thrombosis (DVT) and lung infections"
    ],
    rehabilitation: [
      "Attending daily ward physical therapy sessions to practice walking and climbing stairs"
    ],
    faqs: [
      {
        question: "When will I walk after my knee replacement?",
        answer: "Under the Enhanced Recovery pathway, patients are encouraged to stand and walk with crutches or a frame within a few hours of returning to the ward."
      },
      {
        question: "Will I have pain under this pathway?",
        answer: "While some discomfort is expected after major surgery, the pathway uses a combination of blocks and medications to keep pain manageable so you can walk."
      }
    ],
    relatedConditions: ["knee-arthritis"],
    relatedSymptoms: ["knee-pain", "stiff-knee"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "preparing-for-surgery", "physiotherapy-after-surgery"],
    imagePath: "/images/treatments/enhanced-recovery/overview.png",
    imageAltText: "Patient walking with crutches on the hospital ward",
    metadataTitle: "Enhanced Recovery After Knee Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about the Enhanced Recovery After Surgery (ERAS) pathway for knee replacement, focusing on early mobility and pain control.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "physiotherapy-after-surgery": {
    slug: "physiotherapy-after-surgery",
    name: "Physiotherapy After Surgery",
    category: "recovery",
    shortDescription: "Structured postoperative physical therapy to restore range of motion, muscle strength, and balance.",
    introduction: "Postoperative physiotherapy is critical to achieving the best long-term outcome from surgery. This page covers phase-based exercises and timelines.",
    whatIs: "Physiotherapy after surgery involves a structured, progressive exercise program designed to help your knee recover. It focuses on reducing swelling, restoring full knee bending and straightening (extension), rebuilding the quadriceps and hamstring muscles, and retuning balance. Wording is cautious: active participation is essential, and recovery speed varies.",
    whatItInvolves: [
      "Attending regular outpatient physiotherapy appointments",
      "Performing daily home exercises (bending, straight-leg raises, quad sets)",
      "Using manual therapy to manage scar tissue and joint tightness",
      "Progressive resistance exercises as healing progresses",
      "Functional retraining for walking, stairs, and returning to sport"
    ],
    suitability: [
      "All patients following knee replacement, ligament reconstruction, or meniscal repair"
    ],
    notSuitable: [
      "Performing aggressive or unapproved exercises before tissues have healed"
    ],
    alternatives: [
      "Self-directed recovery (carries a higher risk of joint stiffness or muscle weakness)"
    ],
    risks: [
      "Temporary soreness, swelling, or aching if exercises are progressed too quickly",
      "Joint stiffness (arthrofibrosis) if exercises are not performed consistently"
    ],
    recovery: [
      "Rehabilitation is a gradual process typically spanning 6 weeks to 9 months",
      "Discomfort during exercises is normal, but sharp pain should be avoided"
    ],
    rehabilitation: [
      "Phase 1: Swelling control and motion restoration",
      "Phase 2: Progressive muscle building and functional loading",
      "Phase 3: Agility and return to sport drills"
    ],
    faqs: [
      {
        question: "How soon does physiotherapy start after surgery?",
        answer: "Gentle exercises start on day one in the hospital. Outpatient physiotherapy sessions typically begin within 1 to 2 weeks of discharge."
      },
      {
        question: "What happens if I don't do my exercises?",
        answer: "Without consistent movement, the knee can develop scar tissue and become permanently stiff, which can severely limit the final outcome of your surgery."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "meniscal-tear"],
    relatedSymptoms: ["stiff-knee", "knee-pain", "swollen-knee"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "acl-reconstruction", "meniscal-surgery", "enhanced-recovery"],
    imagePath: "/images/treatments/physiotherapy-after-surgery/overview.png",
    imageAltText: "Therapist assisting patient with post-operative range of motion exercises",
    metadataTitle: "Postoperative Physiotherapy & Rehab | Lincolnshire Knee Clinic",
    metadataDescription: "Explore postoperative physiotherapy guidelines. Learn about rehabilitation phases, exercises, and restoring mobility after knee surgery.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "returning-to-driving": {
    slug: "returning-to-driving",
    name: "Returning to Driving",
    category: "recovery",
    shortDescription: "Clear guidelines on when it is safe, legal, and comfortable to return to driving after knee surgery.",
    introduction: "Safety and legal compliance are the primary considerations when returning to driving. This page explains key timelines, safety tests, and insurance guidelines.",
    whatIs: "Returning to driving involves ensuring you have recovered sufficient muscle power, joint mobility, and reaction time to safely control a vehicle. Wording is cautious: you must be able to perform an emergency stop safely, and you must check with your insurance provider. Timelines vary depending on which leg was operated on and the type of vehicle (automatic vs. manual).",
    whatItInvolves: [
      "Waiting until you are no longer taking strong, sedating painkillers",
      "Achieving sufficient knee bend and extension to sit comfortably",
      "Performing the 'emergency stop test' in a stationary vehicle",
      "Verifying coverage with your private motor insurance provider",
      "Starting with short, accompanied journeys before driving alone"
    ],
    suitability: [
      "Patients recovering from arthroscopy, ligament reconstruction, or joint replacement"
    ],
    notSuitable: [
      "Driving while taking opiate medication or while using a locked brace that restricts pedals",
      "Driving before you can bear weight or press the brake pedal fully without pain"
    ],
    alternatives: [
      "Using public transport, taxis, or family support during early recovery"
    ],
    risks: [
      "Increased joint pain or swelling from sitting in the driving position",
      "Delayed reaction time leading to an accident if returning to driving too early",
      "Voiding your insurance policy if driving before medically cleared"
    ],
    recovery: [
      "Typical timeline for arthroscopy: 1 to 2 weeks",
      "Typical timeline for major surgery (replacement/ACL): 4 to 6 weeks",
      "If driving an automatic and the left leg was operated on, return may be sooner"
    ],
    rehabilitation: [
      "Quadriceps strengthening and reaction timing exercises in physiotherapy"
    ],
    faqs: [
      {
        question: "When can I drive after a knee replacement?",
        answer: "Most patients can return to driving between 4 and 6 weeks, once they can perform a safe emergency stop and are off strong pain medications."
      },
      {
        question: "Does my car insurance cover me after surgery?",
        answer: "You must contact your insurer to verify cover. Most require that your surgeon or doctor has declared you fit to drive."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "meniscal-tear"],
    relatedSymptoms: ["stiff-knee", "knee-pain"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "acl-reconstruction", "knee-arthroscopy"],
    imagePath: "/images/treatments/returning-to-driving/overview.png",
    imageAltText: "Close-up of driver pressing a car brake pedal",
    metadataTitle: "Returning to Driving After Knee Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Read guidelines on returning to driving after knee replacement or arthroscopy, including safety tests and insurance rules.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "returning-to-work": {
    slug: "returning-to-work",
    name: "Returning to Work",
    category: "recovery",
    shortDescription: "A structured guide on returning to employment after knee surgery, depending on your job's physical demands.",
    introduction: "Returning to work requires balancing your job's physical demands with joint healing. This page covers desk jobs, physical roles, and phased returns.",
    whatIs: "Returning to work involves planning a safe return to your employment duties. Wording is cautious: timelines depend heavily on whether your job is sedentary (desk-based) or physically demanding (involving lifting, kneeling, or prolonged standing). A phased return to work is often recommended.",
    whatItInvolves: [
      "Assessing your job description and specific physical requirements",
      "Discussing a phased return plan with your employer (shorter hours, light duties)",
      "Obtaining a Med 3 'fit note' from your doctor or consultant if required",
      "Structuring your workspace to allow leg elevation and regular movement",
      "Monitoring joint swelling and fatigue during the working day"
    ],
    suitability: [
      "All working patients undergoing elective knee surgery"
    ],
    notSuitable: [
      "Returning to heavy manual labour, climbing ladders, or lifting before bone/soft tissue healing is complete"
    ],
    alternatives: [
      "Working from home temporarily or requesting modified administrative duties"
    ],
    risks: [
      "Increased knee pain and swelling from prolonged sitting or standing",
      "Risk of reinjury if returning to heavy manual tasks too early"
    ],
    recovery: [
      "Typical timeline for desk work: 1-2 weeks (arthroscopy), 4-6 weeks (replacements)",
      "Typical timeline for heavy manual work: 6-12 weeks (arthroscopy), 3-6 months (replacements)"
    ],
    rehabilitation: [
      "Job-specific functional exercises (e.g. practicing squatting or lifting techniques with your physio)"
    ],
    faqs: [
      {
        question: "How long off work will I need after a knee replacement?",
        answer: "For desk-based jobs, you may return in 4 to 6 weeks. For heavy physical roles involving lifting or standing, you may need 3 to 6 months."
      },
      {
        question: "What is a phased return to work?",
        answer: "It is an agreement with your employer to start back with fewer hours or lighter duties, gradually building up to your normal role as your knee strengthens."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "meniscal-tear"],
    relatedSymptoms: ["knee-pain", "swollen-knee", "stiff-knee"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "acl-reconstruction", "knee-arthroscopy"],
    imagePath: "/images/treatments/returning-to-work/overview.png",
    imageAltText: "Professional working at a desk with ergonomically positioned chair",
    metadataTitle: "Returning to Work After Knee Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Read about returning to work after knee surgery, comparing recovery timelines for desk jobs and manual labour.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "returning-to-sport": {
    slug: "returning-to-sport",
    name: "Returning to Sport",
    category: "recovery",
    shortDescription: "A safe, milestone-based pathway to return to low-impact and high-impact sporting activities.",
    introduction: "Returning to sport requires achieving specific strength and agility milestones. This page covers low-impact vs. high-impact sports and return criteria.",
    whatIs: "Returning to sport involves transitioning from clinical rehabilitation back to active sports participation. Wording is cautious: you should prioritize low-impact sports (swimming, cycling, golf) before attempting high-impact or pivoting sports (football, tennis, running). Return should be based on objective strength and balance tests rather than time alone.",
    whatItInvolves: [
      "Performing objective limb symmetry tests (comparing operated leg strength to unoperated leg)",
      "Progressing from straight-line running to agility and cutting drills",
      "Sport-specific skills practice (kicking, pivoting, jumping) under physio guidance",
      "Gradual integration into non-contact training before full competition",
      "Managing joint loading and recovery periods between sessions"
    ],
    suitability: [
      "Active patients and athletes recovering from ligament reconstruction, meniscal surgery, or joint preservation"
    ],
    notSuitable: [
      "Returning to pivoting or contact sports before achieving 90% limb strength symmetry",
      "High-impact running following total knee replacements (low-impact preferred to avoid implant wear)"
    ],
    alternatives: [
      "Transitioning permanently to low-impact sports to preserve joint surfaces long-term"
    ],
    risks: [
      "High risk of graft rupture or reinjury if returning to sports before neuromuscular control is restored",
      "Accelerated wear or loosening of joint replacement implants under high-impact loads"
    ],
    recovery: [
      "Typical timeline for golf: 6-12 weeks depending on the surgery",
      "Typical timeline for running: 3-6 months ( ligament/cartilage healing)",
      "Typical timeline for pivoting sports (ACL): 9 to 12 months"
    ],
    rehabilitation: [
      "Sport-specific conditioning, agility drills, plyometrics, and landing mechanics"
    ],
    faqs: [
      {
        question: "When can I run after ACL reconstruction?",
        answer: "Patients are typically cleared to start straight-line running on flat surfaces at 3 to 4 months, once they meet specific quadriceps strength criteria."
      },
      {
        question: "Can I play football after a total knee replacement?",
        answer: "High-impact, pivoting sports like football are generally not recommended after total knee replacement, as they can accelerate implant wear. Low-impact sports are preferred."
      }
    ],
    relatedConditions: ["acl-injury", "meniscal-tear", "cartilage-injury", "knee-instability"],
    relatedSymptoms: ["knee-giving-way", "knee-pain-after-injury"],
    relatedTreatments: ["acl-reconstruction", "meniscal-surgery", "cartilage-procedures", "physiotherapy-after-surgery"],
    imagePath: "/images/treatments/returning-to-sport/overview.png",
    imageAltText: "Athlete performing agility ladder drills under physical therapy guidance",
    metadataTitle: "Returning to Sport After Knee Surgery | Lincolnshire Knee Clinic",
    metadataDescription: "Read guidelines on returning to sport after knee surgery. Understand milestones for running, golf, and pivoting sports.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "recovery-faqs": {
    slug: "recovery-faqs",
    name: "Recovery FAQs",
    category: "recovery",
    shortDescription: "Answers to frequently asked questions about post-operative care, wound management, and general recovery.",
    introduction: "Find answers to common questions about postoperative care, wound healing, pain management, and activity restrictions.",
    whatIs: "Recovery FAQs compile clinical answers to common patient questions regarding the immediate and longer-term recovery phases after knee surgery. Wording is cautious: these are general guidelines and do not replace specific postoperative instructions from your surgeon.",
    whatItInvolves: [
      "Guidelines on wound care, dressings, and managing swelling",
      "Advice on using crutches, walking aids, and stairs",
      "Information on typical pain levels and medication usage",
      "Timelines for return to work, driving, and travel",
      "Recognizing warning signs that require clinical review"
    ],
    suitability: [
      "All patients undergoing or planning knee surgery"
    ],
    notSuitable: [
      "Using general FAQs to manage severe, acute complications (e.g. severe bleeding, chest pain)"
    ],
    alternatives: [
      "Direct communication with your clinic nursing team or surgical ward"
    ],
    risks: [
      "Delaying seeking direct medical help if relying solely on general FAQs for worrisome symptoms"
    ],
    recovery: [
      "Recovery is individual; always follow your specific discharge letter over generic guidelines"
    ],
    rehabilitation: [
      "Integrating FAQ advice with your structured physiotherapy plan"
    ],
    faqs: [
      {
        question: "How long should I keep my wounds dry?",
        answer: "Generally, surgical wounds and dressings must be kept completely dry for 10 to 14 days until sutures or clips are removed."
      },
      {
        question: "Is swelling after knee surgery normal?",
        answer: "Yes, swelling is very common and can persist for several weeks or months after major surgeries like knee replacement. Elevating the leg and using ice helps."
      },
      {
        question: "What warning signs should I watch out for?",
        answer: "Contact the clinic immediately if you notice calf swelling or tenderness (possible DVT), shortness of breath (possible PE), spreading redness, or discharge from the wound."
      }
    ],
    relatedConditions: ["knee-arthritis", "acl-injury", "meniscal-tear"],
    relatedSymptoms: ["swollen-knee", "stiff-knee", "knee-pain"],
    relatedTreatments: ["total-knee-replacement", "partial-knee-replacement", "acl-reconstruction", "knee-arthroscopy", "physiotherapy-after-surgery"],
    imagePath: "/images/treatments/recovery-faqs/overview.png",
    imageAltText: "Consultant discussing postoperative guidelines with a patient",
    metadataTitle: "Knee Surgery Recovery FAQs | Lincolnshire Knee Clinic",
    metadataDescription: "Access answers to frequently asked questions about knee surgery recovery, wound care, swelling management, and activity rules.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "weight-management": {
    slug: "weight-management",
    name: "Weight Management & Knee Health",
    category: "non-surgical",
    shortDescription: "Understanding the role of healthy weight management as one part of a supportive, non-surgical approach to knee care.",
    introduction: "Healthy weight management can help reduce force transmission across the knee joint and forms one component of an overall, multidisciplinary treatment plan where clinically appropriate.",
    whatIs: "Weight management is a supportive, non-judgmental process focused on gradual, sustainable lifestyle changes. Wording is cautious: body weight is only one of many factors contributing to knee health, alongside age, muscle strength, alignment, prior injury, and inflammation. We do not prescribe restrictive diets, recommend commercial weight-loss programs, or suggest supplements.",
    whatItInvolves: [
      "Objective clinical evaluation of your joint symptoms and metabolic health",
      "Goal setting focused on improving daily function, walking distance, and quality of life",
      "Tailoring low-impact physical activities to support joint loading capacity",
      "Guidance on balanced, nutrient-dense nutrition to support muscle and joint health",
      "Coordinating additional support with GPs or Registered Dietitians when indicated"
    ],
    suitability: [
      "Patients with knee osteoarthritis seeking conservative symptom management",
      "Individuals experiencing patellofemoral pain or tracking concerns",
      "Patients scheduled for joint replacement surgery looking to optimize health outcomes",
      "Active individuals wishing to reduce joint loading during exercise"
    ],
    notSuitable: [
      "Patients with acute fractures, unstable ligament tears, or joint infections",
      "Using rapid, highly restrictive dieting methods that compromise muscle mass or general health",
      "Replacing active muscle strengthening rehabilitation entirely with weight loss focus"
    ],
    alternatives: [
      "Physiotherapy and targeted quadriceps strengthening",
      "Activity modification and joint load pacing",
      "Knee bracing to support joint alignment",
      "Pain-relieving medication or joint injections"
    ],
    risks: [
      "Risk of muscle mass loss if weight reduction is too rapid or lacks physical activity",
      "Temporary joint aching or fatigue when starting new physical activity routines",
      "Nutritional deficiencies if following unapproved, highly restrictive dietary patterns"
    ],
    recovery: [
      "Lifestyle adjustments require patience and consistent, gradual changes",
      "Focus is on functional improvements, such as walking comfort and stiffness reduction"
    ],
    rehabilitation: [
      "Outlining individualized low-impact activity plans (walking, cycling, swimming)",
      "Strengthening exercises under physical therapy guidance to protect joint structures"
    ],
    faqs: [
      {
        question: "Can losing weight help knee pain?",
        answer: "Yes, reducing body weight can help lower the forces transmitted across the knee joint during daily activities. However, it is most effective when combined with muscle strengthening exercises to stabilize the joint."
      },
      {
        question: "Do I need to lose weight before surgery?",
        answer: "In some cases, optimization of health (including weight management) may be discussed before major surgery like knee replacement to reduce postoperative risks. This is assessed on an individual clinical basis."
      },
      {
        question: "Can I exercise if my knee hurts?",
        answer: "Yes, low-impact exercise (such as swimming, cycling, or flat walking) is generally encouraged even with knee discomfort. It helps maintain range of motion and joint lubrication. High-impact or pivoting activities should be modified."
      },
      {
        question: "What activities are usually recommended?",
        answer: "Low-impact, non-weight-bearing or low-load exercises are preferred. Stationary cycling, swimming, water aerobics, and targeted strength training under physical therapy guidance are excellent choices."
      },
      {
        question: "Should I see a dietitian?",
        answer: "Consulting a General Practitioner or a Registered Dietitian is highly recommended for structured, personalized nutritional advice to support your weight management journey safely and effectively."
      },
      {
        question: "Will weight loss cure arthritis?",
        answer: "Weight loss cannot reverse structural joint changes or cure osteoarthritis. However, it is an evidence-based method to help manage pain, decrease inflammation, and improve daily knee function."
      },
      {
        question: "Can physiotherapy help?",
        answer: "Yes, physiotherapy is vital. It ensures you build the muscle strength and joint stability needed to support your activities, helping you exercise safely during weight management."
      },
      {
        question: "How do I start safely?",
        answer: "Begin with a clinical assessment to understand your knee's condition. Start with very light, comfortable physical activity and make gradual, sustainable adjustments to your nutrition."
      }
    ],
    relatedConditions: ["knee-arthritis", "patellofemoral-pain", "knee-tendinopathy", "meniscal-tear"],
    relatedSymptoms: ["knee-pain", "stiff-knee", "swollen-knee"],
    relatedTreatments: ["physiotherapy", "activity-modification", "pain-management", "total-knee-replacement", "partial-knee-replacement"],
    imagePath: "/images/treatments/weight-management/overview.png",
    imageAltText: "Balanced nutrition and low-impact physical activity items supporting joint health",
    metadataTitle: "Weight Management & Knee Health | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about the role of healthy weight management in knee care. Read about low-impact physical activity, balanced nutrition, and supportive care.",
    reviewStatus: "Draft - Awaiting clinical review"
  }
};
