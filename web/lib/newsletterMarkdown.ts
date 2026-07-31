const P_STYLE = "margin-top: 12px; margin-bottom: 12px; font-size: 15px; line-height: 1.6; color: #334155;";
const H3_STYLE = "color: #0c4a6e; font-family: Georgia, serif; font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px;";
const LI_STYLE = "margin-bottom: 6px; font-size: 14px; color: #475569;";
const UL_STYLE = "margin-top: 8px; margin-bottom: 8px; padding-left: 20px;";
const A_STYLE = "color: #0d9488; font-weight: bold; text-decoration: underline;";

function formatInline(text: string): string {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" style="${A_STYLE}">$1</a>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>');
}

/**
 * Line-based markdown -> email-safe HTML conversion. Only supports the small
 * subset the newsletter writer prompt is instructed to produce: ### headers,
 * **bold**, "- " bullet lists, and blank-line-separated paragraphs. A prior
 * global-regex version matched "-" and "###" anywhere in the string (no line
 * anchors), which shredded headers and paragraphs into stray <li>/<ul> tags
 * whenever a hyphen appeared mid-sentence.
 */
export function markdownToEmailHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push(`<p style="${P_STYLE}">${formatInline(paragraphLines.join(" "))}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const items = listItems.map((item) => `<li style="${LI_STYLE}">${formatInline(item)}</li>`).join("");
      blocks.push(`<ul style="${UL_STYLE}">${items}</ul>`);
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^###\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push(`<h3 style="${H3_STYLE}">${formatInline(headingMatch[1].trim())}</h3>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("");
}

export function wrapNewsletterEmailTemplate(subject: string, contentHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; margin: 0; color: #334155;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #0c4a6e; padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 24px; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Lincolnshire Knee Clinic</h1>
            <p style="color: #38bdf8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 8px 0 0 0; letter-spacing: 1.5px;">Patient Education & Clinical Updates</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <h2 style="font-family: Georgia, serif; color: #0f172a; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; line-height: 1.4;">${subject}</h2>
            ${contentHtml}
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; font-weight: bold;">Lincolnshire Knee Clinic</p>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; line-height: 1.5;">Consultant-led orthopaedic care and joint preservation pathways across Lincolnshire.</p>
            <div style="margin: 16px 0;">
              <a href="https://lincolnshirekneeclinic.co.uk/book-appointment" style="background-color: #14b8a6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">Book a Consultation</a>
            </div>
            <p style="margin: 24px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              You received this email because you opted into clinical updates from Lincolnshire Knee Clinic.
              <br />
              <a href="https://lincolnshirekneeclinic.co.uk/newsletter?unsubscribe=true&email={{RECIPIENT_EMAIL}}" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Unsubscribe Instantly</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function convertNewsletterMarkdownToHtml(subject: string, markdown: string): string {
  return wrapNewsletterEmailTemplate(subject, markdownToEmailHtml(markdown));
}
