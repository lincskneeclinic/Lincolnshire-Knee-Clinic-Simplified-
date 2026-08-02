# Lincolnshire Knee Clinic – Image Prompt Library

## Purpose

This file provides reusable prompts for generating realistic, patient-facing 2D medical illustrations specifically related to the knee.

Use this file together with:

`/docs/medical-imagery-guidelines.md`

Before generating, selecting, editing, or placing any medical image, read and follow the medical imagery guidelines.

---

## Core Instructions

For every knee-image task:

1. Read `/docs/medical-imagery-guidelines.md`.
2. **Default to a real-life photograph unless the subject is internal anatomy, injection technique, surgical/implant technique, an internal pathology comparison, or diagnostic imaging** — those require illustration for clinical accuracy (a camera cannot see inside a joint). See "Default Medium" in the guidelines file.
3. Identify whether the image is for a symptom, condition, diagnostic, injection, treatment, surgery, rehabilitation, or comparison page.
4. Define the educational purpose.
5. Select and adapt the closest prompt in this library.
6. Maintain consistent subject framing, viewing angles, lighting, and colour palette within whichever medium (photo or illustration) is being used.
7. Generate clean images without embedded labels unless specifically requested.
8. Add labels later in the website, Figma, Canva, or SVG where possible.
9. Treat generated images as patient-education material, not diagnostic evidence, and never present a generated photograph as an image of a specific identifiable real patient.
10. Flag clinically doubtful, anatomically implausible, or unnaturally artificial-looking output before publication.
11. Do not introduce medical subjects unrelated to the knee.

---

# Global Photo Style

Append this to most prompts — this is the default medium (see Core Instructions above):

> Realistic, natural-looking photograph, photojournalistic style, natural lighting and shadows, authentic and candid rather than staged or artificial, true-to-life skin tones and textures, natural depth of field, premium and reassuring editorial quality, suitable for a UK private orthopaedic clinic's website or social media. No text, no watermark, no logo.

---

# Photo Negative Prompt

> Avoid: illustration, drawing, cartoon, clipart, 3D render, CGI, painting, sketch, diagram, uncanny or distorted faces, extra or malformed fingers/limbs, unnatural or plastic-looking skin, unrealistic lighting, text, misspelled labels, logos, watermarks, borders, frames, low resolution, blurry, oversaturated colours, exaggerated expressions, medical gore, blood, graphic surgical content.

---

# Global House Style

Append this to illustration prompts only (internal anatomy, injection technique, surgical/implant technique, internal pathology comparisons — see Core Instructions above):

> Anatomically accurate, realistic 2D medical illustration of the human knee, premium patient-education style, clinically credible anatomy, restrained natural colours, clean white or very pale neutral background, soft directional medical lighting, subtle shadows, crisp detail, modern orthopaedic textbook quality, calm and non-graphic, no blood, no gore, no text, no labels, no logo, no watermark.

For branded diagrams, add:

> Compatible with a clinical website using deep navy, soft pale blue, teal accents, white, and light grey. Keep the anatomy natural and use brand colours only for restrained highlights, arrows, comparison markers, or information panels.

---

# 1. Normal Knee Anatomy

*Illustration only — internal anatomy invisible from outside the body; use the Global House Style, not the Global Photo Style.*

## Healthy Knee – Three-Quarter View

> Create an anatomically accurate, realistic 2D medical illustration of a healthy adult human right knee in a three-quarter anterior view. Show the distal femur, proximal tibia, fibula, patella, articular cartilage, medial and lateral menisci, ACL, PCL, MCL, LCL, quadriceps tendon, and patellar tendon. Use clinically plausible proportions and clear separation of structures. No labels or text.

## Healthy Knee – Sagittal Cutaway

> Create an anatomically accurate, realistic 2D sagittal cutaway illustration of a healthy adult knee. Clearly show the femoral condyles, tibial plateau, patella, articular cartilage, medial and lateral menisci, ACL, PCL, quadriceps tendon, patellar tendon, and joint space.

