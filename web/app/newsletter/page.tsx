import { Metadata } from "next";
import NewsletterPageClient from "./NewsletterPageClient";

export const metadata: Metadata = {
  title: "Newsletter Subscription | Lincolnshire Knee Clinic",
  description: "Subscribe to receive evidence-based clinical articles, non-surgical injection research, and post-op recovery guides tailored to your knee condition.",
};

export default function NewsletterPage() {
  return <NewsletterPageClient />;
}
