import { getStoreValue, setStoreValue } from "./dataStore";
import { sendBrevoMail } from "./brevo";
import { sendGraphMail } from "./graphMail";
import { wrapNewsletterEmailTemplate, markdownToEmailHtml } from "./newsletterMarkdown";

export interface TopicSubscriber {
  email: string;
  subscribedAt: string;
}

const TOPIC_SUBSCRIBERS_KEY = "topic-notify-subscribers";
const SITE_URL = "https://lincolnshirekneeclinic.co.uk";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readSubscribers(): Promise<Record<string, TopicSubscriber[]>> {
  return getStoreValue<Record<string, TopicSubscriber[]>>(TOPIC_SUBSCRIBERS_KEY, {});
}

export async function subscribeToTopic(topicId: string, email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (!topicId || typeof topicId !== "string") {
    return { success: false, error: "Missing topic." };
  }

  const all = await readSubscribers();
  const list = all[topicId] || [];
  if (!list.some((s) => s.email === cleanEmail)) {
    list.push({ email: cleanEmail, subscribedAt: new Date().toISOString() });
    all[topicId] = list;
    await setStoreValue(TOPIC_SUBSCRIBERS_KEY, all);
  }
  return { success: true };
}

// Single-click unsubscribe from every topic at once (not just the one that
// triggered a given email) — simpler and more predictable for the recipient
// than per-topic unsubscribe links. See app/api/topic-notify/unsubscribe/route.ts.
export async function unsubscribeFromAllTopics(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const all = await readSubscribers();
  let changed = false;
  for (const topicId of Object.keys(all)) {
    const filtered = all[topicId].filter((s) => s.email !== cleanEmail);
    if (filtered.length !== all[topicId].length) {
      all[topicId] = filtered;
      changed = true;
    }
  }
  if (changed) await setStoreValue(TOPIC_SUBSCRIBERS_KEY, all);
}

/**
 * Emails everyone subscribed to any of the given topic slugs that new content
 * is available. Called from contentPipeline.ts's submitPipelineReview right
 * after an "Update" run's setArticleOverride() call — deliberately scoped to
 * only that flow (not brand-new AI-topic runs), since the content pipeline's
 * topic is free-text with no reliable way to match it back to a specific
 * symptom/condition/treatment/injection slug without real risk of emailing
 * subscribers about unrelated content. See data/articles.ts's
 * relatedTopicSlugs field — an article opts into this by declaring which
 * topics it covers.
 *
 * Fire-and-forget from the caller — never throws.
 */
export async function notifyTopicSubscribers(topicSlugs: string[], articleTitle: string, articleUrl: string): Promise<void> {
  if (!topicSlugs || topicSlugs.length === 0) return;

  try {
    const all = await readSubscribers();
    const uniqueEmails = new Map<string, TopicSubscriber>();
    for (const topicId of topicSlugs) {
      for (const sub of all[topicId] || []) {
        uniqueEmails.set(sub.email, sub);
      }
    }
    if (uniqueEmails.size === 0) return;

    const subject = `New content on a topic you follow: ${articleTitle}`;
    const contentHtml = markdownToEmailHtml(
      `We've just published new content on a topic you asked to hear about:\n\n### ${articleTitle}\n\n[Read the full update](${articleUrl})`
    );

    const hasBrevo = Boolean(process.env.BREVO_API_KEY);
    const hasMSGraph = Boolean(
      process.env.MS_GRAPH_TENANT_ID && process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET
    );

    for (const sub of uniqueEmails.values()) {
      const unsubscribeUrl = `${SITE_URL}/api/topic-notify/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      const footerHtml = `
        <p style="margin: 24px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          You received this email because you asked to be notified about new content on this topic at ${SITE_URL}.
          <br />
          <a href="${unsubscribeUrl}" style="color: #14b8a6; text-decoration: underline; font-weight: bold;">Unsubscribe from topic updates</a>
        </p>
      `;
      const html = wrapNewsletterEmailTemplate(subject, contentHtml, { footerHtml, includePoll: false });

      if (hasBrevo) {
        await sendBrevoMail(subject, html, sub.email);
      } else if (hasMSGraph) {
        await sendGraphMail(subject, html, sub.email);
      } else {
        console.warn(`[Topic Notify Simulation] Would notify ${sub.email} about "${articleTitle}"`);
      }
    }
  } catch (error) {
    console.error("Failed to notify topic subscribers:", error);
  }
}
