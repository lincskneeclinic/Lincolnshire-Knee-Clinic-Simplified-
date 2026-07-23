# Integration Architecture

## Lincolnshire Knee Clinic Digital Platform

**Version:** 1.0  
**Status:** Approved integration and workflow framework  
**Primary use:** Public website, development workflow, future patient portal planning  
**Repository:** `lincskneeclinic/Lincolnshire-Knee-Clinic`

---

## 1. Purpose

This document defines the integration architecture and workflow rules for the Lincolnshire Knee Clinic digital platform.

The aim is to keep the project structured, maintainable and future-ready while avoiding unnecessary complexity during the first phase.

This document covers:

- Repository structure
- GitHub workflow
- VS Code workflow
- Next.js application structure
- Microsoft 365 role
- Microsoft Bookings integration
- Microsoft Teams integration
- Supabase future backend role
- Hosting and deployment direction
- AI design and development tools
- Data flow principles
- Patient portal integration planning
- Governance and safety rules

---

## 2. Core Architecture Principle

The platform should be built in phases.

Phase 1 should prioritise:

- Public website
- Clinical content
- Education and blog structure
- Booking pathway
- Clinic information
- Contact route
- Legal/governance pages
- Microsoft Bookings integration
- Safe urgent advice routing

Phase 1 should avoid premature implementation of:

- Full patient portal
- Patient medical record storage
- Secure messaging
- Patient document access
- Outcome score capture
- Rehabilitation tracking
- Custom appointment system
- Open patient registration

The architecture must allow those features to be added later without rebuilding the public website.

---

## 3. Source of Truth

GitHub is the source of truth for:

- Documentation
- Code
- Design specifications
- Content templates
- Technical decisions
- Integration rules
- AI development prompts
- Future deployment history

Approved repository:

```text
lincskneeclinic/Lincolnshire-Knee-Clinic
```

Primary local development path:

```text
C:\Users\Ricardo\Projects\Lincolnshire-Knee-Clinic
```

All major project decisions should be documented in `/docs`.

---

## 4. Repository Structure

Approved repository structure:

```text
/
├── docs/
├── web/
├── content/
├── assets/
├── automation/
├── supabase/
├── scripts/
├── .gitignore
└── README.md
```

### 4.1 `/docs`

Purpose:

```text
Project governance, architecture, design, content, SEO, accessibility and integration documentation.
```

Current approved files:

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

Rules:

- Documentation should be kept in Markdown.
- Documentation should be updated when project decisions change.
- AI tools should be instructed to respect documentation in `/docs`.

---

### 4.2 `/web`

Purpose:

```text
Next.js public website and future frontend application code.
```

Expected technology:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Expected responsibilities:

- Public website pages
- Shared layouts
- UI components
- Styling
- Navigation
- Booking integration
- Static content rendering
- Future portal frontend modules where appropriate

Rules:

- Keep public website code maintainable and modular.
- Avoid mixing experimental portal features into public production pages.
- Reusable components should follow `docs/design-system.md`.

---

### 4.3 `/content`

Purpose:

```text
Structured content files, drafts, templates and future content source data.
```

Possible future uses:

- Markdown or MDX content
- Condition page drafts
- Treatment page drafts
- Injection page drafts
- Education article drafts
- FAQ content
- Content templates
- AI-generated drafts awaiting review

Rules:

- Draft clinical content must not be treated as approved.
- Clinical content must follow `docs/content-guidelines.md`.
- AI-generated content should be clearly marked as draft until reviewed.

---

### 4.4 `/assets`

Purpose:

```text
Static brand and media assets.
```

Recommended structure:

```text
assets/
└── brand/
    └── lkc-logo-k-transparent.png
```

Possible future folders:

```text
assets/images/
assets/diagrams/
assets/icons/
assets/documents/
```

Rules:

- Use descriptive file names.
- Optimise images before production use.
- Do not use copyrighted or unlicensed imagery.
- Do not use misleading AI-generated clinical imagery in final production.

---

### 4.5 `/automation`

Purpose:

```text
Automation workflows, scripts and process definitions.
```

Possible future uses:

- Content publishing workflow notes
- GitHub Actions workflow documentation
- Power Automate process descriptions
- AI content review workflows
- Deployment process notes
- Reminder or review workflow documentation

Rules:

- Automation must not publish clinical content without review.
- Automation must not send patient-identifiable information to unauthorised systems.
- Automation must respect data protection requirements.

---

### 4.6 `/supabase`

Purpose:

```text
Future backend configuration, database schema, security policies and patient portal planning.
```

Possible future uses:

- Database schema
- Row-level security policies
- Authentication configuration notes
- Storage bucket planning
- Edge functions
- Audit log planning
- Migration files

Rules:

- Supabase should not be used for patient data until governance is defined.
- Future patient data must be treated as special category health data.
- Row-level security must be mandatory for patient-facing data.
- Patient portal implementation must not proceed without security review.

---

### 4.7 `/scripts`

Purpose:

```text
Utility scripts for development, content processing, validation or deployment support.
```

Rules:

- Scripts must be documented.
- Scripts must not contain secrets.
- Scripts must not process patient-identifiable data unless properly governed.
- Scripts should be reviewed before use in production workflows.

---

## 5. Development Workflow

### 5.1 Local Development

Primary local development should happen in:

```text
C:\Users\Ricardo\Projects\Lincolnshire-Knee-Clinic
```

Development editor:

```text
VS Code
```

Recommended local workflow:

```text
1. Pull latest changes from GitHub
2. Make changes locally
3. Test locally
4. Commit changes
5. Push to GitHub
6. Review in GitHub
7. Deploy through approved hosting workflow
```

Common commands:

```bash
git pull origin main
git status
git add .
git commit -m "Commit message"
git push origin main
```

### 5.2 GitHub Web Editing

GitHub web editing may be used for:

- Markdown documentation
- Simple content updates
- Small corrections

GitHub web editing should not usually be used for:

- Large code changes
- Next.js application development
- Complex file moves
- Dependency changes

### 5.3 Branching Strategy

During early setup, direct commits to `main` are acceptable.

As the project matures, use branches for:

- New features
- Design changes
- Major content changes
- Portal development
- Experimental integrations

Suggested branch names:

```text
feature/homepage
feature/booking-integration
content/knee-arthritis-page
docs/update-design-system
portal/auth-planning
```

---

## 6. Commit Rules

Commit messages should be clear and specific.

Good examples:

```text
Add project vision document
Add approved sitemap and platform architecture
Add design system specification for UI consistency
Add branding and tone of voice guidelines
Add content governance and SEO structure guidelines
Add SEO strategy and search optimisation framework
Add accessibility standards and usability constraints
Add system integration architecture and tool workflow definitions
```

Avoid vague commit messages:

```text
Update stuff
Changes
Fix
New file
Website things
```

---

## 7. Public Website Integration

The public website should initially integrate with external systems rather than building complex custom backend functionality.

Phase 1 public website integrations:

```text
Microsoft Bookings
Outlook
Microsoft Teams
Email/contact route
Hosting provider
Analytics/search tools when configured
```

Phase 1 public website should include:

- Static public pages
- Booking button/link/embed
- Contact form or contact details
- Urgent advice page
- Legal/governance pages
- Clinical content pages
- Education and blog structure

---

## 8. Microsoft 365 Integration

Microsoft 365 should support operational workflows in Phase 1.

### 8.1 Microsoft Bookings

Role:

```text
Appointment scheduling for private consultations, injection consultations and video consultations where available.
```

Use for:

- Booking slots
- Calendar availability
- Appointment confirmation
- Basic reminders
- Administrative booking workflow

Rules:

- Do not call Microsoft Bookings a patient portal.
- Use the wording `Online Booking` or `Microsoft Bookings`.
- Booking pages should include urgent advice warning.
- Booking must not imply emergency access.

### 8.2 Outlook

Role:

```text
Email and calendar communication.
```

Use for:

- Clinic email workflow
- Calendar coordination
- Administrative communication
- Booking notifications

Rules:

- Avoid sending sensitive patient information unless appropriate controls are in place.
- Use professional clinic email accounts where possible.
- Avoid using personal email for clinic operations.

### 8.3 Microsoft Teams

Role:

```text
Video consultations where offered.
```

Use for:

- Video appointment links
- Remote consultations
- Administrative coordination

Rules:

- Only offer video consultation if operationally supported.
- Patients should receive clear instructions before video consultation.
- Video appointments must not be used as emergency access.

### 8.4 SharePoint and OneDrive

Role:

```text
Internal document storage and operational file management.
```

Possible uses:

- Internal clinic documents
- Draft policies
- Administrative templates
- Non-public project files

Rules:

- Do not treat SharePoint as the long-term patient portal database.
- Avoid storing patient data without appropriate governance.
- Permissions must be controlled.

### 8.5 Power Automate

Role:

```text
Administrative workflow automation.
```

Possible uses:

- Booking notifications
- Internal reminders
- Form-to-email workflows
- Non-clinical administrative process automation

Rules:

- Automations must not create unsafe clinical workflows.
- Automations must not publish clinical content automatically.
- Automations involving patient data require data protection review.

---

## 9. Supabase Integration

Supabase is reserved for future backend and patient portal functionality.

Possible future uses:

```text
Authentication
Database
Storage
Role-based access control
Row-level security
Patient portal data
Outcome scores
Questionnaires
Document access
Audit logs
Administrative dashboard
```

### 9.1 Supabase Should Not Be Used Prematurely

Do not use Supabase in Phase 1 for:

- Full patient portal
- Patient records
- Secure messaging
- Patient documents
- Outcome scores
- Medical questionnaires

unless governance, privacy, security and operational workflows are ready.

### 9.2 Future Supabase Requirements

Before patient data is stored, the following must be defined:

```text
Data model
User roles
Authentication rules
Multi-factor authentication
Row-level security
Audit logging
Data retention
Consent
Privacy notice
Incident response
Backup strategy
Access control policy
Secure messaging policy if relevant
```

### 9.3 User Roles

Future roles may include:

```text
Patient
Consultant
Clinic administrator
Clinical reviewer
Super administrator
```

Access must be least-privilege.

---

## 10. Patient Portal Integration

The patient portal is future architecture, not Phase 1 production scope.

Future portal domain:

```text
portal.lincolnshirekneeclinic.co.uk
```

Future portal modules may include:

```text
Login
Invite-only account activation
MFA
Dashboard
Appointments
Documents
Questionnaires
Outcome scores
Rehabilitation tracking
Account settings
Secure messaging if approved
```

### 10.1 Portal Registration Rule

Patient portal access should use:

```text
Invite-only account activation
```

Avoid:

```text
Open public self-registration
```

### 10.2 Secure Messaging Rule

Secure messaging should be future-only unless fully governed.

Before secure messaging is implemented, define:

```text
Staffing responsibility
Expected response times
Clinical escalation process
Consent
Data retention
Audit trail
Medico-legal risk management
Urgent care limitations
```

Portal messaging must not imply emergency monitoring.

---

## 11. Hosting and Deployment

The public website should be deployed through a reliable hosting environment.

Possible hosting options:

```text
Hostinger
Vercel
Other Next.js-compatible hosting provider
```

### 11.1 Hosting Requirements

Hosting should support:

```text
Next.js application
Custom domain
HTTPS
Environment variables
Build logs
Rollback or redeployment
Reasonable performance
Reliable uptime
Basic security controls
```

### 11.2 Domain Strategy

