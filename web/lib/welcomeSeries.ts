import { getStoreValue, setStoreValue } from "./dataStore";
import { wrapNewsletterEmailTemplate, markdownToEmailHtml } from "./newsletterMarkdown";
import { sendBrevoMail } from "./brevo";
import { sendGraphMail } from "./graphMail";
import { SITE_URL } from "./site";

const QUEUE_KEY = "welcome-series-queue";

// Days after signup each step becomes due. Step 0 is sent synchronously at
// signup time (see enqueueWelcomeSeries), so this only covers steps 1-2.
const STEP_DELAYS_DAYS = [3, 7];

// Used instead of STEP_DELAYS_DAYS for quiet, page-context captures (see
// enqueueWelcomeSeries's deferStart param) — nothing is sent synchronously at
// signup, so the visitor never gets an email at the exact moment they browsed.
// The first email goes out the next day, the second a few days after that.
const DEFERRED_STEP_DELAYS_DAYS = [1, 4];

interface WelcomeSeriesEntry {
  email: string;
  name: string;
  primaryInterest: string;
  signupDate: string;
  stepsSent: number; // 0 = only the immediate welcome email has gone out
  lastSentAt: string;
  // true for quiet page-context captures — see enqueueWelcomeSeries's deferStart param
  deferred?: boolean;
}

interface InterestContent {
  step0Body: string; // markdown, sent immediately
  step1Body: string; // markdown, sent ~3 days later
  step2Body: string; // markdown, sent ~7 days later
  linkUrl: string;
  linkLabel: string;
}

const INTEREST_CONTENT: Record<string, InterestContent> = {
  "Injections & Preservation": {
    step0Body:
      "Welcome to Lincolnshire Knee Clinic's patient updates. Since you're interested in joint preservation, you'll hear from us about non-surgical options like Arthrosamid (single-dose hydrogel) and PRP injections, and how they compare to more traditional corticosteroid treatments.\n\nOver the next week we'll send a couple of short, practical emails before your regular newsletter begins.",
    step1Body:
      "### How Long Do Knee Injections Actually Last?\n\nOne of the most common questions we hear: how does a single-dose hydrogel injection compare to a course of corticosteroid injections?\n\nIn short — hydrogel treatments like Arthrosamid are designed to provide structural cushioning that lasts significantly longer than the anti-inflammatory relief of a steroid injection, which typically fades after a few months.\n\nWe've written a full breakdown of the evidence and what to expect from consultation to recovery.",
    step2Body:
      "### Making the Most of Your Updates\n\nYou'll now start receiving our regular newsletter, with clinical updates and practical guides relevant to joint preservation and injection therapies.\n\nHave a specific question you'd like our consultant to cover? Every newsletter includes a quick poll where you can vote on topics or suggest your own — we read every suggestion.",
    linkUrl: `${SITE_URL}/injections`,
    linkLabel: "Explore Injection & Joint Preservation Options",
  },
  "Knee Replacement & Surgery": {
    step0Body:
      "Welcome to Lincolnshire Knee Clinic's patient updates. Since you're interested in knee replacement and surgical care, you'll hear from us about what to expect before, during, and after surgery — from enhanced recovery protocols to realistic recovery timelines.\n\nOver the next week we'll send a couple of short, practical emails before your regular newsletter begins.",
    step1Body:
      "### What Recovery Actually Looks Like After Knee Replacement\n\nRecovery isn't a straight line — most patients see the biggest improvements between weeks 6 and 12, with continued gains for up to a year.\n\nWe've put together a practical guide covering pain management, physiotherapy milestones, and when patients typically return to driving, work, and sport.",
    step2Body:
      "### Making the Most of Your Updates\n\nYou'll now start receiving our regular newsletter, with clinical updates and practical guides relevant to surgery and recovery.\n\nHave a specific question you'd like our consultant to cover? Every newsletter includes a quick poll where you can vote on topics or suggest your own — we read every suggestion.",
    linkUrl: `${SITE_URL}/treatments/total-knee-replacement`,
    linkLabel: "Read About Total Knee Replacement",
  },
  "Sports Injuries & ACL": {
    step0Body:
      "Welcome to Lincolnshire Knee Clinic's patient updates. Since you're interested in sports injuries and ACL care, you'll hear from us about return-to-sport timelines, reconstruction techniques, and injury prevention.\n\nOver the next week we'll send a couple of short, practical emails before your regular newsletter begins.",
    step1Body:
      "### Returning to Sport After an ACL Injury\n\nOne of the most common questions active patients ask: when can I get back to my sport?\n\nModern ACL reconstruction, combined with structured rehabilitation, means many patients return to competitive sport — but timing depends heavily on graft type, sport demands, and rehab progress, not just the calendar.\n\nWe've written a detailed guide on realistic timelines and what determines them.",
    step2Body:
      "### Making the Most of Your Updates\n\nYou'll now start receiving our regular newsletter, with clinical updates and practical guides relevant to sports injuries and recovery.\n\nHave a specific question you'd like our consultant to cover? Every newsletter includes a quick poll where you can vote on topics or suggest your own — we read every suggestion.",
    linkUrl: `${SITE_URL}/treatments/acl-reconstruction`,
    linkLabel: "Learn About ACL Reconstruction",
  },
  "General Knee Health": {
    step0Body:
      "Welcome to Lincolnshire Knee Clinic's patient updates. You'll hear from us with practical, clinically accurate guidance on keeping your knees healthy — from everyday joint care to knowing when a symptom needs a specialist opinion.\n\nOver the next week we'll send a couple of short, practical emails before your regular newsletter begins.",
    step1Body:
      "### Should You Be Worried About Your Knee Symptoms?\n\nKnee pain is common, but knowing which symptoms are worth a specialist opinion — versus which usually settle on their own — can save a lot of unnecessary worry.\n\nWe've put together a plain-English guide to the most common knee symptoms and what they can indicate.",
    step2Body:
      "### Making the Most of Your Updates\n\nYou'll now start receiving our regular newsletter, with practical clinical updates and patient guides.\n\nHave a specific question you'd like our consultant to cover? Every newsletter includes a quick poll where you can vote on topics or suggest your own — we read every suggestion.",
    linkUrl: `${SITE_URL}/symptoms`,
    linkLabel: "Explore Common Knee Symptoms",
  },
};

