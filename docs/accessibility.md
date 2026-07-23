# Accessibility Standards

## Lincolnshire Knee Clinic Digital Platform

**Version:** 1.0  
**Status:** Approved accessibility and usability framework  
**Primary use:** Public website, patient education and future patient portal  
**Repository:** `lincskneeclinic/Lincolnshire-Knee-Clinic`

---

## 1. Purpose

This document defines the accessibility, usability and inclusive design standards for Lincolnshire Knee Clinic.

The platform must be usable by patients with different levels of:

- Digital confidence
- Health literacy
- Vision
- Mobility
- Pain
- Anxiety
- Age-related cognitive load
- Device capability

The website should be particularly suitable for middle-aged and older patients, many of whom may access the site while experiencing pain, uncertainty or reduced mobility.

Accessibility is not optional. It is a core clinical safety and patient experience requirement.

---

## 2. Accessibility Standard

The Lincolnshire Knee Clinic platform should aim to meet:

```text
WCAG 2.1 AA
```

This applies to:

- Public website
- Patient education pages
- Booking pages
- Contact forms
- Legal and governance pages
- Future patient portal
- Future questionnaires
- Future rehabilitation tracking
- Future document access

Where feasible, future development should also consider newer accessibility guidance, but WCAG 2.1 AA is the minimum working standard for this project.

---

## 3. Core Accessibility Principles

The platform must be:

### 3.1 Perceivable

Patients must be able to perceive information clearly.

This means:

- Text must be readable
- Contrast must be strong
- Images must have appropriate alt text
- Information must not rely on colour alone
- Clinical diagrams must be clearly labelled
- Important warnings must be visually and textually clear

### 3.2 Operable

Patients must be able to use the website.

This means:

- Navigation works with keyboard
- Buttons are large enough
- Links are clear
- Forms are usable
- No essential interaction depends only on hover
- Mobile tap targets are large enough
- No inaccessible custom controls

### 3.3 Understandable

Patients must understand the content and interface.

This means:

- Plain English
- Clear headings
- Predictable navigation
- Consistent button labels
- Helpful form errors
- Clear next steps
- No misleading urgent advice

### 3.4 Robust

The platform should work reliably across:

- Modern browsers
- Mobile devices
- Tablets
- Desktop screens
- Screen readers
- Keyboard-only navigation
- Browser zoom up to 200%

---

## 4. Patient Population Considerations

Lincolnshire Knee Clinic must design for patients who may be:

- Aged 45–80 with arthritis or knee replacement concerns
- Younger adults with sports injuries
- Experiencing pain while using the website
- Anxious about diagnosis or surgery
- Using a mobile phone
- Less confident with technology
- Looking for fast reassurance and clear next steps
- Relatives or carers helping an older patient

Design must therefore prioritise:

- Readability
- Simplicity
- Clear navigation
- Large tap targets
- Calm language
- Predictable layout
- Clear booking route
- Safe urgent advice routing

---

## 5. Typography Accessibility

### 5.1 Minimum Text Sizes

Recommended text sizes:

| Element | Desktop | Mobile |
|---|---:|---:|
| Body text | 18px preferred | 16–18px |
| Small text | 14–15px minimum | 14px minimum |
| Button text | 15–16px | 15–16px |
| Form labels | 16px minimum | 16px minimum |
| Clinical metadata | 13–14px | 13–14px |
| Footer text | 14px minimum | 14px minimum |

### 5.2 Typography Rules

Use:

- Clear font weights
- Sufficient line spacing
- Short paragraphs
- Clear headings
- Consistent type hierarchy
- Strong contrast

Avoid:

- Very light font weights
- Tiny grey text
- Long unbroken paragraphs
- Decorative fonts
- All-caps body text
- Overly compressed line height
- Text placed over busy images

### 5.3 Line Height

Recommended line heights:

```text
Headings: 1.1–1.2
Body text: 1.55–1.7
Cards: 1.4–1.6
Metadata: 1.3–1.5
```

Clinical content should use generous line spacing to reduce reading fatigue.

---

## 6. Colour and Contrast

### 6.1 Contrast Requirements

Minimum contrast requirements:

```text
Normal text: 4.5:1
Large text: 3:1
Interactive components: 3:1 minimum against adjacent colours
Focus indicators: clearly visible
```

