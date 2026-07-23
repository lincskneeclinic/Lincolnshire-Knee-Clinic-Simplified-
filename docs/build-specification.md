# Phase 1 Website Build Specification

## Lincolnshire Knee Clinic Digital Platform

**Version:** 1.0  
**Status:** Approved Phase 1 public website build specification  
**Primary use:** Developer-ready instructions for website implementation  
**Repository:** `lincskneeclinic/Lincolnshire-Knee-Clinic`  
**Primary domain:** `lincolnshirekneeclinic.co.uk`

---

## 1. Purpose

This document defines the build requirements for the Phase 1 Lincolnshire Knee Clinic public website.

The purpose of this file is to provide clear instructions for developers and AI coding tools so that the website is built consistently with the approved project documentation.

This build specification must be read alongside:

```text
docs/project-vision.md
docs/sitemap.md
docs/design-system.md
docs/branding.md
docs/content-guidelines.md
docs/seo-strategy.md
docs/accessibility.md
docs/integration.md
```

This document should prevent:

- Random page creation
- Incorrect navigation
- Fake clinician names
- Fake clinic details
- Unsupported clinical claims
- Premature patient portal development
- Poor accessibility
- Inconsistent design
- Uncontrolled AI-generated content

---

## 2. Phase 1 Scope

Phase 1 is the public website foundation.

Phase 1 should build:

```text
Home page
About page
Symptoms hub
Conditions hub
Treatments hub
Injections hub
Education & Blog hub
Clinics page
Booking page
Contact page
Urgent Advice page
Legal/governance pages
Reusable page templates
Reusable UI components
```

Phase 1 should not build:

```text
Full patient portal
Patient login
Patient account activation
Secure messaging
Medical record storage
Patient document access
Outcome score collection
Rehabilitation tracking
Open self-registration
AI diagnosis tool
Symptom checker
Clinical triage tool
Custom appointment database
```

---

## 3. Technology Stack

The Phase 1 website should use:

```text
Next.js
React
TypeScript
Tailwind CSS
GitHub
VS Code
```

The website application should live in:

```text
web/
```

The documentation should remain in:

```text
docs/
```

Static brand assets should live in:

```text
assets/
```

Structured content may later live in:

```text
content/
```

---

## 4. Approved Public Website Navigation

The main navigation must be:

```text
Home
Symptoms
Conditions
Treatments
Injections
Education & Blog
Clinics
Contact
Book Appointment
```

Utility navigation should include:

```text
Urgent Advice
Patient Portal
Contact
```

Important rule:

The `Patient Portal` link may appear as a future placeholder, but it must not lead to a working patient portal in Phase 1 unless explicitly approved.

Suggested behaviour for Phase 1:

```text
Patient Portal link opens a “Coming Soon” or “Patient Portal in development” placeholder page
```

or the link may be hidden until the portal is ready.

---

## 5. Approved Phase 1 URLs

The Phase 1 website should follow the sitemap defined in:

```text
docs/sitemap.md
```

Priority URLs:

```text
/
 /about
 /symptoms
 /conditions
 /treatments
 /injections
 /education
 /clinics
 /book-appointment
 /contact
 /urgent-advice
 /privacy-policy
 /cookie-policy
 /accessibility-statement
 /medical-disclaimer
 /terms-of-use
 /professional-registrations
 /hospital-affiliations
```

Initial clinical sub-pages may be created as templates/placeholders, but they must not contain fake clinical claims.

Priority sub-page examples:

```text
/symptoms/knee-pain
/symptoms/swollen-knee
/symptoms/knee-locking
/symptoms/knee-giving-way
/symptoms/knee-pain-on-stairs
/conditions/knee-arthritis
/conditions/meniscus-tear
/conditions/acl-injury
/treatments/knee-arthritis-treatment
/treatments/total-knee-replacement
/treatments/knee-arthroscopy
/injections/cortisone-injection
/injections/hyaluronic-acid-injection
/injections/prp-injection
/injections/arthrosamid-injection
```

---

## 6. Build Order

The recommended build order is:

```text
1. Global layout
2. Header/navigation
3. Footer
4. Design tokens
5. Shared UI components
6. Home page
7. Hub page template
8. Clinical content page template
9. Symptoms hub
10. Conditions hub
11. Treatments hub
12. Injections hub
13. Education & Blog hub
14. Clinics page
15. Booking page
16. Contact page
17. Urgent Advice page
18. Legal/governance page template
19. Placeholder content structure
20. SEO metadata
21. Accessibility review
22. Mobile review
```

Do not build the patient portal during this phase.

---

## 7. Global Layout Requirements

The global layout should include:

```text
Header
Utility navigation
Main navigation
Main content area
Footer
Urgent advice link
Book Appointment call-to-action
```

The layout should follow the visual rules in:

```text
docs/design-system.md
```

The layout should be:

- Fully responsive
- Accessible
- Mobile-first
- Readable
- Calm and clinical
- Consistent across all public pages

---

## 8. Header Requirements

The header should include:

```text
Logo mark
Lincolnshire Knee Clinic name
Main navigation
Book Appointment button
Utility links
Mobile hamburger menu
```

Logo file path:

```text
assets/brand/lkc-logo-k-transparent.png
```

If the logo file is not yet available, use a placeholder but keep the path reserved.

Logo alt text:

```text
Lincolnshire Knee Clinic
```

Header rules:

- Do not overcrowd the header.
- Keep navigation readable.
- Keep `Book Appointment` prominent.
- Use consistent navigation labels.
- Ensure keyboard accessibility.
- Ensure mobile menu accessibility.
- Do not use fake slogans.

---

## 9. Footer Requirements

The footer should include:

```text
Clinic name
Short clinic description
Navigation links
Book Appointment link
Contact link
Urgent Advice link
Legal/governance links
Professional registrations placeholder
Hospital affiliations placeholder
Medical disclaimer link
Privacy policy link
Cookie policy link
Accessibility statement link
```

Footer placeholder fields:

```text
[Consultant Name]
[GMC Number]
[Hospital Affiliation]
[Clinic Email Address]
[Clinic Phone Number]
```

Do not invent these details.

---

## 10. Design System Implementation

The build must implement the approved design direction:

```text
Calm clinical navy and white design
Teal-blue logo mark
Serif headings
Sans-serif body text
Reusable card system
Structured navigation
Accessible buttons
Clinical sidebar on desktop clinical pages
Mobile-first responsive layout
```

Core colours should follow:

```text
Primary Navy: #003B5C
Deep Navy: #002B45
Clinical Blue: #0B5E7A
Soft Blue Background: #EEF5FA
Pale Blue Surface: #F5FAFD
White: #FFFFFF
Off White: #FAFBFC
Border Grey: #D9DADD
Text Primary: #102A43
Text Secondary: #486581
Muted Text: #627D98
Error / Urgent: #B42318
Error Background: #FDECEC
```

Typography should follow:

```text
Headings: Source Serif 4, Georgia, serif
Body/UI: Inter, system-ui, sans-serif
```

If external fonts are not configured initially, use safe fallbacks while preserving the typographic hierarchy.

---

## 11. Component Requirements

The website should include reusable components for:

```text
Header
Footer
Button
CTA banner
Urgent advice banner
Symptom card
Condition card
Treatment card
Injection card
Education article card
Clinic card
FAQ accordion
Booking panel
Clinical metadata block
Medical disclaimer block
Breadcrumbs
Clinical sidebar
Legal content block
Page hero
Section heading
```

Each component should:

- Be reusable
- Be accessible
- Use TypeScript props where appropriate
- Follow design tokens
- Avoid hardcoded fake clinical details
- Support mobile behaviour

---

## 12. Page Template Requirements

### 12.1 Home Page

The home page should include:

```text
Hero section
Common knee symptoms
Conditions overview
Treatments overview
Injections overview
Consultant-led care section
Clinics/location section
Education & Blog preview
Booking call-to-action
Trust/governance cues
Urgent advice link
```

Hero message should use approved wording:

```text
Consultant-led knee care in Lincolnshire.
```