## Healthy Knee – Front View

> Create an anatomically accurate, realistic 2D frontal illustration of a healthy adult knee with the patella partially transparent or reflected to reveal the joint structures. Show the femur, tibia, fibula, menisci, cruciate ligaments, collateral ligaments, and articular cartilage.

## Healthy Knee – Lateral View

> Create an anatomically accurate, realistic 2D lateral view of a healthy adult knee showing the femur, tibia, fibula, patella, patellar tendon, quadriceps tendon, articular cartilage, menisci, and cruciate ligaments.

---

# 2. Knee Symptoms

*Photograph (default) — a patient experiencing the symptom, not an internal view.*

## General Knee Pain

> Create a realistic photograph of an adult patient at home gently holding or pressing their knee with a discomforted expression, seated in a naturally lit room. Authentic, candid, photojournalistic style.

## Knee Swelling

> Create a realistic close-up photograph of a visibly swollen adult knee, natural skin tone and lighting, in a seated or resting position. Clinically plausible mild-to-moderate visible swelling.

## Knee Locking

> Create a realistic photograph of an adult patient pausing mid-movement with a startled, uncomfortable expression as if their knee has suddenly locked while walking or standing up, natural indoor setting.

## Knee Giving Way

> Create a realistic photograph of an adult patient reaching for support — a stair rail, chair, or wall — as their knee gives way beneath them, candid moment captured mid-motion, natural setting.

## Knee Stiffness

> Create a realistic photograph of an older adult patient carefully bending or straightening their knee while seated on the edge of a bed or chair in the morning, natural light, authentic expression of stiffness.

## Anterior Knee Pain

> Create a realistic close-up photograph of an adult patient pressing a hand against the front of their knee, around the kneecap, with a discomforted expression, natural lighting.

## Medial Knee Pain

> Create a realistic close-up photograph of an adult patient pressing a hand against the inner side of their knee with a discomforted expression, natural lighting.

## Lateral Knee Pain

> Create a realistic close-up photograph of an adult patient pressing a hand against the outer side of their knee with a discomforted expression, natural lighting.

## Posterior Knee Pain

> Create a realistic photograph of an adult patient reaching behind their own knee to touch the back of it with a discomforted expression, seated position, natural lighting.

---

# 3. Knee Conditions

*Illustration only — internal pathology invisible from outside the body; use the Global House Style, not the Global Photo Style.*

## Knee Osteoarthritis

> Create a realistic 2D medical illustration of knee osteoarthritis showing articular cartilage loss, joint-space narrowing, subchondral sclerosis, and small osteophytes. Use a three-quarter or frontal cutaway view.

## Healthy Knee vs Osteoarthritis

> Create a side-by-side realistic 2D comparison of a healthy knee and a knee affected by medial-compartment osteoarthritis. Keep the angle, scale, lighting, and proportions identical. Show preserved cartilage and joint space in the healthy knee and cartilage loss, medial joint-space narrowing, subchondral change, and small osteophytes in the arthritic knee.

## Medial Meniscal Tear

> Create a realistic 2D cutaway illustration of a clinically plausible medial meniscal tear. Show the femur, tibia, cartilage, both menisci, and cruciate ligaments. Highlight the tear subtly.

## Lateral Meniscal Tear

> Create a realistic 2D cutaway illustration of a clinically plausible lateral meniscal tear. Clearly distinguish the lateral meniscus from surrounding cartilage and ligaments.

## Bucket-Handle Meniscal Tear

> Create a realistic 2D cutaway illustration of a bucket-handle meniscal tear with the displaced fragment positioned toward the intercondylar notch. Show how it may contribute to locking.

## Meniscal Root Tear

> Create a realistic 2D illustration of a posterior meniscal root tear. Show disruption near the tibial root attachment and subtle meniscal extrusion.

## ACL Rupture

> Create a realistic 2D illustration of an ACL rupture. Show the ACL clearly disrupted while the PCL remains intact. Use a three-quarter cutaway view.

