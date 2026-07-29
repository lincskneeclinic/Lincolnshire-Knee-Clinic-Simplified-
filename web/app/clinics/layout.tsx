import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Private Practice Locations | Lincolnshire Knee Clinic",
  description:
    "Mr Ricardo J Pacheco consults privately at several independent hospitals and clinics across Lincolnshire and neighbouring regions. Find your most convenient location.",
  alternates: {
    canonical: `${SITE_URL}/clinics`,
  },
  openGraph: {
    title: "Private Practice Locations | Lincolnshire Knee Clinic",
    description:
      "Mr Ricardo J Pacheco consults privately at several independent hospitals and clinics across Lincolnshire and neighbouring regions. Find your most convenient location.",
    url: `${SITE_URL}/clinics`,
    type: "website",
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
    title: "Private Practice Locations | Lincolnshire Knee Clinic",
    description:
      "Private practice locations for Lincolnshire Knee Clinic across Lincolnshire and neighbouring regions.",
  },
};

export default function ClinicsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
