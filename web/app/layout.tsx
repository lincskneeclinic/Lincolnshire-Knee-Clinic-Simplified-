import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";
import { SITE_URL } from "@/lib/site";
import { clinicLocations } from "@/data/clinics";

/**
 * Inter — primary sans-serif body font.
 * Excellent legibility at all sizes; widely used in healthcare UIs.
 * subsets: latin ensures only the characters needed are downloaded.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Source Serif 4 — used for headings (h1, h2).
 * High legibility serif with strong stroke contrast; good for elderly readers.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["600", "700"],
});

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
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
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