## PCL Rupture

> Create a realistic 2D illustration of a PCL rupture. Show the PCL disrupted while the ACL remains intact.

## MCL Injury

> Create a realistic 2D illustration of a medial collateral ligament injury. Show the MCL along the medial knee with a clinically plausible partial or complete tear.

## LCL Injury

> Create a realistic 2D illustration of a lateral collateral ligament injury. Show the LCL from the lateral femoral epicondyle to the fibular head with a clinically plausible tear.

## Patellofemoral Pain

> Create a realistic 2D illustration of the patellofemoral joint showing increased stress behind the patella during knee flexion. Use subtle contact-zone highlighting.

## Patellar Instability

> Create a realistic 2D illustration of lateral patellar instability. Show the patella displaced slightly laterally relative to the trochlear groove with restrained directional arrows.

## Patellar Dislocation

> Create a realistic 2D illustration of an acute lateral patellar dislocation. Show the patella positioned lateral to the trochlear groove with clinically plausible soft-tissue relationships.

## Trochlear Dysplasia

> Create a realistic 2D axial comparison of a normal trochlear groove and a dysplastic shallow trochlear groove. Keep the patella and femur at the same scale and angle.

## Focal Cartilage Defect

> Create a realistic 2D cutaway illustration of a focal articular cartilage defect on the femoral condyle. Show localised cartilage loss with intact surrounding cartilage and plausible subchondral bone.

## Osteochondral Lesion

> Create a realistic 2D illustration of an osteochondral lesion of the femoral condyle. Show involvement of both articular cartilage and underlying subchondral bone.

## Baker’s Cyst

> Create a realistic 2D posterior illustration of a knee with a Baker’s cyst. Show a modest fluid-filled swelling in the posteromedial knee.

## Patellar Tendinopathy

> Create a realistic 2D lateral or anterior illustration of patellar tendinopathy. Highlight thickening and degenerative change near the inferior pole of the patella.

## Iliotibial Band Friction Syndrome

> Create a realistic 2D lateral knee illustration showing the iliotibial band passing over the lateral femoral epicondyle. Use a subtle highlight at the friction region.

---

# 4. Knee Diagnostics

*Diagnostic imaging style only — X-ray/MRI/ultrasound-style images follow their own established imaging convention, not the Global Photo Style or Global House Style.*

## Normal Knee X-ray

> Create a realistic educational AP weight-bearing X-ray-style image of a normal adult knee. Show preserved medial and lateral joint spaces, normal alignment, smooth articular contours, and no obvious osteophytes. This must appear as an educational illustration, not a real patient image.

## Osteoarthritis X-ray

> Create a realistic educational AP weight-bearing X-ray-style image of a knee with medial-compartment osteoarthritis. Show medial joint-space narrowing, mild subchondral sclerosis, and small marginal osteophytes.

## Meniscal Tear MRI

> Create a realistic educational sagittal MRI-style image of the knee showing a meniscal tear as a subtle abnormal signal extending to the articular surface. Keep the grayscale anatomy plausible. Do not imitate a named patient scan.

## ACL Tear MRI

> Create a realistic educational sagittal MRI-style image of the knee showing discontinuity and abnormal orientation of the ACL, with the PCL intact.

## Cartilage Defect MRI

> Create a realistic educational MRI-style image showing a focal cartilage defect on a femoral condyle with plausible subchondral change.

## Knee Imaging Pathway

> Create a clean 2D patient pathway diagram showing the role of clinical assessment, X-ray, MRI, and ultrasound in evaluating knee problems. Use simple icons and arrows without embedded text.

---

# 5. Knee Injections

*Illustration only — needle trajectory into the intra-articular space can't be seen from outside the body; use the Global House Style, not the Global Photo Style.*

## Generic Knee Joint Injection

> Create a realistic 2D patient-education illustration of an intra-articular knee injection. Show a fine needle entering the knee joint through a clinically plausible approach with accurate anatomy. Keep the image sterile, calm, and non-graphic.

