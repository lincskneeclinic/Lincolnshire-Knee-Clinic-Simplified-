# Design System

## Lincolnshire Knee Clinic Digital Platform

**Version:** 1.0  
**Status:** Approved high-fidelity design direction  
**Primary use:** Public website  
**Future use:** Secure patient portal  
**Repository:** `lincskneeclinic/Lincolnshire-Knee-Clinic`

---

## 1. Purpose

This document defines the approved visual design system for Lincolnshire Knee Clinic.

The design system exists to ensure that the website and future patient portal remain:

- Clinically credible
- Consultant-led
- Accessible
- Calm and professional
- Easy to read for patients
- Scalable across public and secure digital services
- Consistent across pages, components and future modules

This document should guide all future design, development and AI-generated interface work.

---

## 2. Design Principles

The platform should feel:

- Clinical
- Calm
- Trustworthy
- Professional
- Consultant-led
- Evidence-aware
- Accessible
- Modern but not flashy
- Premium but not luxury
- Clear for middle-aged and elderly patients

The platform should not feel:

- Cosmetic
- Fitness-focused
- Overly commercial
- Sales-heavy
- Startup-like
- Dark or visually complicated
- Aggressively animated
- Overly colourful

---

## 3. Colour Palette

The approved colour direction is based on navy, white, soft clinical blue-grey, and restrained status colours.

### 3.1 Core Colours

| Purpose | Colour | HEX | CSS token |
|---|---:|---|---|
| Primary Navy | Main brand colour, headings, primary buttons | `#003B5C` | `--color-primary-navy` |
| Deep Navy | High-emphasis text and dark UI areas | `#082F49` | `--color-deep-navy` |
| Dark Overlay Navy | Hero section gradients/overlays | `#0B2D4D` | `--color-dark-overlay-navy` |
| Clinical Teal | Links, active states, accents (supersedes the originally-planned "Clinical Blue" — teal was adopted consistently in build and is the real accent colour) | `#00AFC8` | `--color-clinical-teal` |
| Clinical Teal Hover | Hover state for teal accents | `#0891B2` | `--color-clinical-teal-hover` |
| Soft Blue Background | Clinical sections and card background | `#EAF6FA` | `--color-soft-blue` |
| Pale Clinical Blue | Highlight panels and information cards | `#F3FAFC` | `--color-pale-clinical-blue` |
| Warm Off-White | Page background alternative | `#FAF8F5` | `--color-warm-off-white` |
| Border Clinical | Card and section borders | `#D7E0E5` | `--color-border-clinical` |
| Text Main | Main body text | `#102A43` | `--color-text-main` |
| Text Secondary | Supporting copy (darkened from an earlier lighter value for WCAG AA contrast) | `#3D5166` | `--color-text-secondary` |
| Text Muted | Metadata and captions (darkened from an earlier lighter value for WCAG AA contrast) | `#4A6278` | `--color-text-muted` |

### 3.2 Status Colours

| Purpose | HEX | Use | CSS token |
|---|---:|---|---|
| Success | `#1F8A5B` | Confirmations, completed steps | `--color-status-success` |
| Success Background | `#EAF7F0` | Success alerts | `--color-status-success-bg` |
| Warning | `#B7791F` | Cautionary information | `--color-status-warning` |
| Warning Background | `#FFF8E6` | Warning panels | `--color-status-warning-bg` |
| Error / Urgent | `#B42318` | Safety-critical alerts | `--color-status-error` |
| Error Background | `#FFF5F5` | Urgent advice blocks | `--color-status-error-bg` |
| Information | `#0B5E7A` | Informational messages | `--color-status-info` |
| Information Background | `#EAF4F8` | Information panels | `--color-status-info-bg` |

### 3.3 Colour Usage Rules

Primary navy should be used for:

- Main headings
- Primary buttons
- Header branding
- Active navigation
- Important clinical labels

Red should be used sparingly and only for:

- Urgent advice
- Safety warnings
- Error states

Do not use red for routine marketing emphasis.

Avoid:

- Neon colours
- Heavy gradients
- Low-contrast grey text
- Dark full-page backgrounds
- Bright wellness or fitness-app colours

---

## 4. Typography

### 4.1 Font System

Approved typography direction:

| Use | Font |
|---|---|
| Headings | `Source Serif 4` |
| Body text | `Inter`, system sans-serif fallback |
| UI labels | `Inter`, system sans-serif fallback |
| Buttons | `Inter`, semibold |
| Metadata | `Inter`, regular or medium |

### 4.2 Font Stack

Recommended CSS font stacks:

```css
--font-heading: "Source Serif 4", Georgia, serif;
--font-body: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 4.3 Type Scale

| Element | Desktop | Mobile |
|---|---:|---:|
| Hero heading | 48–56px | 32–38px |
| Page heading | 40–48px | 30–36px |
| Section heading | 28–36px | 24–30px |
| Card heading | 20–24px | 18–22px |
| Body text | 18px | 16–18px |
| Small text | 14–15px | 14px |
| Metadata | 13–14px | 13–14px |
| Button text | 15–16px | 15–16px |

### 4.4 Typography Rules

- Minimum body text should be 16px.
- Preferred body text for patient-facing clinical content is 18px.
- Avoid thin font weights for important text.
- Use clear line spacing.
- Avoid long paragraphs.
- Use headings to break clinical information into readable sections.
- Avoid excessive capitalisation.
- Avoid decorative fonts.

### 4.5 Line Heights

| Element | Recommended Line Height |
|---|---:|
| Headings | 1.1–1.2 |
| Body text | 1.55–1.7 |
| Cards | 1.4–1.6 |
| Metadata | 1.3–1.5 |

---

## 5. Layout System

### 5.1 Page Widths

| Layout Type | Max Width |
|---|---:|
| Standard public website content | 1280px |
| Reading-focused clinical content | 760–900px |
| Hub pages | 1180–1280px |
| Future dashboard layouts | 1440px |

### 5.2 Grid

| Viewport | Grid |
|---|---|
| Desktop | 12-column grid |
| Tablet | 6-column grid |
| Mobile | 1-column layout |

### 5.3 Spacing

| Element | Spacing |
|---|---:|
| Desktop gutter | 24px |
| Mobile gutter | 16px |
| Section vertical spacing | 80–120px |
| Card internal padding | 16–24px |
| Dense dashboard card padding | 16–20px |
| Form field spacing | 16–24px |

### 5.4 Layout Rules

- Use generous whitespace.
- Avoid dense medical information blocks.
- Use cards for symptoms, conditions, treatments, injections and clinics.
- Keep clinical reading pages narrow enough for comfortable reading.
- Avoid cluttering the hero section.
- Keep the booking call-to-action visible but not aggressive.

---

## 6. Navigation System

### 6.1 Main Navigation

Approved main navigation:

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

### 6.2 Utility Navigation

Approved utility navigation:

```text
Urgent Advice
Patient Portal
Community
Contact
```

`Community` links to the patient discussion area (`/community`) — a separate,
non-clinical, self-registration feature, distinct from the invite-only future Patient
Portal (see `docs/sitemap.md` §3.12 and §5).

### 6.3 Desktop Navigation Rules

- Brand name appears on the left.
- Main navigation appears horizontally where space allows.
- Utility navigation should be smaller and less visually dominant.
- `Book Appointment` should be a clear primary button.
- Active page should be visually indicated.
- Navigation text must remain readable.

### 6.4 Mobile Navigation Rules

- Use a standard hamburger menu.
- Keep `Book Appointment` prominent.
- Avoid permanent side navigation on mobile.
- Clinical sidebars should collapse into:
  - a top-of-page anchor menu, or
  - horizontal scroll tabs, or
  - an expandable section menu.

### 6.5 Breadcrumbs

Breadcrumbs are required on clinical sub-pages.

Example:

```text
Home > Conditions > Meniscal Tear
```

Breadcrumbs should appear on:

- Symptom pages
- Condition pages
- Treatment pages
- Injection pages
- Education articles
- Clinic pages
- Legal pages where helpful

---

## 7. Component Rules

### 7.1 Buttons

#### Primary Button

Use for:

- Book Appointment
- Request Assessment
- Important clinical pathways

Style:

- Navy background
- White text
- Minimum height 48px
- 4px border radius
- Semibold text
- Clear hover and focus states

#### Secondary Button

Use for:

- Explore Treatments
- View Clinical Evidence
- Read More
- View Conditions

Style:

- Transparent or white background
- Navy border
- Navy text
- Minimum height 48px
- 4px border radius

### 7.2 Cards

Cards should use:

- White background
- 1px border using `#D9DADD`
- Minimal shadow or no shadow
- 16–24px padding
- Clear heading
- Short description
- Optional icon
- Clear link action

