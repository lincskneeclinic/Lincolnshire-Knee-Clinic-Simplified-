import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UrgentAdviceBanner } from "@/components/UrgentAdviceBanner";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lincolnshire Knee Clinic - Consultant-Led Knee Care",
  description:
    "Specialist assessment and treatment for knee pain, knee arthritis, meniscus tears, sports knee injuries, knee injections, and knee replacement concerns in Lincolnshire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiasedScroll`}
    >
      <body className="min-h-full flex flex-col bg-white text-text-primary font-sans overflow-x-hidden">
        {/* WCAG 2.1 AA Keyboard Access skip link */}
        <a href="#main-content" className="skip-link">
          Skip to Main Content
        </a>

        {/* Global Urgent Advice Banner */}
        <UrgentAdviceBanner />

        {/* Global Navigation Header */}
        <Header />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global floating WhatsApp Business button — administrative enquiries only */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