### 6.2 Colour Rules

Use:

- Navy text on white or pale backgrounds
- Strong contrast for body text
- Clear button contrast
- Restrained red for urgent or error states
- Blue/teal for information and active states

Avoid:

- Pale grey body text
- Low-contrast links
- Text over complex photography
- Red used for routine marketing emphasis
- Colour-only status indicators
- Bright fitness-app colours
- Excessive gradients

### 6.3 Urgent Advice Colour Use

Urgent advice should be visually clear but not alarmist.

Approved short wording:

```text
Urgent symptoms? Read urgent advice.
```

Supporting wording:

```text
Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
```

Urgent advice blocks may use a pale red tint, but must not imply that Lincolnshire Knee Clinic provides 24/7 emergency care.

---

## 7. Keyboard Accessibility

All interactive elements must be usable with a keyboard.

This includes:

- Header navigation
- Mobile menu
- Buttons
- Links
- Forms
- Accordions
- Tabs
- Sidebar navigation
- Booking links
- Footer navigation
- Future portal controls

### 7.1 Keyboard Rules

Users must be able to:

- Tab through interactive elements in a logical order
- See a clear focus indicator
- Activate buttons and links with keyboard
- Open and close menus
- Use accordions
- Navigate forms
- Submit forms
- Escape from modal dialogs if modals are used

### 7.2 Focus State

Focus indicators should:

- Be visible
- Be high contrast
- Use at least a 2px outline or equivalent
- Not be removed by CSS
- Work on dark and light backgrounds

Do not use:

```css
outline: none;
```

unless a clear replacement focus style is provided.

---

## 8. Navigation Accessibility

Navigation must be predictable and consistent.

### 8.1 Main Navigation

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

### 8.2 Navigation Rules

Navigation should:

- Use clear labels
- Keep labels consistent
- Indicate the current page
- Work on keyboard
- Work on mobile
- Avoid hidden essential links
- Avoid excessive menu depth
- Keep Book Appointment visible

### 8.3 Breadcrumbs

Breadcrumbs should be used on clinical sub-pages.

Example:

```text
Home > Conditions > Knee Arthritis
```

Breadcrumbs help:

- Orientation
- Navigation
- Screen reader context
- Search engine structure

### 8.4 Sidebar Navigation

Desktop clinical pages may use a clinical sidebar.

Rules:

- Sidebar must not replace main navigation completely.
- Active page must be clear.
- Sidebar links must be keyboard accessible.
- Sidebar should collapse on mobile.
- Sidebar should not create horizontal scrolling.

---

## 9. Mobile Accessibility

Many patients will use the website on a mobile phone.

### 9.1 Mobile Rules

Mobile layout must:

- Use one-column structure
- Keep text readable
- Stack cards vertically
- Use full-width buttons where helpful
- Keep tap targets at least 48px
- Avoid horizontal scrolling
- Use clear menu behaviour
- Keep booking access visible
- Keep urgent advice visible but not alarming

### 9.2 Mobile Navigation

Mobile navigation should:

- Use a standard hamburger menu
- Have clear open and close states
- Be keyboard and screen-reader accessible
- Keep menu items large enough to tap
- Keep Book Appointment prominent
- Avoid tiny icons without labels

### 9.3 Mobile Clinical Sidebar

Clinical sidebars should convert into:

- Top-of-page anchor links
- Expandable “On this page” menu
- Horizontal tabs only if accessible and not essential for navigation

A permanent desktop-style sidebar should not appear on narrow mobile screens.

---

## 10. Forms Accessibility

Forms are clinically and operationally important. They must be safe and easy to complete.

This applies to:

- Contact forms
- Booking support forms
- Future patient portal forms
- Future questionnaires
- Future outcome score forms
- Future rehabilitation tracking forms

### 10.1 Form Rules

Forms must include:

- Persistent labels
- Clear instructions
- Required field indicators
- Helpful error messages
- Logical field order
- Keyboard accessibility
- Clear submit button
- Confirmation after submission
- Safe urgent advice warning where relevant

Do not use placeholder text as the only label.

### 10.2 Error Messages

Error messages should:

- Explain what went wrong
- Explain how to fix it
- Be near the relevant field
- Be announced to screen readers where possible
- Avoid blame or technical language

Good:

```text
Please enter your email address in the format name@example.com.
```

Poor:

```text
Invalid input.
```

### 10.3 Contact Form Safety

The contact form must include clear safety wording:

```text
Please do not use this form for urgent medical problems. Lincolnshire Knee Clinic does not provide emergency medical care. For life-threatening symptoms call 999. For urgent non-life-threatening advice use NHS 111.
```

---

## 11. Buttons and Links

### 11.1 Button Rules

Buttons should:

- Be clearly labelled
- Have minimum 48px height where possible
- Use strong contrast
- Have visible hover and focus states
- Use consistent wording
- Avoid ambiguous labels

Preferred booking label:

```text
Book Appointment
```

Avoid mixing with:

```text
Book Consultation
Schedule Visit
Request Appointment
```

unless there is a specific operational reason.

### 11.2 Link Rules

Links should:

- Be visually identifiable
- Use meaningful text
- Avoid “click here”
- Indicate external links where appropriate
- Have sufficient contrast
- Be keyboard accessible

Good:

```text
Read urgent advice
```

Poor:

```text
Click here
```

---

## 12. Images and Alt Text

Images must support understanding and not create accessibility barriers.

### 12.1 Alt Text Rules

Use alt text for images that communicate information.

Examples:

```text
Diagram showing the main compartments of the knee joint.
```

```text
Illustration showing a meniscus tear inside the knee.
```

Decorative images may use empty alt text if they do not add meaning.

### 12.2 Clinical Diagram Rules

Clinical diagrams should:

- Be clearly labelled
- Avoid excessive complexity
- Include text explanation nearby
- Not rely on colour alone
- Be understandable to patients

### 12.3 Logo Alt Text

Logo alt text should be:

```text
Lincolnshire Knee Clinic
```

Avoid:

```text
LKC K Logo transparent
```

for public-facing alt text.

---

## 13. Content Accessibility

Accessible design requires accessible writing.

### 13.1 Writing Rules

Use:

- Plain English
- Short sentences
- Short paragraphs
- Descriptive headings
- Bullet points where useful
- Clear definitions for medical terms
- Practical next steps

Avoid:

- Dense medical jargon
- Long academic paragraphs
- Unexplained abbreviations
- Overly technical surgical descriptions early in the page
- Fear-based language

### 13.2 Headings

Headings should:

- Be descriptive
- Follow logical order
- Help scanning
- Not skip levels for visual styling

Use:

```text
H1: Page title
H2: Main sections
H3: Subsections
```

### 13.3 Medical Terms

When medical terms are necessary, explain them.

Good:

```text
The meniscus is a shock-absorbing cartilage structure inside the knee.
```

Poor:

```text
Meniscal fibrocartilage pathology is a common source of mechanical symptoms.
```

---

## 14. Cognitive Usability

Patients may be anxious, in pain or uncertain.

Pages should reduce cognitive load.

### 14.1 Cognitive Load Rules

Use:

- Clear page hierarchy
- Repeated page patterns
- Predictable navigation
- Clear calls to action
- Progressive detail
- Summaries at the top
- FAQs for common concerns

Avoid:

- Too many competing CTAs
- Large blocks of dense text
- Overuse of clinical terminology
- Excessive visual decoration
- Complex interactive elements
- Long forms without explanation

### 14.2 Patient Decision Support

Content should help patients understand:

- What the symptom or condition may involve
- What assessment may be needed
- What treatment options may exist
- When urgent advice is needed
- How to book an appointment

Do not make patients infer critical safety information.

---

## 15. Video and Media Accessibility

If video content is used in the future, it must be accessible.

### 15.1 Video Rules

Videos should include:

- Captions
- Transcript where possible
- Clear title
- No autoplay
- Controls visible
- No flashing content
- Patient-friendly explanation

Avoid:

- Autoplaying video backgrounds
- Essential information only in video
- Videos without captions
- Motion-heavy animations

---

## 16. Future Patient Portal Accessibility

The future patient portal must meet the same or higher accessibility standard.

Portal accessibility is especially important because patients may need to complete health-related tasks.

### 16.1 Portal Tasks