Avoid heavy shadows, glossy cards or excessive decoration.

### 7.3 Clinical Sidebar

Desktop clinical pages may use a fixed-width sidebar.

Recommended width:

```text
260–280px
```

Sidebar should include:

- Home
- Symptoms
- Conditions
- Treatments
- Injections
- Education
- Clinics
- Contact
- Book Appointment

Rules:

- Active section must be clearly highlighted.
- Sidebar must not be used as a permanent mobile layout.
- Sidebar must not make the page feel like a secure portal on public homepage.

### 7.4 Urgent Advice Banner

Use sparingly and carefully.

Approved wording:

```text
Urgent symptoms? Read urgent advice.
```

Supporting wording where needed:

```text
Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
```

Rules:

- Do not imply 24/7 clinic availability.
- Do not imply emergency care is provided by Lincolnshire Knee Clinic.
- Use a non-alarming red tint.
- Reserve strong red for genuinely safety-critical information.

### 7.5 Clinical Governance Block

Clinical pages should allow for governance metadata.

Standard fields:

```text
Reviewed by: [Clinical Reviewer]
Last reviewed: [Last Reviewed Date]
Clinical governance approved: [Yes/No]
Evidence base: [Guideline or source]
```

### 7.6 Medical Disclaimer Block

Clinical content pages should include a disclaimer block.

Purpose:

- Explain that content is educational.
- State that it does not replace medical advice.
- Direct urgent symptoms to urgent services.
- Encourage consultation for individual clinical decisions.

### 7.7 Booking Panel

The booking panel should include:

- Appointment type
- Face-to-face or video option where applicable
- Microsoft Bookings embed or link
- Contact option for booking support
- Urgent advice warning

Do not call Microsoft Bookings a patient portal.

Use:

```text
Online Booking
```

or:

```text
Microsoft Bookings
```

---

## 8. Page Template Rules

### 8.1 Home Page

The homepage should include:

- Clear consultant-led knee clinic positioning
- Common knee symptoms
- Conditions and treatments overview
- Injection treatment pathway
- Consultant-led care section
- Clinic locations
- Education and blog highlights
- Booking call-to-action
- Trust and governance cues

### 8.2 Symptoms Hub

The symptoms hub should include:

- Symptom cards
- Plain-language descriptions
- “Explore causes” or equivalent action
- No diagnostic-tool framing
- Clear medical disclaimer

Do not call it a symptom checker.

### 8.3 Condition Page

Condition pages should include:

- Condition overview
- Symptoms
- Causes
- Diagnosis
- Investigations
- Treatment options
- Urgent advice where relevant
- Clinical review metadata
- Evidence and resources
- Booking call-to-action

### 8.4 Treatment Page

Treatment pages should include:

- Treatment overview
- Suitability
- Benefits
- Risks and limitations
- Alternatives
- Procedure or treatment pathway
- Recovery
- Clinical governance metadata
- Booking call-to-action

### 8.5 Injection Page

Injection pages should include:

- Injection overview
- Who may benefit
- Risks and limitations
- How the injection is performed
- Expected duration of benefit
- Aftercare
- Comparison with other injections
- Evidence/resources
- Booking call-to-action

### 8.6 Clinics Page

Clinic pages should include:

- Clinic name
- Address placeholder or confirmed address
- Map placeholder
- Facilities
- Available services
- Parking/access information
- Booking call-to-action

### 8.7 Contact Page

Contact page should include:

- General enquiry form
- Booking support details
- Administrative contact information
- Urgent advice warning
- Clear statement not to use the form for urgent clinical problems

### 8.8 Legal Template

Legal pages should be formatted for readability.

Legal content must be marked as:

```text
Draft/template content requiring legal review before publication.
```

---

## 9. Accessibility Requirements

The design should meet WCAG 2.1 AA.

### 9.1 Contrast

- Normal text must meet at least 4.5:1 contrast.
- Large text must meet at least 3:1 contrast.
- Avoid pale grey body text.
- Do not rely on colour alone to communicate state.