Supporting wording:

```text
Specialist assessment and treatment for knee pain, arthritis, sports knee injuries, injections and knee replacement concerns.
```

Avoid:

```text
Best knee surgeon
Guaranteed results
Pain-free treatment
World-class care
```

---

### 12.2 Symptoms Hub

The symptoms hub should include:

```text
Clear page introduction
Symptom cards
Plain-language descriptions
Related conditions links
Urgent advice signpost
Booking call-to-action
Medical disclaimer
```

Do not call it a symptom checker.

Use:

```text
Find information by symptom
```

Avoid:

```text
Check what is wrong with your knee
```

---

### 12.3 Conditions Hub

The conditions hub should include:

```text
Condition cards
Short condition descriptions
Related symptom links
Treatment links
Booking call-to-action
Medical disclaimer
```

Priority conditions:

```text
Knee arthritis
Osteoarthritis of the knee
Meniscus tear
ACL injury
Knee ligament injuries
Patellofemoral pain
Kneecap instability
Cartilage damage
Baker’s cyst
Knee bursitis
IT band syndrome
Pain after knee replacement
```

---

### 12.4 Treatments Hub

The treatments hub should include:

```text
Treatment cards
Non-surgical treatment section
Surgical treatment section
Recovery information link
Booking call-to-action
Medical disclaimer
```

Priority treatments:

```text
Knee arthritis treatment
Physiotherapy for knee pain
Knee braces
Knee arthroscopy
Meniscus surgery
ACL reconstruction
Partial knee replacement
Total knee replacement
Revision knee replacement
Robotic knee replacement
Recovery after knee surgery
```

---

### 12.5 Injections Hub

The injections hub should include:

```text
Injection cards
Comparison table
Balanced explanation
Risks/limitations signpost
Booking call-to-action
Medical disclaimer
```

Injection pages:

```text
Cortisone injection
Hyaluronic acid injection
PRP injection
Arthrosamid injection
```

The comparison table should compare:

```text
Purpose
Typical use
Speed of effect
Duration of effect
Evidence strength
Repeat treatment considerations
Suitability
Limitations
```

Do not overstate injection benefits.

---

### 12.6 Education & Blog Hub

The education hub should include:

```text
Article categories
Featured articles
Condition-related education
Treatment-related education
Injection-related education
Recovery and rehabilitation articles
FAQ links
```

Approved categories:

```text
Knee arthritis
Knee replacement
Sports knee injuries
Injections
Recovery and rehabilitation
Patient guides
FAQs
```

---

### 12.7 Clinics Page

The clinics page should include:

```text
Confirmed clinic locations
Placeholder cards for unconfirmed clinics if needed
Available services
Consultation availability
Injection availability
Parking/accessibility information
Booking call-to-action
```

Do not publish fake clinic addresses.

Use placeholders:

```text
[Clinic Name]
[Clinic Address]
[Clinic Phone Number]
[Clinic Email Address]
[Hospital Affiliation]
```

---

### 12.8 Booking Page

The booking page should include:

```text
Online Booking section
Microsoft Bookings placeholder or link
Face-to-face consultation option
Injection consultation option
Video consultation option if available
What to prepare before appointment
Contact for booking support
Urgent advice warning
```

Use:

```text
Online Booking
Microsoft Bookings
Book Appointment
```

Avoid:

```text
Secure Patient Portal
Emergency appointment
Instant specialist advice
24/7 urgent care
```

---

### 12.9 Contact Page

The contact page should include:

```text
General enquiry information
Contact form placeholder
Booking support details
Clinic contact placeholders
Response time expectations
Urgent advice warning
Medical disclaimer
```

Safety wording:

```text
Please do not use this form for urgent medical problems. Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
```

---

### 12.10 Urgent Advice Page

The urgent advice page should use approved wording.

Short wording:

```text
Urgent symptoms? Read urgent advice.
```

Supporting wording:

```text
Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
```

Additional wording:

```text
If you have severe knee pain, cannot put weight on the leg, have a badly swollen or deformed knee, or have fever, redness or heat around the knee, seek urgent medical advice via NHS 111.

If you have recently had surgery and are concerned about increasing pain, wound leakage, fever, calf swelling, chest pain or shortness of breath, contact the hospital where your surgery was performed or seek urgent medical help.
```

Do not imply that the clinic provides emergency care.

---

### 12.11 Legal/Governance Pages

Legal pages should be created as templates.

Required legal/governance URLs:

```text
/privacy-policy
/cookie-policy
/accessibility-statement
/medical-disclaimer
/terms-of-use
/professional-registrations
/hospital-affiliations
```

Important:

Legal/privacy content must be marked as:

```text
Draft/template content requiring legal review before publication.
```

---

## 13. Content Placeholder Rules

Use approved placeholders only.

Approved placeholders:

```text
[Consultant Name]
[Clinical Reviewer]
[Last Reviewed Date]
[Clinic Name]
[Clinic Address]
[Clinic Phone Number]
[Clinic Email Address]
[Hospital Affiliation]
[Evidence Source]
[Booking Link]
[GMC Number]
```

Do not use:

```text
Dr Sarah Jenkins
Mr John Smith
123 Medical Way
appointments@example.com
01522 000 000
```

Do not create fake testimonials.

Do not create fake patient stories.

Do not create fake awards or accreditations.

---

## 14. Clinical Content Rules

All clinical content must follow:

```text
docs/content-guidelines.md
docs/branding.md
```

Clinical wording should use:

```text
may help
may be considered
can be suitable for selected patients
depends on individual assessment
recovery varies between patients
```

Avoid:

```text
will cure
guaranteed results
pain-free
risk-free
best treatment
permanent fix
```

All clinical pages should include:

```text
Medical disclaimer
Reviewer metadata placeholder
Last reviewed date placeholder
Related pages
Booking call-to-action
Urgent advice link where relevant
```

---

## 15. SEO Requirements

All public pages should include:

```text
Meta title
Meta description
Canonical URL
Open Graph title
Open Graph description
Structured heading hierarchy
Readable URL
Internal links
```

SEO must follow:

```text
docs/seo-strategy.md
```

SEO must not create:

```text
Keyword stuffing
Doorway pages
Unsupported “best” claims
Duplicate clinical pages
Misleading local pages
```

---

## 16. Accessibility Requirements

The website must aim to meet:

```text
WCAG 2.1 AA
```

Implementation must follow:

```text
docs/accessibility.md
```

Minimum requirements:

```text
Readable text sizes
Strong colour contrast
Keyboard-accessible navigation
Visible focus states
Persistent form labels
Alt text for meaningful images
No placeholder-only form labels
No colour-only status indicators
Mobile tap targets at least 48px
Functional at 200% browser zoom
No permanent desktop sidebar on mobile
```

Add a skip link:

```text
Skip to main content
```

---

## 17. Mobile Requirements

Mobile layout must:

```text
Use one-column layout
Stack cards vertically
Use standard hamburger menu
Keep Book Appointment visible
Use full-width buttons where appropriate
Keep text readable
Avoid horizontal scrolling
Collapse sidebars into anchor menus or tabs
Keep urgent advice visible but not alarming
```

Mobile body text should be:

```text
16–18px
```

Tap targets should be at least:

```text
48px
```

---

## 18. Booking Integration Requirements

Phase 1 booking should use:

```text
Microsoft Bookings
```

The build should include a placeholder for:

```text
[Booking Link]
```

or a clear integration location for Microsoft Bookings.

Rules:

- Do not build a custom booking database.
- Do not store patient appointment data in the app in Phase 1.
- Do not call Microsoft Bookings a patient portal.
- Do not imply emergency access.
- Include urgent advice warning near booking.

---

## 19. Contact Form Requirements

If a contact form is built in Phase 1, it must:

```text
Use persistent labels
Include urgent advice warning
Avoid collecting excessive sensitive data
Send to approved clinic email/workflow
Include privacy notice link
Include confirmation message
Include spam protection if possible
```

Do not request detailed medical histories in a public contact form unless governance is defined.

A simple Phase 1 alternative is to provide contact details and booking links without a custom form.