Future portal tasks may include:

- Login
- Account activation
- MFA
- Viewing appointments
- Viewing documents
- Completing questionnaires
- Completing outcome scores
- Tracking rehabilitation
- Reading messages
- Updating details

### 16.2 Portal Rules

The portal must:

- Use clear instructions
- Avoid complex workflows
- Show progress where forms are multi-step
- Save progress where feasible
- Provide clear error messages
- Make documents accessible
- Ensure questionnaires work by keyboard
- Avoid timeouts without warning
- Support older patients and carers where appropriate

### 16.3 Portal Messaging

If secure messaging is implemented, messages must be clear about:

- Expected response time
- Urgent care limitations
- Appropriate use
- Escalation route for urgent symptoms

The portal must not imply emergency monitoring.

---

## 17. Performance and Accessibility

Slow websites are less accessible.

Performance should support:

- Fast loading
- Mobile usability
- Reduced frustration
- Lower data use
- Better access on older devices

### 17.1 Performance Rules

Use:

- Optimised images
- Minimal unnecessary JavaScript
- Efficient fonts
- Lazy loading where appropriate
- Clean component structure

Avoid:

- Large uncompressed images
- Excessive animations
- Heavy third-party scripts
- Complex pages that load slowly on mobile

---

## 18. Testing Requirements

Accessibility should be checked throughout design and development.

### 18.1 Manual Testing

Manual checks should include:

```text
Keyboard-only navigation
Tab order
Focus visibility
Mobile usability
Browser zoom at 200%
Form completion
Screen reader spot checks
Colour contrast checks
Readable text sizes
No horizontal scrolling
```

### 18.2 Automated Testing

Automated tools may assist with:

```text
Contrast checks
Missing alt text
HTML landmarks
Form labels
ARIA issues
Heading structure
Basic WCAG failures
```

Automated testing does not replace manual review.

### 18.3 Patient Usability Testing

Where possible, test with users similar to the target audience:

- Older patients
- Patients using mobile phones
- Patients with low digital confidence
- Patients seeking booking information
- Patients trying to understand a knee condition

---

## 19. Development Requirements

Developers must implement accessibility at code level.

### 19.1 HTML Structure

Use semantic HTML:

```text
header
nav
main
section
article
aside
footer
button
form
label
input
textarea
```

Avoid using generic `div` elements where semantic elements are appropriate.

### 19.2 ARIA

Use ARIA only where necessary.

Rules:

- Prefer semantic HTML first.
- Do not use ARIA to compensate for poor structure.
- Ensure ARIA labels are accurate.
- Test custom components with keyboard and screen readers.

### 19.3 Landmarks

Pages should include clear landmarks:

```text
Header
Main navigation
Main content
Complementary sidebar where used
Footer
```

### 19.4 Skip Link

The website should include a visible-on-focus skip link:

```text
Skip to main content
```

This improves keyboard navigation.

---

## 20. Common Accessibility Failures to Avoid

Avoid:

- Tiny grey text
- Low-contrast buttons
- Placeholder-only form labels
- Buttons without accessible names
- Links that only say “click here”
- Missing focus states
- Non-keyboard-accessible menus
- Modal dialogs that trap users incorrectly
- Autoplay video
- Content hidden from screen readers incorrectly
- Images of text
- Important information conveyed only by colour
- Unlabelled icons
- Permanent mobile sidebars
- Overly complex forms

---

## 21. Relationship to Other Documents

This accessibility document works alongside:

```text
docs/project-vision.md
docs/sitemap.md
docs/design-system.md
docs/branding.md
docs/content-guidelines.md
docs/seo-strategy.md
```

Accessibility rules must be respected across:

- Visual design
- Content structure
- SEO
- Branding
- Booking workflows
- Future patient portal development

If there is a conflict between visual design and accessibility, accessibility takes priority.

---

## 22. Final Accessibility Statement

Lincolnshire Knee Clinic must be designed for real patients, not ideal users.

The platform should be readable, calm, predictable and safe for people who may be older, anxious, in pain, using mobile phones or unfamiliar with digital healthcare systems.

Accessibility is part of clinical quality.

The website and future patient portal should help patients find information, understand their options and take the right next step without unnecessary friction or confusion.
