import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/LayoutShell";

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
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-text-primary font-sans overflow-x-hidden">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
