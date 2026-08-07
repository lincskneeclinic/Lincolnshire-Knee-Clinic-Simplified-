import { SITE_URL } from "@/lib/site";

// Shared between the /newsletter page's interactive poll widget and the
// clickable poll embedded in the sent email, so votes from either source
// land on the same option keys in the newsletter-poll KV store.
export const NEWSLETTER_POLL_TOPICS = [
  "Hydrogel vs Corticosteroid Injection Longevity",
  "Post-Op Swelling & Ice Therapy Protocol",
  "Cartilage Repair vs Microfracture Surgery",
  "Returning to Golf & Tennis After Knee Replacement",
];

const P_STYLE = "margin-top: 12px; margin-bottom: 12px; font-size: 15px; line-height: 1.6; color: #334155;";
const H3_STYLE = "color: #0c4a6e; font-family: Georgia, serif; font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px;";
const LI_STYLE = "margin-bottom: 6px; font-size: 14px; color: #475569;";
const UL_STYLE = "margin-top: 8px; margin-bottom: 8px; padding-left: 20px;";
const A_STYLE = "color: #0d9488; font-weight: bold; text-decoration: underline;";

/**
 * A root-relative link like "/education/knee-arthritis/..." resolves fine
 * when the same markdown is rendered on the /newsletter page (browser
 * resolves it against the current origin), but breaks in an actual email —
 * there's no "current page" to resolve against, so clients either fail to
 * open it or resolve it against something unrelated. Absolutize anything
 * that isn't already a full URL.
 */
function absolutizeUrl(url: string): string {
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatInline(text: string): string {
  return text
    .replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => `<img src="${absolutizeUrl(url)}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 8px;" />`)
    .replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, url) => `<a href="${absolutizeUrl(url)}" style="${A_STYLE}">${label}</a>`)
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
  let orderedListItems: string[] = [];

  const formatInline = (text: string): string => {
    return text
      .replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => `<img src="${absolutizeUrl(url)}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 8px;" />`)
      .replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, url) => `<a href="${absolutizeUrl(url)}" style="${A_STYLE}">${label}</a>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>');
  };

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

  const flushOrderedList = () => {
    if (orderedListItems.length > 0) {
      const items = orderedListItems.map((item, index) => `<li style="${LI_STYLE}; list-style-type: none; margin-bottom: 8px;">${index + 1}. ${formatInline(item)}</li>`).join("");
      blocks.push(`<ul style="margin-top: 8px; margin-bottom: 8px; padding-left: 0; margin-left: 0; list-style-type: none;">${items}</ul>`);
      orderedListItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushOrderedList();
      continue;
    }

    const headingMatch = line.match(/^###\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushOrderedList();
      blocks.push(`<h3 style="${H3_STYLE}">${formatInline(headingMatch[1].trim())}</h3>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)/);
    if (listMatch) {
      flushParagraph();
      flushOrderedList();
      listItems.push(listMatch[1].trim());
      continue;
    }

    const orderedListMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedListMatch) {
      flushParagraph();
      flushList();
      orderedListItems.push(orderedListMatch[2].trim());
      continue;
    }

    flushList();
    flushOrderedList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushOrderedList();

  return blocks.join("");
}

