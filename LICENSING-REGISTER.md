# Lincolnshire Knee Clinic — Asset Licensing Register

This document is the human-readable version of `web/data/licensingRegister.ts`.

**Last updated:** 2026-07-12  
**Maintained by:** Website administrator  

> [!IMPORTANT]
> No asset may be published on the website unless its licence and clinical review status are both explicitly confirmed as approved. Do not assume any asset is reusable from an internet search result.

---

## Licensing Rules

1. Every third-party asset must have its licence individually verified.
2. Commercial use permission must be explicitly confirmed before use.
3. Modification permission must be confirmed before adaptation.
4. Attribution text must be displayed on-page where required.
5. Consultant-supplied imaging must have explicit written permission for website publication.
6. All imaging must be fully anonymised before delivery.
7. The publication status must be updated in `licensingRegister.ts` when a licence is verified.

---

## Open-Licensed Candidates

### Servier Medical Art

| Field | Detail |
|---|---|
| **Creator** | Servier Medical Art |
| **Source** | https://smart.servier.com/ |
| **Licence** | Creative Commons Attribution 4.0 International (CC BY 4.0) |
| **Licence URL** | https://creativecommons.org/licenses/by/4.0/ |
| **Commercial Use** | ✅ Permitted |
| **Modification** | ✅ Permitted (with attribution) |
| **Attribution Required** | ✅ Yes |
| **Attribution Text** | `Image: Servier Medical Art, licensed under CC BY 4.0 (https://smart.servier.com/). Adapted for Lincolnshire Knee Clinic.` |

**Candidate files (not yet retrieved or approved):**

| File | Description | Status |
|---|---|---|
| `knee-joint-sagittal-servier.png` | Sagittal knee anatomy | Proposed |
| `knee-anatomy-lateral-servier.png` | Lateral knee anatomy | Proposed |
| `meniscus-top-view-servier.png` | Top-down meniscus view | Proposed |
| `tendon-patellar-servier.png` | Patellar tendon anatomy | Proposed |
| `cartilage-anatomy-servier.png` | Articular cartilage anatomy | Proposed |

> [!NOTE]
> Servier Medical Art illustrations are line-art style on white backgrounds. Their visual style differs from bespoke clinical illustration. Each candidate file must be reviewed for clinical accuracy and visual consistency before use. Attribution text is mandatory on any published page using these files.

---

### Wikimedia Commons

> [!WARNING]
> Wikimedia Commons hosts files under many different licences (CC BY, CC BY-SA, CC0, PD, and others). Each file must be **individually checked** on its own file page. The licence on the search result may not match the actual file page.

| File | Source | Licence | Status |
|---|---|---|---|
| `knee-anatomy-gray-wikimedia.png` | https://commons.wikimedia.org/wiki/File:Gray347.png | Public Domain (pre-1924) — verify | Awaiting licence check |

> [!CAUTION]
> Before using any Wikimedia file: (1) open the actual file page, (2) confirm the licence, (3) confirm whether it has been modified (modified files may carry a different licence), (4) record the full attribution, (5) confirm commercial use is permitted.

---

## Consultant-Supplied Imaging

All X-ray, MRI, and ultrasound examples must be supplied directly by Mr R J Pacheco.

### Requirements Checklist

Before any imaging asset can be published:

- [ ] Image physically supplied by consultant
- [ ] Patient identifiers removed (name, DOB, NHS number, accession number)
- [ ] Burned-in text checked and cleared
- [ ] DICOM metadata stripped before file delivery
- [ ] Institution name removed
- [ ] Explicit written permission granted for website publication
- [ ] Clinical review completed
- [ ] `anonymisationConfirmed: true` set in `imagingAssets.ts`
- [ ] `publicationApprovalConfirmed: true` set in `imagingAssets.ts`
- [ ] `status: "Published"` set in `imagingAssets.ts`

### Imaging Register

| ID | Modality | View | Educational Finding | Status |
|---|---|---|---|---|
| `imaging-knee-arthritis-ap-xray` | X-ray | AP weight-bearing | Medial joint space narrowing | Published |
| `imaging-acl-injury-mri-sagittal` | MRI | Sagittal T2 | ACL disruption | Published |
| `imaging-meniscal-tear-mri-coronal` | MRI | Coronal PD fat-sat | Posterior horn meniscal tear | Published |
| `imaging-cartilage-injury-mri` | MRI | Axial T2 fat-sat | Full-thickness cartilage defect | Published |
| `imaging-ultrasound-injection-concept` | Ultrasound | Longitudinal | Needle visualisation | Published |
| `imaging-tkr-postop-xray` | X-ray | AP + Lateral post-op | TKR component position | Published |

---

## Internal Assets

| File | Creator | Licence | Status |
|---|---|---|---|
| `knee-anatomy-schematic.svg` | Lincolnshire Knee Clinic (hand-coded SVG) | Internal — All rights reserved | Awaiting clinical review |

---

## Approval Workflow

```
Proposed
  → Sourced
  → Awaiting licence check
  → Awaiting clinical review
  → Approved
  → Published
      ↓
   Rejected
```

No asset moves to "Published" without both licence approval and clinical review confirmation.