## Corticosteroid Injection

> Create a realistic 2D illustration of a corticosteroid injection into the knee joint. Show the needle entering the intra-articular space and a subtle indication of medication dispersing within the joint.

## Hyaluronic Acid Injection

> Create a realistic 2D illustration of a hyaluronic acid injection into the knee joint. Show a fine needle entering the joint space and a subtle translucent indication of the injected material.

## PRP Injection

> Create a realistic 2D illustration of a platelet-rich plasma injection into the knee joint. Show a fine needle entering the intra-articular space and a restrained amber-coloured indication of the injected preparation.

## Arthrosamid Injection

> Create a realistic patient-education 2D illustration of an intra-articular hydrogel injection into the knee joint. Show a fine needle entering through a clinically plausible approach and a subtle translucent hydrogel distribution within the synovial cavity. No product packaging or branding.

## Ultrasound-Guided Knee Injection

> Create a realistic 2D illustration of an ultrasound-guided knee injection. Show an ultrasound probe on the knee and a needle approaching the joint under image guidance. Include a small simplified ultrasound screen without text or identifiers.

## Injection Comparison

> Create a clean four-panel 2D comparison for corticosteroid, hyaluronic acid, PRP, and hydrogel knee injections. Use the same knee angle and scale in each panel and distinguish each material subtly. No labels or text.

---

# 6. Non-Surgical Knee Treatment

*Photograph (default) — externally visible treatment/rehabilitation activity.*

## Knee Physiotherapy

> Create a realistic photograph of an adult patient performing guided knee-strengthening exercises with a physiotherapist in a bright clinical or gym setting, correct form, authentic candid interaction.

## Quadriceps Strengthening

> Create a realistic photograph of an adult performing a straight-leg raise exercise on a mat or bed, correct leg position and posture, natural lighting.

## Cycling Rehabilitation

> Create a realistic photograph of an adult using a stationary exercise bike as part of knee rehabilitation, comfortable seated position, natural gym or home setting.

## Knee Brace

> Create a realistic close-up photograph of an adult's knee fitted with a clinically appropriate hinged or unloading knee brace, correct positioning, natural skin tone and lighting.

## Low-Impact Activity

> Create a realistic photograph of an adult engaged in a low-impact activity such as walking, cycling, or swimming, outdoors or in a leisure setting, authentic candid moment.

---

# 7. Knee Surgery

*Illustration only — internal surgical/implant technique invisible from outside the body; use the Global House Style, not the Global Photo Style.*

## Knee Arthroscopy

> Create a realistic 2D illustration of knee arthroscopy. Show two small portal incisions, an arthroscope within the knee joint, and internal joint structures in a clean cutaway. Keep it non-graphic.

## Meniscal Repair

> Create a realistic 2D illustration of arthroscopic meniscal repair. Show a torn meniscus stabilised with small repair sutures or devices while preserving normal anatomy.

## Partial Meniscectomy

> Create a realistic 2D illustration of arthroscopic partial meniscectomy. Show only the unstable damaged fragment being trimmed while preserving the healthy meniscal rim.

## ACL Reconstruction

> Create a realistic 2D illustration of ACL reconstruction. Show anatomically placed femoral and tibial tunnels with a graft spanning the native ACL position. Keep fixation devices subtle and clinically plausible.

## MPFL Reconstruction

> Create a realistic 2D illustration of medial patellofemoral ligament reconstruction. Show the graft extending from the medial patella to the correct medial femoral attachment.

## Tibial Tubercle Osteotomy

> Create a realistic 2D illustration of tibial tubercle osteotomy for patellar alignment. Show the tubercle segment repositioned and fixed with screws.

## Cartilage Repair

> Create a realistic 2D illustration of a focal cartilage repair procedure on the femoral condyle. Show the local defect and repaired surface without implying guaranteed regeneration.

## High Tibial Osteotomy

