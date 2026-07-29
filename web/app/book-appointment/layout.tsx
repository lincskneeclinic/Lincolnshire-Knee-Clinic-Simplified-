import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book an Appointment | Lincolnshire Knee Clinic",
  description:
    "Book a face-to-face consultation with Lincolnshire Knee Clinic. We accommodate self-pay, private medical insurance, and NHS e-Referral patients across regional hospital locations.",
  alternates: {
    canonical: `${SITE_URL}/book-appointment`,
  },
  openGraph: {
    title: "Book an Appointment | Lincolnshire Knee Clinic",
    description:
      "Book a face-to-face consultation with Lincolnshire Knee Clinic. We accommodate self-pay, private medical insurance, and NHS e-Referral patients across regional hospital locations.",
    url: `${SITE_URL}/book-appointment`,
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
    title: "Book an Appointment | Lincolnshire Knee Clinic",
    description:
      "Book a face-to-face consultation with Lincolnshire Knee Clinic across regional hospital locations.",
  },
};

export default function BookAppointmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