---

## 20. Asset Requirements

Logo path:

```text
assets/brand/lkc-logo-k-transparent.png
```

Image rules:

- Use descriptive filenames.
- Optimise images.
- Avoid misleading generic doctor images in final production.
- Prefer real consultant/clinic images when available.
- Use diagrams only when clinically accurate.
- Use alt text for meaningful images.

---

## 21. Patient Portal Guardrails

Do not build the patient portal in Phase 1.

Allowed Phase 1 portal-related items:

```text
Patient Portal placeholder link
Coming soon page
Design-compatible components
Future architecture notes
```

Not allowed in Phase 1 unless explicitly approved:

```text
Login
Authentication
Account activation
MFA
Patient dashboard
Patient documents
Patient data storage
Secure messaging
Outcome scores
Rehabilitation tracking
Admin dashboard
Supabase patient data integration
```

---

## 22. Supabase Guardrails

Supabase may exist in repository planning but should not be used for patient data in Phase 1.

Do not implement:

```text
Patient tables
Medical records
Document storage
Outcome scores
Secure messages
Patient authentication
```

until governance is approved.

Future Supabase implementation must include:

```text
Row-level security
Role-based access control
MFA
Audit logs
Consent
Data retention
Incident response
Privacy review
```

---

## 23. AI Coding Tool Instructions

Any AI coding tool working on this project must:

```text
Read docs/project-vision.md
Read docs/sitemap.md
Read docs/design-system.md
Read docs/branding.md
Read docs/content-guidelines.md
Read docs/seo-strategy.md
Read docs/accessibility.md
Read docs/integration.md
Read docs/build-specification.md
```

AI tools must not:

```text
Invent pages outside sitemap
Invent clinician names
Invent clinic addresses
Invent phone numbers
Invent testimonials
Invent clinical evidence
Invent statistics
Build a patient portal
Create a symptom checker
Create diagnosis functionality
Create custom patient data workflows
Use unsupported clinical claims
Ignore accessibility requirements
```

---

## 24. Definition of Done for Phase 1

Phase 1 public website foundation is complete when:

```text
Global layout exists
Header works on desktop and mobile
Footer exists
Home page exists
Main hub pages exist
Booking page exists
Contact page exists
Urgent advice page exists
Legal template pages exist
Reusable components exist
Design system is reflected in UI
Navigation matches sitemap
Mobile layout works
Accessibility basics pass review
SEO metadata exists
No fake clinical/clinic details remain
No unsupported claims remain
No patient portal functionality is implemented
```

---

## 25. Recommended First Developer Prompt

Use this prompt when asking Antigravity, Codex, Copilot or another coding AI to start building:

```text
You are building the Phase 1 public website for Lincolnshire Knee Clinic.

Before writing code, read and follow all files in the /docs folder, especially:

- docs/project-vision.md
- docs/sitemap.md
- docs/design-system.md
- docs/branding.md
- docs/content-guidelines.md
- docs/seo-strategy.md
- docs/accessibility.md
- docs/integration.md
- docs/build-specification.md

Build only the Phase 1 public website foundation.

Do not build the patient portal.
Do not build login.
Do not build patient records.
Do not build secure messaging.
Do not build outcome scores.
Do not create a symptom checker.
Do not invent clinician names, clinic addresses, phone numbers, testimonials or statistics.

Use the existing Next.js app in /web.

Create the global layout, header, footer, design tokens, reusable components and the initial public pages according to docs/build-specification.md.

Use placeholders only where real details are not yet confirmed.

Ensure the implementation is accessible, mobile-responsive, clinically calm, and aligned with the approved design system.
```

---

## 26. Final Build Statement

The Phase 1 build should create a professional, accessible, clinically governed public website for Lincolnshire Knee Clinic.

The website should provide:

```text
Clear patient education
Specialist knee clinic positioning
Safe urgent advice routing
Simple booking pathway
Structured clinical content
Reusable templates
Future-ready architecture
```

The website should not become a portal, triage system, diagnosis tool or ungoverned clinical content generator during Phase 1.
