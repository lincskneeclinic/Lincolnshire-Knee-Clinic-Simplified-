# Lincolnshire Knee Clinic — Asset Classification Register

This document is the human-readable version of `web/data/assetClassification.ts`.

**Last updated:** 2026-07-12

## Category Key

| Code | Category |
|---|---|
| **A** | Existing approved asset |
| **B** | Open-licensed illustration suitable for adaptation |
| **C** | Commercially licensed asset required |
| **D** | Bespoke medical illustration required |
| **E** | Consultant-supplied anonymised X-ray or MRI required |
| **F** | Clinic-supplied photograph or map required |
| **G** | Interactive component (SVG / React — no external raster asset needed) |
| **H** | Placeholder pending further decision |

---

## Conditions Pages

| Page | Section | Asset | Cat | Clinical Review | Status |
|---|---|---|---|---|---|
| knee-arthritis | overview | Knee Arthritis Joint Anatomy Diagram | D | Required | Published |
| knee-arthritis | interactive-anatomy | Interactive SVG Anatomy (InteractiveAnatomyDiagram) | G | Required | Awaiting clinical review |
| knee-arthritis | imaging | Weight-Bearing AP X-Ray | E | Required | Published |
| knee-arthritis | comparison | Healthy vs Arthritic Knee | D | Required | Published |
| knee-arthritis | pathway | Osteoarthritis Treatment Pathway | G | Required | Awaiting clinical review |
| acl-injury | overview | ACL Anatomy and Tear Diagram | D | Required | Published |
| acl-injury | comparison | Intact vs Torn ACL Before/After | D | Required | Published |
| acl-injury | imaging | Sagittal MRI: ACL Tear | E | Required | Published |
| meniscal-tear | overview | Meniscus Anatomy and Tear Types | D | Required | Published |
| meniscal-tear | imaging | Coronal MRI: Medial Meniscal Tear | E | Required | Published |
| patellofemoral-pain | overview | Patellofemoral Joint Diagram | D | Required | Published |
| cartilage-injury | overview | Articular Cartilage Defect Diagram | D | Required | Published |
| bakers-cyst | overview | Baker's Cyst Location Diagram | D | Required | Published |
| knee-instability | overview | Knee Ligament Stability Diagram | D | Required | Published |
| patellar-instability | overview | Patellar Tracking Diagram | D | Required | Published |
| knee-tendinopathy | overview | Patellar and Quadriceps Tendon Anatomy | D | Required | Published |

---

## Treatment Pages

| Page | Section | Asset | Cat | Clinical Review | Status |
|---|---|---|---|---|---|
| total-knee-replacement | overview | TKR Implant Diagram | D | Required | Proposed |
| total-knee-replacement | pathway | TreatmentPathway Component | G | Required | Awaiting clinical review |
| total-knee-replacement | recovery | RecoveryPathway Component | G | Required | Awaiting clinical review |
| partial-knee-replacement | overview | Unicompartmental Implant Diagram | D | Required | Proposed |
| acl-reconstruction | overview | ACL Graft Reconstruction Diagram | D | Required | Proposed |
| physiotherapy | overview | Physiotherapy Illustration | H | Required | Proposed |
| meniscal-surgery | overview | Arthroscopic Meniscal Surgery Diagram | D | Required | Proposed |
| cartilage-procedures | overview | Cartilage Repair Procedure Diagram | D | Required | Proposed |
| knee-arthroscopy | overview | Knee Arthroscopy Setup Diagram | D | Required | Proposed |
| patellar-stabilisation | overview | Patellar Stabilisation Diagram | D | Required | Proposed |
| enhanced-recovery | pathway | RecoveryPathway Component | G | Required | Awaiting clinical review |

---

## Injection Pages

| Page | Section | Asset | Cat | Clinical Review | Status |
|---|---|---|---|---|---|
| ultrasound-guided-knee-injections | procedure | InjectionStepViewer Component | G | Required | Awaiting clinical review |
| corticosteroid | overview | Corticosteroid Injection Anatomy | D | Required | Proposed |
| prp | overview | PRP Injection Anatomy Diagram | D | Required | Proposed |
| hyaluronic-acid | overview | Hyaluronic Acid Injection Diagram | D | Required | Proposed |
| arthrosamid | overview | Arthrosamid® Injection Diagram | D | Required | Proposed |

---

## Symptom Pages

| Page | Section | Asset | Cat | Clinical Review | Status |
|---|---|---|---|---|---|
| front-of-knee-pain | pain-map | PainLocationMap SVG Component | G | Required | Awaiting clinical review |
| front-of-knee-pain | overview | Front of Knee Anatomy Illustration | D | Required | Proposed |
| swollen-knee | overview | Swollen Knee Causes Diagram | H | Required | Proposed |
| locked-knee | overview | Locked Knee Diagram | H | Required | Proposed |
| stiff-knee | overview | Knee Stiffness Diagram | H | Required | Proposed |
| symptoms/* | pain-map | Shared PainLocationMap SVG | G | Required | Awaiting clinical review |

---

## Clinics Page

| Section | Asset | Cat | Clinical Review | Status |
|---|---|---|---|---|
| st-hughs-hospital | Google Map Embed | G | Not required | Approved |
| inspire-health | Google Map Embed | G | Not required | Approved |
| parkhill-hospital | Google Map Embed | G | Not required | Approved |
| lincoln-private-hospital | Google Map Embed | G | Not required | Approved |

---

## Summary Counts

| Status | Count |
|---|---|
| Proposed | 4 |
| Awaiting clinical review | 9 |
| Approved | 4 |
| Published | 18 |
| Rejected | 0 |

---

## Assets Requiring Consultant Action

The following imaging assets cannot proceed without physical supply from Mr R J Pacheco:

- [x] Weight-bearing AP X-ray: Knee osteoarthritis (Supplied & Published)
- [x] Sagittal MRI: ACL tear (Supplied & Published)
- [x] Coronal MRI: Medial meniscal tear (Supplied & Published)
- [x] Axial MRI: Cartilage defect (Supplied & Published)
- [x] Ultrasound: Needle visualisation concept (Supplied & Published)
- [x] Post-operative X-ray: Total knee replacement (Supplied & Published)

All must be anonymised, DICOM-stripped, and explicitly approved for publication before integration.

---

## Assets Requiring Bespoke Illustration Commission

14 anatomical diagrams (category D) require commissioning from a qualified medical illustrator:

- Knee arthritis joint anatomy
- Healthy vs arthritic comparison
- ACL anatomy and tear
- ACL intact vs torn (before/after)
- Meniscus anatomy and tear types
- Patellofemoral joint and tracking
- Articular cartilage defect
- Baker's cyst location
- Knee ligament stability
- Patellar tracking
- Patellar and quadriceps tendon anatomy
- TKR implant diagram
- Partial knee replacement (unicompartmental)
- ACL graft reconstruction
- Injection anatomy diagrams (×4: corticosteroid, PRP, hyaluronic acid, Arthrosamid®)
