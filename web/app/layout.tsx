import type { Metadata, Viewport } from "next";
// Self-hosted via @fontsource instead of next/font/google — next/font/google
// (via Turbopack) fetches font files from fonts.gstatic.com at build time,
// which failed with 404s in Hostinger's build environment and broke every
// deploy. @fontsource ships the actual font files as npm package assets, so
// the build only ever needs npm registry access (already required to install
// any dependency) and never reaches out to Google's font CDN at all.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/700.css";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";
import { SITE_URL } from "@/lib/site";
import { clinicLocations } from "@/data/clinics";

// Bounds how long a static page's cached HTML (and the CDN's copy of it) can
// possibly stay stale after a deploy. Without this, Next.js's default for a
// fully static page is "cache forever" (Cache-Control: s-maxage=31536000 —
// one year), which let a CDN edge cache keep serving a page referencing a
// previous build's now-deleted JS/CSS chunk hashes for hours after multiple
// newer deploys had already shipped, breaking the page entirely for whoever
// hit that cached copy. This does not retroactively fix an already-cached
// stale response (that still needs an explicit CDN purge) — it only bounds
// how long a *future* staleness window can last.
export const revalidate = 3600;

const DEFAULT_TITLE = "Lincolnshire Knee Clinic - Consultant-Led Knee Care";
const DEFAULT_DESCRIPTION =
  "Specialist assessment and treatment for knee pain, knee arthritis, meniscus tears, sports knee injuries, knee injections, and knee replacement concerns in Lincolnshire.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Note: intentionally a plain string, not a title.template object — nearly every
  // page in the site already sets its own full title ending in
  // "| Lincolnshire Knee Clinic", and title.template augments (suffixes) any child
  // string title, which would double up the brand name across the whole site.
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: "Lincolnshire Knee Clinic",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: `${SITE_URL}/brand/lkc-logo-k-transparent.png`,
        width: 800,
        height: 800,
        alt: "Lincolnshire Knee Clinic logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Sitewide MedicalClinic/Organization schema — moved here from the homepage so
// every page (not just "/") carries business structured data for search engines.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      name: "Lincolnshire Knee Clinic",
      url: SITE_URL,
      telephone: "07770 473437",
      medicalSpecialty: "Orthopedic",
      areaServed: "Lincolnshire",
      founder: {
        "@type": "Person",
        name: "Mr Ricardo J Pacheco",
        jobTitle: "Consultant Trauma & Orthopaedic Surgeon",
      },
      department: clinicLocations.map((clinic) => ({
        "@type": "MedicalClinic",
        name: clinic.name,
        address: clinic.address,
        telephone: clinic.phone,
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-text-primary font-sans overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
