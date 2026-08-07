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
              <a href="https://www.instagram.com/lincolnshirekneeclinic/" target="_blank" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 50%; text-align: center; color: #0c4a6e; text-decoration: none; margin: 0 6px;" title="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle; margin-top: -2px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com/lincsknee" target="_blank" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 50%; text-align: center; color: #0c4a6e; text-decoration: none; margin: 0 6px;" title="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle; margin-top: -2px;"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/lincolnshire-knee-clinic/" target="_blank" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 50%; text-align: center; color: #0c4a6e; text-decoration: none; margin: 0 6px;" title="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle; margin-top: -2px;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://wa.me/447770473437?text=Hello%20I%20would%20like%20to%20enquire%20about%20a%20consultation." target="_blank" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 50%; text-align: center; color: #0c4a6e; text-decoration: none; margin: 0 6px;" title="WhatsApp">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle; margin-top: -2px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
