import { NextResponse } from "next/server";
import { getNewsletterEditions } from "@/lib/newsletterDistribution";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const editions = await getNewsletterEditions();
  const edition = editions.find((e) => e.id === id && e.status === "sent");

  if (!edition) {
    return NextResponse.json({ success: false, error: "Newsletter edition not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    edition: {
      id: edition.id,
      subject: edition.subject,
      bodyHtml: edition.bodyHtml,
      bodyMarkdown: edition.bodyMarkdown,
      dateSent: edition.dateSent,
    },
  });
}
