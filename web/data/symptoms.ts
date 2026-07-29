export interface SymptomData {
  slug: string;
  name: string;
  shortDescription: string;
  introduction: string;
  whatIs: string;
  commonPresentations: string[];
  durationPattern: string;
  possibleCauses: string[]; // condition slugs
  warningSigns: string[];
  assessment: string[];
  investigations: string[];
  initialManagement: string[];
  whenToConsult: string[];
  faqs: { question: string; answer: string }[];
  relatedSymptoms: string[]; // slugs
  relatedConditions: string[]; // slugs
  relatedTreatments: string[]; // names
  metadataTitle: string;
  metadataDescription: string;
  reviewStatus: string;
  references?: { text: string; url: string }[];
}

export const symptomsData: Record<string, SymptomData> = {
  "knee-pain": {
    slug: "knee-pain",
    name: "Knee Pain",
    shortDescription: "Gradual or sudden onset discomfort in or around the knee joint, affecting movement, stairs, and weight-bearing.",
    introduction: "Knee pain is a highly common symptom that may arise gradually or occur suddenly. This page explains common pain patterns, possible mechanical or degenerative causes, and when an assessment is advised.",
    whatIs: "Knee pain can present in various locations—such as the front, back, inside, or outside of the joint—and may range from a mild ache to severe, sharp pain. It can be triggered by specific activities like walking, using stairs, or running, or it may occur at rest or during the night. Wording is cautious: knee pain can stem from various structures, and a clinical assessment is recommended to identify the cause.",
    commonPresentations: [
      "Gradual ache that worsens after prolonged walking or standing",
      "Sudden, sharp pain following a twisting movement or direct impact",
      "Dull ache or throbbing that occurs at night, sometimes affecting sleep",
      "Pain that is aggravated by climbing stairs or squatting"
    ],
    durationPattern: "Pain may be acute (lasting days to weeks following a strain) or chronic (persisting for months, which may indicate a degenerative joint condition like arthritis).",
    possibleCauses: ["knee-arthritis", "meniscal-tear", "patellofemoral-pain", "cartilage-injury", "knee-tendinopathy"],
    warningSigns: [
      "Inability to bear weight on the leg",
      "Rapid, severe swelling within a few hours of an injury",
      "Signs of infection, such as fever, redness, and joint warmth",
      "An inability to bend or straighten the knee"
    ],
    assessment: [
      "Detailed history of the onset, location, and nature of the pain",
      "Evaluation of the impact on walking, work, sleep, and sporting activities",
      "Physical examination of joint alignment, stability, tenderness, and range of movement",
      "Discussion of your physical goals and review of existing imaging"
    ],
    investigations: [
      "Weight-bearing X-rays to check for joint space narrowing or bone wear",
      "MRI scan to evaluate soft tissues, including ligaments, cartilage, and menisci"
    ],
    initialManagement: [
      "Relative rest and activity modification to avoid movements that aggravate the pain",
      "Applying ice packs wrapped in a towel for 15-20 minutes to reduce discomfort",
      "Gentle range of movement exercises within pain-free limits to prevent stiffness",
      "Consulting a health professional before taking pain-relieving medication"
    ],
    whenToConsult: [
      "Pain persists for more than a few weeks despite rest",
      "Discomfort significantly affects sleep, work, or daily mobility",
      "The knee feels unstable or gives way during walking",
      "You require a definitive diagnosis and treatment plan"
    ],
    faqs: [
      {
        question: "What could be causing my knee pain?",
        answer: "Knee pain can arise from many structures, including ligaments, tendons, menisci, cartilage, or bone. Common causes include strains, patellofemoral tracking issues, meniscal tears, or joint wear (arthritis)."
      },
      {
        question: "Do I need an MRI for my knee pain?",
        answer: "Not necessarily. Many cases of knee pain are diagnosed through physical examination and standard weight-bearing X-rays. An MRI is considered if soft-tissue damage (like a ligament or meniscus tear) is suspected."
      },
      {
        question: "Should I stop exercising if my knee hurts?",
        answer: "Complete rest is rarely recommended. Low-impact exercise (such as swimming or cycling) is generally beneficial to preserve joint movement, but high-impact or painful activities should be modified."
      },
      {
        question: "Can physiotherapy help with knee pain?",
        answer: "Yes. Targeted physiotherapy is a cornerstone of recovery, helping to strengthen the surrounding muscles, improve joint stability, and correct biomechanical tracking issues."
      }
    ],
    relatedSymptoms: ["swollen-knee", "stiff-knee", "clicking-knee", "knee-giving-way"],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "patellofemoral-pain", "cartilage-injury"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health", "Book Appointment"],
    metadataTitle: "Knee Pain: Causes & Assessment | Lincolnshire Knee Clinic",
    metadataDescription: "Explore possible causes of knee pain, from ligament strains to arthritis, how it's assessed, and when to seek specialist advice from our consultants.",
    reviewStatus: "Draft - Awaiting clinical review",
    references: [
      {
        text: "NICE Clinical Knowledge Summary — Knee pain – assessment",
        url: "https://cks.nice.org.uk/topics/knee-pain-assessment/",
      },
      {
        text: "NICE guideline NG226 — Osteoarthritis in over 16s: diagnosis and management (2022)",
        url: "https://www.nice.org.uk/guidance/ng226",
      },
    ],
  },
  "swollen-knee": {
    slug: "swollen-knee",
    name: "Swollen Knee",
    shortDescription: "An accumulation of excess fluid within or around the knee joint, resulting in stiffness, tightness, and puffiness.",
    introduction: "A swollen knee (joint effusion) can occur gradually over time or develop rapidly after an injury. This page covers swelling patterns, possible causes, and when to seek medical advice.",
    whatIs: "Swelling in the knee is caused by an accumulation of synovial fluid (the joint's natural lubricant) or blood inside the joint capsule, often referred to as 'water on the knee'. It can cause the knee to look puffy, feel tight, and restrict bending. Wording is cautious: swelling is a response to irritation or injury, and its rapid or gradual onset helps guide the diagnosis.",
    commonPresentations: [
      "Rapid swelling within a few hours of an injury, often suggesting a ligament tear or fracture",
      "Gradual swelling that develops after activity, typical of meniscus wear or osteoarthritis",
      "Constant, mild puffiness that makes the joint feel tight when bending fully",
      "Acute, severe swelling accompanied by heat, redness, and fever, indicating potential infection"
    ],
    durationPattern: "Acute swelling occurs quickly after trauma. Chronic, low-grade swelling can fluctuate, worsening after physical activity and improving with rest.",
    possibleCauses: ["knee-arthritis", "meniscal-tear", "acl-injury", "cartilage-injury", "bakers-cyst"],
    warningSigns: [
      "The swelling is accompanied by a high temperature or feeling unwell",
      "The joint is hot, red, and extremely painful to touch",
      "You cannot bear any weight on the leg",
      "The knee swelled immediately (within 2 hours) of an injury"
    ],
    assessment: [
      "Review of onset timing (immediate vs. delayed) and injury history",
      "Examination of swelling volume, temperature, and joint mobility",
      "Laxity and stability checks to evaluate ligament integrity",
      "Assessment of pain location and functional limitations"
    ],
    investigations: [
      "Standard X-rays to evaluate bones and joint space",
      "Ultrasound scan to confirm fluid collection or popliteal cysts",
      "MRI scan to assess internal soft-tissue structures"
    ],
    initialManagement: [
      "Following the RICE protocol: Rest from heavy tasks, Ice the area, apply gentle Compression, and Elevate the leg",
      "Avoiding heat packs or hot baths in the first 48 hours, as this can increase swelling",
      "Gentle knee bends while lying down to encourage fluid clearance"
    ],
    whenToConsult: [
      "Swelling persists for more than a few days without improvement",
      "The swelling is associated with joint locking or giving way",
      "The knee repeatedly swells after normal physical activities"
    ],
    faqs: [
      {
        question: "Why does my knee keep swelling?",
        answer: "Recurrent swelling suggests ongoing joint irritation. Common causes include osteoarthritis, meniscal wear, cartilage defects, or mild ligament instability."
      },
      {
        question: "Is swelling after an injury normal?",
        answer: "A small amount of delayed swelling can occur with mild strains, but rapid, tense swelling within a few hours is abnormal and requires prompt clinical assessment."
      },
      {
        question: "Should a swollen knee be drained?",
        answer: "Aspiration (draining fluid) is sometimes performed to relieve severe tightness or test for infection, but it is typically only a temporary measure unless the underlying cause is treated."
      }
    ],
    relatedSymptoms: ["knee-pain", "stiff-knee", "unable-to-straighten-knee"],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "acl-injury", "bakers-cyst"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health"],
    metadataTitle: "Swollen Knee: Causes & Advice | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of a swollen knee, how it may be assessed, and when to seek advice. Discover the difference between rapid and gradual swelling.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "stiff-knee": {
    slug: "stiff-knee",
    name: "Stiff Knee",
    shortDescription: "A restriction in the joint's range of motion, making it difficult to fully bend or straighten the knee.",
    introduction: "Knee stiffness can restrict your mobility and make daily tasks difficult. This page explains morning stiffness, stiffness after sitting, and potential causes.",
    whatIs: "Stiff knee refers to a sensation of tightness or resistance when moving the joint. It is often worse first thing in the morning or after sitting for prolonged periods. Stiffness can be caused by joint fluid accumulation, osteoarthritis, mechanical restriction (like a torn meniscus), or scar tissue. Wording is cautious: stiffness is a common joint symptom and a physical assessment helps clarify the cause.",
    commonPresentations: [
      "Morning stiffness that takes 30-60 minutes to 'warm up'",
      "Tightness after sitting in a chair or car for long periods",
      "Difficulty bending the knee to squat or sit on your heels",
      "A feeling of resistance when trying to straighten the leg fully"
    ],
    durationPattern: "Temporary stiffness can follow minor strains or overload. Progressive stiffness over months is characteristic of joint wear or chronic osteoarthritis.",
    possibleCauses: ["knee-arthritis", "meniscal-tear", "cartilage-injury"],
    warningSigns: [
      "Stiffness accompanied by severe pain and inability to bear weight",
      "Sudden onset of stiffness following an injury, with joint locking",
      "The joint is hot, red, swollen, and painful (possible infection)"
    ],
    assessment: [
      "Review of stiffness patterns (e.g. morning vs. post-activity)",
      "Measurement of flexion and extension range of movement",
      "Palpation of the joint line to check for fluid or bone spurs",
      "Discussion of previous injuries, surgeries, and daily activities"
    ],
    investigations: [
      "X-rays to evaluate cartilage wear and bone spur formation",
      "MRI scan if a mechanical block or soft-tissue injury is suspected"
    ],
    initialManagement: [
      "Gentle, regular movement (e.g., stationary cycling with low resistance) to keep the joint mobile",
      "Applying warm packs for 10-15 minutes to relax tight muscles around the knee",
      "Avoiding keeping the knee bent in the same position for too long"
    ],
    whenToConsult: [
      "Stiffness is progressive and limits your walking distance",
      "You cannot fully straighten your knee (restricted extension)",
      "Stiffness does not improve with gentle stretching and exercise"
    ],
    faqs: [
      {
        question: "Why is my knee stiff after sitting?",
        answer: "This is often due to the 'gel phenomenon,' where joint fluid becomes more viscous during rest. It is a common early sign of cartilage wear or osteoarthritis."
      },
      {
        question: "What is the difference between stiffness and locking?",
        answer: "Stiffness is a feeling of tightness or resistance throughout movement. Locking is a sudden, physical block where the knee is stuck at a specific angle and cannot move."
      },
      {
        question: "Can physiotherapy help a stiff knee?",
        answer: "Yes. Physiotherapy uses manual techniques, stretching, and targeted exercises to restore joint range of motion and strengthen surrounding support muscles."
      }
    ],
    relatedSymptoms: ["knee-pain", "swollen-knee", "unable-to-straighten-knee"],
    relatedConditions: ["knee-arthritis", "meniscal-tear", "cartilage-injury"],
    relatedTreatments: ["Physiotherapy", "Knee Injections", "Weight Management & Knee Health"],
    metadataTitle: "Stiff Knee: Causes & Advice | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of a stiff knee, how it may be assessed, and when to seek professional advice. Discover morning stiffness and flexion issues.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "clicking-knee": {
    slug: "clicking-knee",
    name: "Clicking or Grinding Knee",
    shortDescription: "Crepitus, clicks, pops, or grinding noises occurring inside the knee joint during bending, climbing, or squatting.",
    introduction: "Clicks and pops in the knee are highly common. This page explains when clicking is normal, what grinding (crepitus) means, and when a review is recommended.",
    whatIs: "Clicking or grinding (clinical name: crepitus) refers to sounds or sensations felt inside the joint during movement. Wording is cautious: painless clicking is very common and often harmless (due to gas bubbles popping or tendons gliding). However, clicking accompanied by pain, catching, or swelling may indicate meniscus tears, patellofemoral wear, or arthritis, and should be assessed.",
    commonPresentations: [
      "Painless popping or clicking when standing up or squatting",
      "Painful clicking or catching along the joint line when bending",
      "A fine, constant grinding sensation (crepitus) when walking down stairs",
      "A loud pop during a sudden twist or impact injury"
    ],
    durationPattern: "Painless clicking can be lifelong and stable. Painful clicking or grinding that develops gradually may worsen as joint surfaces change over time.",
    possibleCauses: ["patellofemoral-pain", "knee-arthritis", "meniscal-tear", "cartilage-injury"],
    warningSigns: [
      "The clicking is painful or accompanied by a catching sensation",
      "The joint swells or feels unstable after clicking",
      "The knee locks or gets stuck during movement",
      "A loud pop was heard during a sports injury with immediate pain"
    ],
    assessment: [
      "Review of whether the clicking is painful and its duration",
      "Physical examination to feel the joint during bending and extension",
      "Assessment of patellar tracking and joint line tenderness",
      "Evaluation of muscle strength around the hip and thigh"
    ],
    investigations: [
      "Skyline X-rays to assess patellofemoral tracking and wear",
      "MRI scan if a mechanical issue like a meniscus tear is suspected"
    ],
    initialManagement: [
      "Focusing on quad and hip strengthening to improve kneecap tracking",
      "Avoiding repetitive deep squatting if it triggers painful clicking",
      "Painless clicking does not require treatment or avoidance of activity"
    ],
    whenToConsult: [
      "Clicking is painful, frequent, or limits your daily activities",
      "The knee feels like it is catching or about to lock",
      "You notice a grinding sensation combined with joint swelling"
    ],
    faqs: [
      {
        question: "Is clicking in the knee always a problem?",
        answer: "No. Painless clicking or popping is very common and is usually harmless. It only warrants investigation if it is accompanied by pain, swelling, or instability."
      },
      {
        question: "What causes a grinding sensation in the knee?",
        answer: "A grinding sensation (crepitus) is often caused by the rough cartilage surfaces rubbing together, which can occur with patellofemoral pain or early osteoarthritis."
      },
      {
        question: "Can physiotherapy stop knee clicking?",
        answer: "If the clicking is caused by muscle imbalances or poor kneecap tracking, targeted physiotherapy can improve tracking and reduce or eliminate the noise."
      }
    ],
    relatedSymptoms: ["knee-pain", "front-of-knee-pain", "locked-knee"],
    relatedConditions: ["patellofemoral-pain", "knee-arthritis", "meniscal-tear"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Clicking or Grinding Knee: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of a clicking or grinding knee, how it's assessed, and when a review is recommended. Read about harmless, painless crepitus.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "locked-knee": {
    slug: "locked-knee",
    name: "Locked Knee",
    shortDescription: "A mechanical block where the knee joint becomes physically stuck in a bent or straight position and cannot be moved.",
    introduction: "A locked knee is a significant symptom that typically requires clinical review. This page explains the difference between true mechanical locking and pain-related restriction.",
    whatIs: "True knee locking occurs when a loose piece of tissue—such as a torn meniscus fragment or a loose body of bone/cartilage—becomes physically wedged inside the joint mechanism, blocking movement. Wording is cautious: true locking must be distinguished from temporary stiffness or pain-induced restriction ('pseudo-locking'). Mechanical locking warrants prompt assessment.",
    commonPresentations: [
      "The knee suddenly gets stuck in a bent position and cannot be straightened",
      "Intermittent catching where the knee momentarily halts before 'popping' free",
      "Severe pain and muscle spasm that makes moving the joint difficult",
      "A loose piece of cartilage moving around the joint, causing variable blocks"
    ],
    durationPattern: "Locking episodes are typically sudden and unpredictable. The knee may remain locked for hours or days, or catch momentarily during specific movements.",
    possibleCauses: ["meniscal-tear", "cartilage-injury", "loose-bodies", "knee-arthritis"],
    warningSigns: [
      "The knee is physically locked and cannot be straightened even with gentle assist",
      "Locking occurred immediately after a twisting injury",
      "Frequent, painful locking episodes that cause you to fall or lose balance"
    ],
    assessment: [
      "Detailed review of locking frequency, duration, and triggering movements",
      "Assessment of whether the joint is physically blocked or restricted by pain",
      "Physical examination checking range of motion and joint stability",
      "Evaluation of previous meniscus or cartilage injuries"
    ],
    investigations: [
      "Standard X-rays to check for loose bone fragments or osteophytes",
      "MRI scan (highly recommended) to identify meniscus tears or loose cartilage bodies"
    ],
    initialManagement: [
      "Gentle, passive movement to see if the block releases naturally without force",
      "Avoiding forced straightening, which can cause further joint damage",
      "Physiotherapy to reduce swelling and maintain range of movement once unlocked",
      "Arthroscopic surgery (keyhole) to repair the meniscus or remove loose bodies if locking persists"
    ],
    whenToConsult: [
      "Your knee is currently locked and will not straighten (prompt review advised)",
      "You experience recurrent catching or locking episodes",
      "Locking is accompanied by joint swelling and instability"
    ],
    faqs: [
      {
        question: "What is the difference between locking and stiffness?",
        answer: "Stiffness is a feeling of tightness throughout movement. Locking is a physical, mechanical block where the joint cannot pass a certain point, like a door jam."
      },
      {
        question: "What causes a knee to lock?",
        answer: "The most common cause is a bucket-handle meniscus tear, where a large fragment flips into the joint center. Other causes include loose bodies of cartilage or bone."
      },
      {
        question: "Does a locked knee require surgery?",
        answer: "If the knee remains locked due to a displaced meniscus tear or loose body, arthroscopic surgery (keyhole) is often recommended to unlock the joint and repair or remove the blocking tissue."
      }
    ],
    relatedSymptoms: ["knee-pain", "unable-to-straighten-knee", "swollen-knee"],
    relatedConditions: ["meniscal-tear", "cartilage-injury", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Locked Knee: Causes & Advice | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of a locked knee, how it's assessed, and when to seek advice. Understand true mechanical locking versus pseudo-locking.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-giving-way": {
    slug: "knee-giving-way",
    name: "Knee Giving Way",
    shortDescription: "A sudden buckling or instability of the knee joint, making you feel insecure or lose balance during weight-bearing.",
    introduction: "Knee instability or giving way can lead to falls and a loss of joint confidence. This page explains ligamentous, muscular, and tracking causes.",
    whatIs: "Knee giving way occurs when the joint suddenly buckles or shifts out of place under load. It typically indicates underlying ligament damage (like an ACL tear), muscle weakness (quadriceps inhibition), or patellar instability. Wording is cautious: giving way is a symptom of instability, and identifying the structural or functional cause is key to planning rehabilitation.",
    commonPresentations: [
      "The knee buckles outwards or inwards when turning or pivoting",
      "A feeling of the joint slipping out of place when walking on uneven ground",
      "Sudden collapse of the knee when walking down stairs or stepping off a curb",
      "Instability accompanied by a sharp, catching pain behind the kneecap"
    ],
    durationPattern: "Episodes can be infrequent (occurring only during sports) or frequent (occurring during normal walking, indicating severe instability).",
    possibleCauses: ["acl-injury", "knee-instability", "patellofemoral-pain", "meniscal-tear"],
    warningSigns: [
      "Giving way is accompanied by joint swelling or severe pain",
      "The knee buckles during simple, straight-line walking",
      "You have had repeated falls or loss of balance due to the knee",
      "Instability started immediately after a popping sound during sports"
    ],
    assessment: [
      "Detailed history of giving-way frequency and the movements that trigger it",
      "Physical examination testing all major knee ligaments for laxity",
      "Assessment of quadriceps, hamstring, and hip abductor strength",
      "Evaluation of balance, coordination, and proprioception"
    ],
    investigations: [
      "MRI scan to assess the integrity of the ACL, MCL, and other stabilizers",
      "Standard X-rays to check joint alignment and evaluate for bone injury"
    ],
    initialManagement: [
      "Wearing a supportive knee sleeve or functional brace to improve confidence",
      "Focusing on straight-leg raises to keep the quadriceps active without loading the joint",
      "Avoiding twisting, pivoting, or high-impact tasks until assessed"
    ],
    whenToConsult: [
      "The knee buckles during daily activities like walking or stairs",
      "You experience a loss of confidence in the knee's stability",
      "Giving way is associated with recurrent swelling or catching"
    ],
    faqs: [
      {
        question: "Why does my knee suddenly give way?",
        answer: "Common causes include a torn ACL, patellar subluxation, meniscal tears, or severe quadriceps weakness (often caused by pain inhibiting the muscle)."
      },
      {
        question: "Can physiotherapy stop my knee from giving way?",
        answer: "Yes. Neuromuscular physiotherapy is highly effective. It trains the muscles to react quickly, providing dynamic stability to compensate for ligament laxity."
      },
      {
        question: "Do I need surgery if my knee gives way?",
        answer: "If instability is due to a complete ACL rupture and does not improve with intensive rehabilitation, surgical ligament reconstruction may be discussed."
      }
    ],
    relatedSymptoms: ["knee-pain-after-injury", "swollen-knee", "knee-pain"],
    relatedConditions: ["acl-injury", "knee-instability", "patellofemoral-pain", "meniscal-tear"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Knee Giving Way: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of a knee giving way, how it's assessed, and when to seek advice. Discover ligamentous and muscular sources of instability.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "unable-to-straighten-knee": {
    slug: "unable-to-straighten-knee",
    name: "Unable to Straighten the Knee",
    shortDescription: "An inability to extend the leg fully, often caused by a mechanical block, joint swelling, or protective muscle guarding.",
    introduction: "Being unable to straighten your knee is a common clinical issue. This page covers mechanical blocks, swelling-related extension limits, and when a review is needed.",
    whatIs: "An inability to straighten the knee fully (loss of extension) can arise from a physical block (like a torn meniscus or loose body), severe joint swelling, or protective muscle spasm (guarding). Wording is cautious: failing to straighten the knee can alter your gait and lead to secondary issues, so early assessment is recommended to identify the cause.",
    commonPresentations: [
      "The knee feels physically blocked when trying to straighten the last few degrees",
      "Severe swelling makes the front of the knee feel too tight to extend",
      "Pain at the back of the knee prevents full straightening",
      "Difficulty walking because you cannot lock the knee straight"
    ],
    durationPattern: "This symptom can occur suddenly after an injury (suggesting a mechanical block or acute swelling) or develop gradually (indicating arthritis or joint contracture).",
    possibleCauses: ["meniscal-tear", "cartilage-injury", "knee-arthritis", "swollen-knee"],
    warningSigns: [
      "The knee cannot be straightened and was injured recently",
      "Loss of extension is accompanied by severe, sharp joint pain",
      "The knee is locked in a bent position and cannot be moved at all"
    ],
    assessment: [
      "Review of onset timing and history of knee injury",
      "Measurement of the degree of extension deficit (passive vs. active)",
      "Physical exam checking for mechanical blocks, swelling, and joint line tenderness",
      "Evaluation of hamstring and calf muscle tightness"
    ],
    investigations: [
      "Standard X-rays to assess joint space and search for loose bone spurs",
      "MRI scan (highly recommended) to rule out displaced meniscal tears or loose bodies"
    ],
    initialManagement: [
      "Applying ice and elevation to reduce joint swelling that blocks movement",
      "Gentle calf and hamstring stretching to prevent tendon tightening",
      "Avoiding forcing the knee straight, which can cause cartilage damage",
      "Consulting a physiotherapist for gentle mobility exercises"
    ],
    whenToConsult: [
      "You cannot straighten your knee following an acute twisting injury",
      "Loss of extension persists for more than a few days",
      "The restriction affects your ability to walk or stand comfortably"
    ],
    faqs: [
      {
        question: "Why can't I straighten my knee?",
        answer: "Common causes include a displaced meniscus tear (bucket-handle tear), a loose body, severe joint swelling, or osteoarthritis."
      },
      {
        question: "Is it bad if my knee won't go fully straight?",
        answer: "Yes, walking with a bent knee (flexion contracture) is inefficient, increases load on the kneecap, and can lead to hip or back discomfort over time."
      },
      {
        question: "Will I need surgery to straighten my knee?",
        answer: "If the restriction is due to a mechanical block (like a torn meniscus), keyhole surgery (arthroscopy) is often needed. If it is due to swelling or muscle tightness, physiotherapy can resolve it."
      }
    ],
    relatedSymptoms: ["locked-knee", "swollen-knee", "knee-pain-after-injury"],
    relatedConditions: ["meniscal-tear", "cartilage-injury", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Can't Straighten Your Knee | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of being unable to straighten the knee, how it's assessed, and when to seek advice. Read about mechanical extension blocks.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "front-of-knee-pain": {
    slug: "front-of-knee-pain",
    name: "Pain at the Front of the Knee",
    shortDescription: "Anterior knee pain located around, behind, or below the kneecap, aggravated by stairs, squatting, or running.",
    introduction: "Pain at the front of the knee (anterior knee pain) is a common complaint in both athletes and less active individuals. This page covers kneecap tracking, tendon symptoms, and assessment.",
    whatIs: "Front of knee pain typically arises from the patellofemoral joint (where the kneecap glides on the thigh bone) or the tendons surrounding it (patellar or quadriceps tendons). It is frequently triggered by activities that load the kneecap, such as climbing stairs, running, squatting, or sitting for long periods. Wording is cautious: anterior knee pain has several distinct causes, and a biomechanical assessment is key.",
    commonPresentations: [
      "A dull ache behind the kneecap during or after running or climbing stairs",
      "Sharp pain just below the kneecap when jumping or squatting (suggesting tendon issues)",
      "Aching after sitting with knees bent for long periods (e.g. cinema or driving)",
      "Grinding or creaking sensations when bending and extending the knee"
    ],
    durationPattern: "Pain is often activity-dependent, resolving with rest but recurring when returning to loading activities without rehab.",
    possibleCauses: ["patellofemoral-pain", "knee-tendinopathy", "knee-arthritis"],
    warningSigns: [
      "The kneecap feels like it is slipping out of its groove",
      "Front of knee pain is accompanied by joint swelling or warmth",
      "You cannot straighten the leg or lift it against gravity"
    ],
    assessment: [
      "Detailed history of activity levels, training loads, and symptom triggers",
      "Physical examination of patellar tracking, alignment, and local tenderness",
      "Assessment of quadriceps, gluteal, and calf muscle strength",
      "Evaluation of foot posture and lower limb biomechanics"
    ],
    investigations: [
      "Standard Skyline X-rays to assess patellar tracking and alignment",
      "MRI scan to check cartilage thickness behind the patella or assess tendon structure"
    ],
    initialManagement: [
      "Relative rest: temporarily reducing activities that trigger the pain (e.g. running or stairs)",
      "Applying ice packs to the front of the knee for 15 minutes after activity",
      "Structured quadriceps and hip abductor strengthening exercises",
      "Using supportive patellar taping or bracing during exercises"
    ],
    whenToConsult: [
      "Pain persists despite modifying your activities and rest",
      "The pain restricts your daily walking, work, or sports participation",
      "You experience a sensation of the kneecap shifting or dislocating"
    ],
    faqs: [
      {
        question: "What causes pain at the front of the knee?",
        answer: "Common causes include Patellofemoral Pain Syndrome (Runner's Knee), patellar tendinopathy (Jumper's Knee), patellar tracking issues, or arthritis behind the kneecap."
      },
      {
        question: "Is running bad for front of knee pain?",
        answer: "Not necessarily, but running can overload the patellofemoral joint if training volume increases too quickly or if quadriceps and hip muscles are weak. Load modification is key."
      },
      {
        question: "Can knee taping help front of knee pain?",
        answer: "Yes. Patellar taping or bracing can support correct tracking of the kneecap in its groove, which often reduces pain during exercise and rehabilitation."
      }
    ],
    relatedSymptoms: ["clicking-knee", "knee-pain"],
    relatedConditions: ["patellofemoral-pain", "knee-tendinopathy", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Front of Knee Pain: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of pain at the front of the knee, how it's assessed, and when to seek advice. Read about patellofemoral and tendon issues.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "back-of-knee-pain": {
    slug: "back-of-knee-pain",
    name: "Pain at the Back of the Knee",
    shortDescription: "Tightness, aching, or swelling in the popliteal space behind the knee, sometimes associated with fullness or difficulty bending.",
    introduction: "Pain at the back of the knee (posterior knee pain) often presents as a tight, full sensation. This page covers popliteal swelling, Baker's cysts, and assessment.",
    whatIs: "Pain at the back of the knee is commonly caused by an accumulation of joint fluid that herniates backwards (a Baker's cyst), posterior meniscus tears, or hamstring tendon strains. It can make the back of the knee feel full, tight, or restricted when bending. Wording is cautious: posterior pain is often secondary to an underlying joint condition, and a clinical assessment is advised.",
    commonPresentations: [
      "A tight, full sensation behind the knee that is worse when bending fully",
      "A visible or feelable lump in the popliteal space behind the knee",
      "A dull, aching pain behind the joint after standing or walking for long periods",
      "Sharp pain when bending the knee against resistance (suggesting hamstring strain)"
    ],
    durationPattern: "Fluctuates depending on the amount of fluid in the joint. It can worsen after activity and improve with rest and elevation.",
    possibleCauses: ["bakers-cyst", "meniscal-tear", "knee-arthritis"],
    warningSigns: [
      "Sudden, severe pain in the calf with redness, warmth, and swelling (possible DVT or ruptured cyst)",
      "You feel unwell or have a high temperature with joint swelling",
      "You cannot bear weight on the leg"
    ],
    assessment: [
      "Physical examination of the popliteal fossa to check for swelling and warmth",
      "Assessment of knee joint range of motion (flexion and extension checks)",
      "Evaluation of underlying conditions (arthritis or meniscus signs)",
      "Checking for signs of deep vein thrombosis (calf tenderness/swelling)"
    ],
    investigations: [
      "Ultrasound scan to confirm a Baker's cyst and evaluate popliteal blood vessels",
      "MRI scan to identify the underlying joint issue (e.g. arthritis, meniscus tear)"
    ],
    initialManagement: [
      "Relative rest and avoiding activities that require deep knee bending",
      "Elevation and compression to help reduce fluid accumulation in the back of the knee",
      "Gentle stretching of the hamstrings and calf muscles"
    ],
    whenToConsult: [
      "The swelling behind the knee is large, painful, or restricts bending",
      "You experience sudden calf pain and swelling",
      "The discomfort does not resolve with rest and load modification"
    ],
    faqs: [
      {
        question: "What causes pain at the back of the knee?",
        answer: "Common causes include a Baker's cyst (which is usually secondary to a meniscus tear or arthritis), hamstring tendinopathy, or calf muscle strains."
      },
      {
        question: "Is a lump behind the knee serious?",
        answer: "Most commonly, a lump behind the knee is a benign, fluid-filled Baker's cyst. However, any new lump should be clinically evaluated to confirm the diagnosis and rule out vascular issues."
      },
      {
        question: "How is a Baker's cyst treated?",
        answer: "Treatment focuses on the underlying joint problem (such as managing arthritis or repairing a meniscus tear). Draining the cyst (aspiration) may provide temporary relief."
      }
    ],
    relatedSymptoms: ["swollen-knee", "stiff-knee", "knee-pain"],
    relatedConditions: ["bakers-cyst", "meniscal-tear", "knee-arthritis"],
    relatedTreatments: ["Physiotherapy", "Knee Injections"],
    metadataTitle: "Back of Knee Pain: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of pain at the back of the knee, how it's assessed, and when to seek advice. Discover Baker's cyst indications and causes.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "inner-knee-pain": {
    slug: "inner-knee-pain",
    name: "Pain on the Inside of the Knee",
    shortDescription: "Medial knee pain along the inner joint line, commonly aggravated by twisting, walking, or weight-bearing.",
    introduction: "Pain on the inside of the knee (medial knee pain) is a common symptom in both active and older adults. This page covers medial meniscus, ligament, and arthritic causes.",
    whatIs: "Inner knee pain is localized to the medial side of the joint. It is commonly associated with the medial meniscus, the Medial Collateral Ligament (MCL), or medial compartment osteoarthritis. Wording is cautious: pain along the inner joint line can have several causes, and a physical examination is required to localize the affected structure.",
    commonPresentations: [
      "Sharp pain along the inner joint line when twisting or turning",
      "Dull, aching pain on the inside of the knee after prolonged walking",
      "Tenderness to touch on the inner bone prominence of the joint",
      "Pain when pushing the knees together or crossing the legs"
    ],
    durationPattern: "Can occur suddenly following a sporting injury (MCL sprain or meniscus tear) or develop gradually over several months (medial compartment wear).",
    possibleCauses: ["knee-arthritis", "meniscal-tear"],
    warningSigns: [
      "Inability to bear weight on the leg following an injury",
      "A feeling of the inner knee shifting or opening up under load",
      "Severe swelling that develops rapidly within a few hours"
    ],
    assessment: [
      "Review of onset (sudden twist vs. gradual ache) and pain location",
      "Physical examination checking for medial joint line tenderness",
      "Valgus stress testing to evaluate the stability of the MCL",
      "Assessment of walking alignment and knee range of motion"
    ],
    investigations: [
      "Standard weight-bearing X-rays to check for medial joint space narrowing",
      "MRI scan to assess the medial meniscus, MCL, and articular cartilage"
    ],
    initialManagement: [
      "Relative rest: avoiding twisting movements and pivoting on the leg",
      "Ice application to the inner knee to manage localized pain",
      "Gentle quad-strengthening exercises to support medial joint stability",
      "Using a supportive brace if the inner ligament feels weak"
    ],
    whenToConsult: [
      "Pain along the inner joint line persists despite rest",
      "The knee feels unstable or opens up on the inside",
      "The pain restricts your daily walking, work, or sleep"
    ],
    faqs: [
      {
        question: "What causes pain on the inside of the knee?",
        answer: "Common causes include medial meniscus tears, medial compartment osteoarthritis, Medial Collateral Ligament (MCL) sprains, or pes anserine bursitis."
      },
      {
        question: "How is an MCL sprain different from a meniscus tear?",
        answer: "An MCL sprain is an injury to the ligament on the outside of the joint capsule, often caused by an impact. A meniscus tear is damage to the shock-absorbing cartilage inside the joint, often caused by twisting."
      },
      {
        question: "Can inner knee pain be treated without surgery?",
        answer: "Yes. The vast majority of inner knee pain cases (including MCL sprains, early arthritis, and many meniscus tears) respond well to targeted physical therapy and load management."
      }
    ],
    relatedSymptoms: ["knee-pain", "swollen-knee", "locked-knee"],
    relatedConditions: ["knee-arthritis", "meniscal-tear"],
    relatedTreatments: ["Physiotherapy", "Knee Injections"],
    metadataTitle: "Inner Knee Pain: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of pain on the inside of the knee, how it's assessed, and when to seek advice. Discover medial joint and ligament issues.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "outer-knee-pain": {
    slug: "outer-knee-pain",
    name: "Pain on the Outside of the Knee",
    shortDescription: "Lateral knee pain along the outer joint line or tendon, often aggravated by running, cycling, or turning.",
    introduction: "Pain on the outside of the knee (lateral knee pain) is frequently linked to activity. This page covers lateral meniscus, ligament, and iliotibial band (ITB) symptoms.",
    whatIs: "Outer knee pain is localized to the lateral side of the joint. It can be associated with the lateral meniscus, the Lateral Collateral Ligament (LCL), Iliotibial Band (ITB) friction, or lateral compartment wear. Wording is cautious: lateral pain can have mechanical or soft-tissue causes, and an assessment is key to directing recovery.",
    commonPresentations: [
      "Sharp pain on the outer joint line during twisting or pivoting",
      "Aching pain on the outside of the knee that develops after running a specific distance",
      "Tenderness over the outer knee bone when bending the joint to 30 degrees",
      "Pain when walking downhill or downstairs"
    ],
    durationPattern: "Often related to repetitive loading (e.g. running or cycling) and may subside with rest, only to return when loading resumes.",
    possibleCauses: ["meniscal-tear", "knee-instability"],
    warningSigns: [
      "The outer knee feels unstable or shifts when weight-bearing",
      "Outer knee pain is accompanied by rapid joint swelling",
      "You cannot bear weight on the leg following a twisting injury"
    ],
    assessment: [
      "Review of training history, running mileage, and bike fit",
      "Physical examination checking for lateral joint line tenderness",
      "Varus stress testing to check the stability of the LCL",
      "Assessment of ITB tightness and gluteal muscle control"
    ],
    investigations: [
      "Standard X-rays to assess lateral joint compartment space",
      "MRI scan to evaluate the lateral meniscus, LCL, and ITB friction tissues"
    ],
    initialManagement: [
      "Relative rest: temporarily reducing running or cycling distances",
      "Applying ice to the outer knee after activity to manage discomfort",
      "Strengthening the hip abductors (gluteus medius) to improve leg alignment",
      "Checking and adjusting bike setup or footwear biomechanics"
    ],
    whenToConsult: [
      "Pain along the outer knee persists despite modifying your training",
      "The outer joint feels unstable or gives way during pivoting",
      "The pain interferes with daily walking or climbing stairs"
    ],
    faqs: [
      {
        question: "What causes pain on the outside of the knee?",
        answer: "Common causes include lateral meniscus tears, Iliotibial Band (ITB) Syndrome, Lateral Collateral Ligament (LCL) sprains, or lateral compartment osteoarthritis."
      },
      {
        question: "What is ITB Syndrome?",
        answer: "ITB Syndrome is an overuse condition where the thick band of tissue running down the outer thigh becomes irritated as it rubs against the outer knee bone, common in runners and cyclists."
      },
      {
        question: "How is lateral meniscus tear pain diagnosed?",
        answer: "It is diagnosed through clinical examination testing for lateral joint line tenderness and pain during rotation, confirmed by an MRI scan."
      }
    ],
    relatedSymptoms: ["knee-pain", "knee-giving-way", "knee-pain-after-injury"],
    relatedConditions: ["meniscal-tear", "knee-instability"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Outer Knee Pain: Causes | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of pain on the outside of the knee, how it's assessed, and when to seek advice. Discover lateral joint and ITB details.",
    reviewStatus: "Draft - Awaiting clinical review"
  },
  "knee-pain-after-injury": {
    slug: "knee-pain-after-injury",
    name: "Knee Pain After an Injury",
    shortDescription: "Acute knee pain following a sports collision, twisting event, fall, or direct impact to the joint.",
    introduction: "An acute knee injury can damage ligaments, tendons, or cartilage. This page covers traumatic injury assessment, swelling, instability, and early care.",
    whatIs: "Knee pain following an injury is a common clinical presentation resulting from twisting forces, falls, or direct blows. Such trauma can result in ligament sprains or tears (e.g. ACL, MCL), meniscus tears, cartilage damage, or bone injury. Wording is cautious: diagnosing an injury requires careful physical and imaging assessments, and website information cannot substitute for clinical evaluation.",
    commonPresentations: [
      "Severe pain and inability to stand on the leg after a twisting impact",
      "Swelling that develops rapidly (within 2 hours) or gradually (overnight)",
      "A feeling of the knee shifting or giving way at the moment of injury",
      "Mechanical catching or locking of the joint after a fall"
    ],
    durationPattern: "Acute pain is immediate and severe. Sub-acute symptoms (swelling, weakness, instability) can persist for weeks or months if injuries do not receive rehab or treatment.",
    possibleCauses: ["acl-injury", "meniscal-tear", "cartilage-injury", "knee-instability"],
    warningSigns: [
      "The knee swelled rapidly within 2 hours of the injury",
      "You heard or felt a loud 'pop' or snap inside the joint",
      "You cannot bear any weight on the leg or walk",
      "The knee is locked in a bent position and cannot be straightened"
    ],
    assessment: [
      "Detailed review of the injury mechanism (twisting, direct blow, hyperextension)",
      "Evaluation of immediate weight-bearing capacity and swelling onset speed",
      "Physical examination of ligament stability, range of motion, and tenderness",
      "Review of nerve and blood vessel function below the knee"
    ],
    investigations: [
      "Standard X-rays to check for fractures, dislocations, or bone avulsions",
      "MRI scan (highly recommended) to assess ligaments, meniscus, and cartilage"
    ],
    initialManagement: [
      "Following the RICE protocol: Rest the leg, apply Ice wrapped in a towel, apply a Compression bandage, and Elevate the leg",
      "Avoiding weight-bearing if it triggers sharp pain or joint giving-way",
      "Avoiding forcing the knee to move or bend if blocked",
      "Arranging prompt professional assessment if warning signs are present"
    ],
    whenToConsult: [
      "You cannot bear weight on the leg or the knee feels unstable",
      "Rapid swelling occurred after the injury",
      "The knee is catching, locking, or cannot be straightened"
    ],
    faqs: [
      {
        question: "What should I do immediately after a knee injury?",
        answer: "Follow the RICE protocol (Rest, Ice, Compression, Elevation) to manage swelling, avoid weight-bearing if painful, and seek medical assessment if you cannot walk or if the knee swelled rapidly."
      },
      {
        question: "What does a 'pop' at the time of injury mean?",
        answer: "A loud pop or snap often indicates a structural injury, such as a complete rupture of the ACL, a patellar dislocation, or a severe meniscus tear, requiring assessment."
      },
      {
        question: "How long does it take for a knee injury to heal?",
        answer: "Recovery depends entirely on the injured structures. Mild sprains can recover in 4-6 weeks with physical therapy, while major ligament tears or meniscus injuries can take 3-12 months."
      }
    ],
    relatedSymptoms: ["swollen-knee", "locked-knee", "knee-giving-way", "unable-to-straighten-knee"],
    relatedConditions: ["acl-injury", "meniscal-tear", "cartilage-injury", "knee-instability"],
    relatedTreatments: ["Physiotherapy", "Book Appointment"],
    metadataTitle: "Knee Pain After an Injury | Lincolnshire Knee Clinic",
    metadataDescription: "Learn about possible causes of knee pain after an injury, how it's assessed, and when to seek advice. Discover acute trauma guidelines and red flags.",
    reviewStatus: "Draft - Awaiting clinical review"
  }
};