> Create a realistic 2D illustration of a medial opening-wedge high tibial osteotomy. Show the corrected alignment, osteotomy site, wedge opening, and fixation plate.

## Partial Knee Replacement

> Create a realistic 2D cutaway illustration of a medial unicompartmental knee replacement. Show resurfacing limited to the medial femoral condyle and tibial plateau, with the other compartments and cruciate ligaments preserved.

## Total Knee Replacement

> Create a realistic 2D cutaway illustration of a total knee replacement. Show the femoral component, tibial tray, polyethylene insert, and optional patellar resurfacing. Keep implant proportions plausible.

## Partial vs Total Knee Replacement

> Create a side-by-side realistic 2D comparison of partial and total knee replacement. Use the same knee angle, scale, and lighting. Clearly show limited resurfacing in the partial replacement and broader resurfacing in the total replacement.

## Revision Knee Replacement

> Create a realistic 2D illustration of revision knee replacement with longer femoral and tibial stems and clinically plausible augmentation.

---

# 8. Recovery and Rehabilitation

*Photograph (default) — a representative moment of recovery/rehabilitation activity.*

## Postoperative Knee Care

> Create a realistic photograph of an adult patient at home in early post-operative recovery: leg elevated on cushions, a safely wrapped ice pack on the knee, crutches resting nearby, clean bandage visible. Natural home setting, authentic and reassuring.

## Walking with Crutches

> Create a realistic photograph of an adult patient using crutches correctly after knee surgery, safe posture and a controlled gait, natural indoor or outdoor setting.

## Range-of-Motion Exercise

> Create a realistic photograph of an adult patient performing a supported heel-slide exercise on a bed or mat to improve knee flexion after surgery, correct form, natural lighting.

## Return-to-Sport Pathway

> Create a realistic photograph of an adult patient athlete performing a guided sport-specific training drill — light jogging, agility ladder work, or balance work — on a training pitch or in a gym, as part of return-to-sport rehabilitation. Natural sports setting, authentic and encouraging, representing progress rather than a literal multi-stage diagram.

## Knee Surgery Recovery Timeline

> Create a realistic photograph of an adult patient demonstrating confident, steady mobility during knee recovery — for example walking unaided in a garden or corridor, or cycling on a stationary bike — symbolising progress through the recovery journey. Natural lighting, authentic and encouraging, representing progress rather than a literal timeline graphic.

---

# 9. Comparison Graphics

*Illustration only — internal pathology comparisons invisible from outside the body; use the Global House Style, not the Global Photo Style.*

## Normal vs Torn Meniscus

> Create a side-by-side realistic 2D comparison of a normal meniscus and a torn meniscus. Keep angle, scale, and lighting identical.

## Intact vs Torn ACL

> Create a side-by-side realistic 2D comparison of an intact ACL and a ruptured ACL. Keep all other anatomy identical.

## Normal Cartilage vs Cartilage Defect

> Create a side-by-side realistic 2D comparison of normal femoral articular cartilage and a focal cartilage defect. Use identical magnification and viewing angle.

## Mild vs Moderate vs Severe Osteoarthritis

> Create a three-panel realistic 2D comparison of mild, moderate, and severe knee osteoarthritis. Keep the same frontal cutaway angle and scale. Progressively show cartilage loss, joint-space narrowing, osteophytes, and subchondral change.

---

# 10. Responsive Output Requirements

## Desktop

- Landscape format, approximately 16:9 or 3:2
- Higher anatomical detail
- Space for adjacent explanatory text
- Optional room for external labels

## Tablet

- Approximately 4:3
- Main anatomy centred
- Reduced background space
- Avoid very small structures

## Mobile

- Portrait or square format
- Single clear focal point
- Simplified anatomy where necessary
- No dense multi-panel layouts or tiny labels

## Transparent Asset

- PNG or WebP
- Transparent background
- Suitable for cards and comparison panels

## Clean Master

- No labels
- No text
- No logos
- No watermark
- High resolution
- Suitable for later annotation