Primary domain:

```text
lincolnshirekneeclinic.co.uk
```

Secondary domain:

```text
lincolnshirekneeclinic.com
```

Recommended rule:

```text
.com redirects to .co.uk
```

Future portal subdomain:

```text
portal.lincolnshirekneeclinic.co.uk
```

### 11.3 Deployment Rules

Production deployment should not occur until:

```text
Design direction approved
Core content reviewed
Legal/governance pages reviewed
Booking route confirmed
Urgent advice wording confirmed
Basic accessibility checked
Mobile layout checked
SEO metadata added
```

---

## 12. Analytics and Search Tools

Future public website should use analytics and search visibility tools.

Possible tools:

```text
Google Search Console
Google Analytics or privacy-conscious alternative
Microsoft Clarity if approved
SEO auditing tools
Core Web Vitals monitoring
```

### 12.1 Analytics Rules

Analytics must:

- Respect privacy requirements
- Be disclosed in privacy/cookie policy where required
- Avoid unnecessary tracking
- Avoid collecting clinical information through analytics events
- Avoid sending patient-identifiable data to analytics platforms

### 12.2 Search Console

Search Console should monitor:

```text
Indexing
Search queries
Click-through rates
Core Web Vitals
Mobile usability
Crawl errors
Sitemap submission
Structured data issues
```

---

## 13. AI Tool Integration

AI tools may support design, content and development but must be governed.

Potential AI tools:

```text
Google Stitch
Google AI Studio / Gemini
GitHub Copilot
Codex
Claude Code
Antigravity
ChatGPT
```

### 13.1 AI Design Tools

Use for:

- Wireframes
- Visual design options
- Page template concepts
- Component exploration
- Design system drafts

Rules:

- AI design output must be reviewed.
- Fake clinician names must be removed.
- Fake clinic details must be removed.
- Final design must follow `docs/design-system.md`.

### 13.2 AI Content Tools

Use for:

- Draft outlines
- Patient-friendly rewrites
- FAQ drafts
- SEO metadata drafts
- Article structures
- Internal documentation

Rules:

- AI content is draft only.
- Clinical review is mandatory.
- AI must not invent evidence.
- AI must not publish directly.
- AI must not create fake testimonials.
- AI must not create fake clinician credentials.

### 13.3 AI Development Tools

Use for:

- Code suggestions
- Component generation
- Refactoring
- Test suggestions
- Documentation support

Rules:

- AI-generated code must be reviewed.
- Code must follow project architecture.
- Code must not introduce patient data workflows without approval.
- Code must not add unnecessary dependencies.
- Code must respect accessibility requirements.

---

## 14. Data Flow Principles

### 14.1 Phase 1 Data Flow

Phase 1 should keep data flow simple.

Expected Phase 1 flow:

```text
Patient visits website
Patient reads content
Patient clicks Book Appointment
Microsoft Bookings handles booking
Outlook/Teams support appointment workflow
Clinic administration follows up as needed
```

Contact form flow, if implemented:

```text
Patient submits general enquiry
Enquiry sent to approved clinic email/admin workflow
Urgent advice warning displayed before submission
Clinic responds within stated timeframe
```

### 14.2 Future Portal Data Flow

Future portal flow may include:

```text
Clinic invites patient
Patient activates account
Patient logs in with MFA
Patient views appointments/documents
Patient completes questionnaire/outcome score
Data stored securely in Supabase
Clinician/admin reviews authorised data
Audit logs record access and changes
```

This must not be implemented until governance is ready.

---

## 15. Security Principles

Security must be designed into future clinical workflows.

### 15.1 Public Website Security

Public website should include:

```text
HTTPS
Secure form handling
Spam protection
No exposed secrets
Environment variables for sensitive config
Dependency updates
Basic monitoring
Controlled admin access
```

### 15.2 Future Portal Security

Future portal must include:

```text
MFA
Role-based access control
Row-level security
Audit logs
Secure storage
Data encryption in transit
Least-privilege access
Strong password policy
Session management
Incident response process
```

### 15.3 Secrets Management

Never commit secrets to GitHub.

Do not commit:

```text
API keys
Database passwords
Supabase service role keys
OAuth secrets
Email credentials
Private keys
Patient-identifiable exports
```

Use environment variables for secrets.

---

## 16. Data Protection Principles

Healthcare data must be treated as sensitive.

Future patient data workflows must consider:

```text
UK GDPR
Data Protection Act 2018
Special category health data
Data minimisation
Consent
Retention
Access control
Auditability
Privacy information
Incident response
Data processor agreements where required
```

### 16.1 Public Website Forms

Public forms should collect the minimum necessary information.

Avoid encouraging patients to submit:

- Detailed medical histories
- Urgent clinical problems
- Highly sensitive information
- Images or documents unless governed

### 16.2 Future Patient Data

Patient-identifiable data should only be stored after:

- Privacy notice is approved
- Security model is approved
- Access control is defined
- Data retention is defined
- Appropriate agreements are in place
- Clinical workflow is operationally supported

---

## 17. Integration With Documentation

All tools and developers must respect the `/docs` folder.

Relevant source documents:

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

### 17.1 Documentation Priority

If there is a conflict:

1. Patient safety and legal obligations take priority.
2. Clinical governance takes priority.
3. Accessibility takes priority over visual preference.
4. Approved sitemap takes priority over ad hoc page creation.
5. Approved design system takes priority over inconsistent design.
6. Branding and tone rules take priority over marketing exaggeration.

---

## 18. Future Integration Roadmap

### Phase 1 — Public Website Integrations

```text
GitHub
VS Code
Next.js
Microsoft Bookings
Outlook
Microsoft Teams
Hosting provider
Basic analytics/search tools
```

### Phase 2 — Content and SEO Integrations

```text
Structured content workflow
Education/blog content system
SEO metadata
XML sitemap
Search Console
Analytics
Internal linking
Content review workflow
```

### Phase 3 — Portal Architecture

```text
Supabase planning
Authentication model
Database schema
Role model
Security planning
Patient journey mapping
Admin workflow mapping
```

### Phase 4 — Secure Portal Implementation

```text
Supabase authentication
MFA
Patient dashboard
Appointment data
Document access
Questionnaires
Outcome scores
Rehabilitation tracking
Audit logs
Admin dashboard
Secure messaging only if approved
```

---

## 19. Implementation Guardrails

Do not implement the following without explicit approval:

```text
Patient portal
Patient self-registration
Patient document upload
Secure messaging
Medical record storage
Outcome score collection
Clinical triage tool
Symptom checker
AI diagnosis tool
Automated clinical advice
Patient data analytics
Unreviewed legal/privacy text
```

Do not publish:

```text
Fake clinician names
Fake clinic addresses
Fake phone numbers
Fake email addresses
Unsupported clinical statistics
Unsupported claims of superiority
Fake testimonials
Unverified clinic locations
```

---

## 20. Recommended Workflow for New Features

Before adding a new feature:

```text
1. Check project-vision.md
2. Check sitemap.md
3. Check design-system.md
4. Check branding.md
5. Check content-guidelines.md
6. Check seo-strategy.md
7. Check accessibility.md
8. Check integration.md
9. Confirm governance requirements
10. Create feature plan
11. Build in controlled branch where appropriate
12. Review before production
```

---

## 21. Final Integration Statement

Lincolnshire Knee Clinic should be built as a phased, clinically governed digital platform.

The first phase should remain simple and robust:

```text
Public website
Patient education
Clear booking route
Safe urgent advice
Clinical governance
Accessible design
```

Future integrations should be added only when operationally, clinically and legally ready.

The architecture should support growth without compromising patient safety, accessibility, privacy or clinical credibility.
