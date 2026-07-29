import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | Lincolnshire Knee Clinic",
  description:
    "Get in touch with Lincolnshire Knee Clinic to ask a question, request information, or discuss your knee condition before booking a consultation.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us | Lincolnshire Knee Clinic",
    description:
      "Get in touch with Lincolnshire Knee Clinic to ask a question, request information, or discuss your knee condition before booking a consultation.",
    url: `${SITE_URL}/contact`,
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
    title: "Contact Us | Lincolnshire Knee Clinic",
    description:
      "Get in touch with Lincolnshire Knee Clinic to ask a question, request information, or discuss your knee condition.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