---

# 11. Universal Prompt Template

Use the photo version by default; use the illustration version only for internal anatomy, injection technique, surgical/implant technique, or internal pathology comparisons (see "Default Medium" in the guidelines file).

### Universal Photo Prompt Template (default)

> Create a realistic, natural photograph of [specific scenario/subject]. The educational purpose is to help patients understand [goal]. Show [what the photo depicts] from a [angle/framing] perspective. Use the Lincolnshire Knee Clinic photo style: photojournalistic, natural lighting, authentic and candid, true-to-life skin tones and textures, premium reassuring editorial quality, no text, no watermark, no logo. Format for [desktop/tablet/mobile] in [orientation or aspect ratio].

### Universal Illustration Template (internal anatomy/procedure only)

> Create an anatomically accurate, realistic 2D medical illustration of [specific knee subject]. The educational purpose is to help patients understand [goal]. Show [required structures or pathology] from a [view] perspective. Emphasise [key feature] subtly and clinically plausibly. Use the Lincolnshire Knee Clinic house style: premium patient-education quality, restrained natural colours, clean white or pale neutral background, calm clinical appearance, no blood, no gore, no text, no labels, no logo, and no watermark. Format for [desktop/tablet/mobile] in [orientation or aspect ratio].

---

# 12. Negative Prompt

Use the photo negative prompt by default (see "Photo Negative Prompt" above); this illustration negative prompt applies only to internal anatomy/procedure illustration content.

> Avoid incorrect ligament attachments, duplicated bones or tendons, malformed patellae, impossible joint geometry, excessive cartilage thickness, unrealistic meniscal shape, misplaced implants, incorrect surgical tunnels, exaggerated inflammation, blood, gore, text, misspelled labels, logos, watermarks, stock-photo aesthetics, cartoon anatomy, and decorative elements unrelated to the knee.

---

# 13. Clinical Review Checklist

Before publishing, confirm:

- Femur, tibia, fibula, and patella are correctly proportioned.
- Medial and lateral compartments are correctly orientated.
- ACL and PCL attachments are plausible.
- MCL and LCL courses are plausible.
- Menisci have realistic shape and position.
- Articular cartilage is not excessively thick.
- Pathology is clinically plausible and not exaggerated.
- Injection needle position is plausible.
- Surgical tunnels, grafts, implants, plates, and screws are plausible.
- The image does not imply a diagnosis for a specific patient.
- The image is appropriate for patient education.
- Descriptive alt text has been prepared.
- Licensing and attribution have been recorded where required.

---

# 14. Priority Image Set

1. Healthy knee anatomy
2. Healthy knee vs osteoarthritis
3. Medial meniscal tear
4. ACL rupture
5. Patellofemoral pain
6. Patellar instability
7. Focal cartilage defect
8. Baker’s cyst
9. Generic knee injection
10. Corticosteroid injection
11. Hyaluronic acid injection
12. PRP injection
13. Arthrosamid-type hydrogel injection
14. Knee arthroscopy
15. Meniscal repair
16. ACL reconstruction
17. High tibial osteotomy
18. Partial knee replacement
19. Total knee replacement
20. Partial vs total knee replacement
21. Osteoarthritis X-ray
22. Meniscal tear MRI
23. ACL tear MRI
24. Knee surgery recovery timeline
25. Return-to-sport pathway

---

# Usage Instructions

When asking an AI assistant to create an image prompt:

> Read `/docs/medical-imagery-guidelines.md` and `/docs/image-prompt-library.md`. Generate the required knee image prompt using the house style, clinical accuracy rules, responsive format requirements, and clinical review checklist. Do not introduce non-knee medical subjects.

When asking a coding assistant to place imagery on the website:

> Read `/docs/medical-imagery-guidelines.md` and `/docs/image-prompt-library.md`. Add the approved knee imagery to the relevant page with responsive desktop, tablet, and mobile behaviour, descriptive alt text, lazy loading, and no layout shift.