function getContentFor(primaryInterest: string): InterestContent {
  return INTEREST_CONTENT[primaryInterest] || INTEREST_CONTENT["General Knee Health"];
}

async function sendWelcomeEmail(email: string, name: string, subject: string, bodyMarkdown: string, linkUrl: string, linkLabel: string): Promise<boolean> {
  const contentHtml = `${markdownToEmailHtml(bodyMarkdown)}<div style="margin: 20px 0;"><a href="${linkUrl}" style="background-color: #14b8a6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">${linkLabel} →</a></div>`;
  const html = wrapNewsletterEmailTemplate(subject, contentHtml).replace(/\{\{RECIPIENT_EMAIL\}\}/g, encodeURIComponent(email));

  const hasBrevo = Boolean(process.env.BREVO_API_KEY);
  const hasMSGraph = Boolean(
    process.env.MS_GRAPH_TENANT_ID && process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET
  );

  if (hasBrevo) {
    const result = await sendBrevoMail(subject, html, email, name);
    return result.success;
  }
  if (hasMSGraph) {
    return sendGraphMail(subject, html, email);
  }
  console.warn(`[Welcome Series Simulation] Would send "${subject}" to ${email}`);
  return true;
}

/**
 * Call right after a successful newsletter signup. Sends the immediate
 * welcome email synchronously and queues the two follow-up steps for
 * processDueWelcomeEmails() to pick up later.
 *
 * Pass deferStart=true for quiet, page-context captures where the visitor
 * should not receive anything at the moment they happened to be browsing —
 * this skips the synchronous send entirely and queues both emails on the
 * DEFERRED_STEP_DELAYS_DAYS schedule instead (next day, then a few days later).
 */
export async function enqueueWelcomeSeries(
  email: string,
  name: string,
  primaryInterest: string,
  deferStart: boolean = false
): Promise<void> {
  const now = new Date().toISOString();

  if (!deferStart) {
    const content = getContentFor(primaryInterest);
    await sendWelcomeEmail(
      email,
      name,
      "Welcome to Lincolnshire Knee Clinic",
      content.step0Body,
      content.linkUrl,
      content.linkLabel
    );
  }

  const queue = await getStoreValue<WelcomeSeriesEntry[]>(QUEUE_KEY, []);
  // Avoid duplicate queue entries if someone re-submits the signup form.
  const filtered = queue.filter((entry) => entry.email !== email);
  filtered.push({
    email,
    name,
    primaryInterest,
    signupDate: now,
    stepsSent: 0,
    lastSentAt: now,
    deferred: deferStart,
  });
  await setStoreValue(QUEUE_KEY, filtered);
}

/**
 * Sends any follow-up welcome steps that are now due. No dedicated scheduler
 * exists on this deployment, so this is designed to be called opportunistically
 * from a route staff actually hit regularly (the dashboard's stats load) —
 * not perfectly on-time, but reliably within a day of becoming due for an
 * actively-used dashboard, with no extra infrastructure required.
 */
export async function processDueWelcomeEmails(): Promise<void> {
  const queue = await getStoreValue<WelcomeSeriesEntry[]>(QUEUE_KEY, []);
  if (queue.length === 0) return;

  const now = Date.now();
  let changed = false;

  for (const entry of queue) {
    const delays = entry.deferred ? DEFERRED_STEP_DELAYS_DAYS : STEP_DELAYS_DAYS;
    if (entry.stepsSent >= delays.length) continue;

    const dueAfterMs = delays[entry.stepsSent] * 24 * 60 * 60 * 1000;
    const signupMs = new Date(entry.signupDate).getTime();
    if (now - signupMs < dueAfterMs) continue;

    const content = getContentFor(entry.primaryInterest);
    // Deferred entries never got a synchronous send, so their two queued
    // emails reuse step0Body/step1Body (the "welcome" + "quick guide"
    // content) instead of step1Body/step2Body.
    const stepBody = entry.deferred
      ? entry.stepsSent === 0 ? content.step0Body : content.step1Body
      : entry.stepsSent === 0 ? content.step1Body : content.step2Body;
    const subject = entry.deferred
      ? entry.stepsSent === 0
        ? "Thanks for your interest — here's what to expect"
        : "A quick guide, tailored to what you're interested in"
      : entry.stepsSent === 0
        ? "A quick guide, tailored to what you're interested in"
        : "Your newsletter starts now — plus how to shape what's next";

    const success = await sendWelcomeEmail(entry.email, entry.name, subject, stepBody, content.linkUrl, content.linkLabel);
    if (success) {
      entry.stepsSent += 1;
      entry.lastSentAt = new Date().toISOString();
      changed = true;
    }
  }

  if (changed) {
    // Drop fully-completed entries so the queue doesn't grow forever.
    const remaining = queue.filter(
      (entry) => entry.stepsSent < (entry.deferred ? DEFERRED_STEP_DELAYS_DAYS.length : STEP_DELAYS_DAYS.length)
    );
    await setStoreValue(QUEUE_KEY, remaining);
  }
}