// Email clients strip <form>/JS, so votes are plain GET links to a route that
// records the vote and redirects back to the site — the same pattern used for
// the unsubscribe link below. The "something else" option can't collect free
// text via a link click, so it deep-links to the poll widget on the site
// instead, where the existing text box already posts custom suggestions.
function buildNewsletterPollHtml(recipientEmailPlaceholder: string): string {
  const voteButtons = NEWSLETTER_POLL_TOPICS.map((topic) => {
    const voteUrl = `${SITE_URL}/api/newsletter/poll/vote?option=${encodeURIComponent(topic)}&email=${recipientEmailPlaceholder}`;
    return `
      <tr>
        <td style="padding-bottom: 10px;">
          <a href="${voteUrl}" style="display: block; padding: 12px 16px; background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; color: #0f172a; font-size: 13px; font-weight: 600; text-decoration: none;">
            ${topic}
          </a>
        </td>
      </tr>`;
  }).join("");

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
      <tr>
        <td>
          <h3 style="${H3_STYLE}">📋 What Should We Cover Next?</h3>
          <p style="${P_STYLE}">Tap a topic to vote for what our specialists should explain in an upcoming newsletter:</p>
        </td>
      </tr>
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            ${voteButtons}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 4px;">
          <a href="${SITE_URL}/newsletter#poll" style="color: #0d9488; font-weight: bold; font-size: 13px; text-decoration: underline;">
            💬 Got a different question? Tell us →
          </a>
        </td>
      </tr>
    </table>
  `;
}

export interface EmailTemplateOptions {
  // Overrides the "why you received this / unsubscribe" footer paragraph —
  // needed for transactional emails (e.g. community reply notifications)
  // where the default "you opted into clinical updates... Unsubscribe
  // Instantly" copy would be actively misleading (that link unsubscribes
  // from the marketing newsletter, not whatever transactional email it's
  // attached to).
  footerHtml?: string;
  // The "what should we cover next" poll only makes sense in an actual
  // newsletter — default true for backward compatibility with existing
  // callers, set false for transactional emails.
  includePoll?: boolean;
}

export function wrapNewsletterEmailTemplate(
  subject: string,
  contentHtml: string,
  options: EmailTemplateOptions = {}
): string {
  const { footerHtml, includePoll = true } = options;

  const defaultFooter = `
    <p style="margin: 24px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
      You received this email because you opted into clinical updates from Lincolnshire Knee Clinic.
      <br />
      <a href="${SITE_URL}/newsletter?unsubscribe=true&email={{RECIPIENT_EMAIL}}" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Unsubscribe Instantly</a>
    </p>
  `;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; margin: 0; color: #334155;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #0c4a6e; padding: 32px 24px; text-align: center;">
            <img src="${SITE_URL}/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" width="48" height="56" style="display: block; margin: 0 auto 12px auto; width: 48px; height: 56px;" />
            <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 24px; margin: 0; font-weight: normal; letter-spacing: 0.5px;">Lincolnshire Knee Clinic</h1>
            <p style="color: #38bdf8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 8px 0 0 0; letter-spacing: 1.5px;">Patient Education & Clinical Updates</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <h2 style="font-family: Georgia, serif; color: #0f172a; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 16px; line-height: 1.4;">${subject}</h2>
            ${contentHtml}
            ${includePoll ? buildNewsletterPollHtml("{{RECIPIENT_EMAIL}}") : ""}
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <img src="${SITE_URL}/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" width="28" height="33" style="display: block; margin: 0 auto 10px auto; width: 28px; height: 33px;" />
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; font-weight: bold;">Lincolnshire Knee Clinic</p>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; line-height: 1.5;">Consultant-led orthopaedic care and joint preservation pathways across Lincolnshire.</p>
            <div style="margin: 16px 0;">
              <a href="${SITE_URL}/book-appointment" style="background-color: #14b8a6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">Book a Consultation</a>
            </div>
            
            <div style="margin: 20px 24px; font-size: 12px; color: #475569; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 12px 0; text-align: center;">
              <span style="font-weight: bold; display: block; margin-bottom: 6px; color: #0c4a6e; text-transform: uppercase; letter-spacing: 0.5px;">Patient Feedback</span>
              Read verified patient stories or leave your feedback:
              <br />
              <a href="https://g.page/r/CYqSfdXK1SGEEBM/review" target="_blank" style="color: #0d9488; font-weight: bold; text-decoration: underline; margin: 0 8px; display: inline-block;">Google Reviews</a>
              &bull;
              <a href="https://www.iwantgreatcare.org/doctors/mr-ricardo-pacheco" target="_blank" style="color: #0d9488; font-weight: bold; text-decoration: underline; margin: 0 8px; display: inline-block;">iWantGreatCare</a>
            </div>

            <div style="margin: 20px 0 12px 0; text-align: center;">
              <a href="https://www.instagram.com/lincolnshirekneeclinic/" target="_blank" style="display: inline-block; text-decoration: none; margin: 0 6px;" title="Instagram">
                <img src="https://img.icons8.com/ios-glyphs/60/00afc8/instagram-new.png" alt="Instagram" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
              </a>
              <a href="https://facebook.com/lincsknee" target="_blank" style="display: inline-block; text-decoration: none; margin: 0 6px;" title="Facebook">
                <img src="https://img.icons8.com/ios-glyphs/60/00afc8/facebook-new.png" alt="Facebook" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
              </a>
              <a href="https://www.linkedin.com/company/lincolnshire-knee-clinic/" target="_blank" style="display: inline-block; text-decoration: none; margin: 0 6px;" title="LinkedIn">
                <img src="https://img.icons8.com/ios-glyphs/60/00afc8/linkedin.png" alt="LinkedIn" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
              </a>
              <a href="https://wa.me/447770473437?text=Hello%20I%20would%20like%20to%20enquire%20about%20a%20consultation." target="_blank" style="display: inline-block; text-decoration: none; margin: 0 6px;" title="WhatsApp">
                <img src="https://img.icons8.com/ios-glyphs/60/00afc8/whatsapp.png" alt="WhatsApp" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
              </a>
            </div>
            ${footerHtml || defaultFooter}
          </td>
        </tr>
      </table>
    </div>
  `;
}
export function convertNewsletterMarkdownToHtml(subject: string, markdown: string): string {
  return wrapNewsletterEmailTemplate(subject, markdownToEmailHtml(markdown));
}