### 9.2 Keyboard Accessibility

All interactive elements must have:

- Keyboard access
- Visible focus state
- Logical tab order
- 2px high-contrast focus ring

### 9.3 Forms

Forms must include:

- Persistent labels
- Clear error states
- Helpful validation messages
- Properly associated labels and inputs
- No placeholder-only labels

### 9.4 Motion

Avoid:

- Autoplaying videos
- Excessive animation
- Parallax effects
- Motion that could distract or impair readability

Respect reduced-motion preferences.

### 9.5 Zoom

Layouts must remain functional at:

```text
200% browser zoom
```

---

## 10. Mobile Behaviour

Mobile design must prioritise readability and booking access.

Rules:

- Use one-column layout.
- Stack cards vertically.
- Use full-width buttons where appropriate.
- Keep tap targets at least 48px.
- Collapse navigation into hamburger menu.
- Collapse sidebar into anchor navigation or tabs.
- Avoid horizontal scrolling except controlled tab menus.
- Maintain strong text contrast.
- Keep urgent advice clear but not alarming.

---

## 11. Image and Illustration Guidance

### 11.1 Consultant Imagery

Preferred imagery:

- Real consultant photography
- Clinical setting
- Professional but warm expression
- Natural lighting
- No exaggerated posing

### 11.2 Patient Imagery

Preferred imagery:

- Realistic patients
- Diverse adult age ranges
- 45–80 for arthritis and knee replacement content
- 20–40 for sports injury content
- Respectful and non-stigmatising

### 11.3 Medical Diagrams

Preferred diagrams:

- Clean knee anatomy illustrations
- Clear labels
- Clinically accurate
- Minimal visual clutter
- Suitable for patient education

### 11.4 Icons

Icon style:

- Thin-stroke
- Geometric
- Single-colour
- Navy or clinical blue
- Simple and recognisable

Avoid decorative or cartoon-like medical icons.

---

## 12. Governance and Placeholder Rules

All prototype content must clearly distinguish between approved content and placeholders.

### 12.1 Standard Placeholders

Use:

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
```

### 12.2 Clinical Claims

Do not use unsupported claims such as:

- Best
- Leading
- Guaranteed
- Most advanced
- Pain-free
- 100% successful
- Permanent cure

Avoid unsupported numbers such as:

- 15+ years
- 1000+ patients
- 98% success rate

unless verified and approved.

### 12.3 Evidence

Clinical pages should link to reputable sources where appropriate, including:

- NICE
- NHS
- Peer-reviewed evidence
- Relevant orthopaedic society guidance where appropriate

### 12.4 AI-Generated Content

AI may assist with drafting, but:

- AI must not publish directly.
- Clinical review is required.
- Evidence must be checked.
- Claims must be verified.
- Content must be appropriate for UK patients.
- No individualised diagnosis should be generated from public website content.

---

## 13. Future Patient Portal Compatibility

The design system must support a future secure patient portal.

### 13.1 Portal Visual Direction

The future portal should reuse:

- Same colour palette
- Same typography
- Same card system
- Same button system
- Same accessibility rules

It may introduce:

- Dashboard sidebar variant
- Secure status indicators
- Appointment cards
- Document cards
- Questionnaire cards
- Rehabilitation progress cards
- Secure message preview cards

### 13.2 Portal Components

Future portal components may include:

- Login screen
- Invite-only account activation screen
- MFA screen
- Patient dashboard
- Appointment list
- Document list
- Questionnaire module
- Outcome score module
- Rehabilitation tracking module
- Account settings
- Secure messaging, if approved

### 13.3 Portal Governance

The portal should not be implemented until security and governance are defined, including:

- UK GDPR
- Data Protection Act 2018
- Special category health data handling
- Multi-factor authentication
- Role-based access control
- Audit trails
- Consent
- Data retention
- Incident response
- Secure messaging policy if messaging is implemented

---

## 14. Final Approval Statement

The approved visual direction is:

```text
Calm clinical navy and white design
Consultant-led positioning
Readable serif headings
Accessible sans-serif body copy
Structured clinical navigation
Reusable card system
Clear booking pathway
Safe urgent advice handling
Governance metadata included
Future patient portal compatibility
```

This design system should be treated as the source of truth for visual interface design unless formally updated.
