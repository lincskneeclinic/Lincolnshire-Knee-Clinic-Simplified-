import crypto from "crypto";
import { getStoreValue, setStoreValue } from "./dataStore";
import { NEWSLETTER_POLL_TOPICS } from "./newsletterMarkdown";

const POLL_KEY = "newsletter-poll";
const TOPICS_KEY = "dynamic-topics";

interface PollSuggestion {
  text: string;
  date: string;
  convertedToTopicId?: string;
}

interface PollData {
  votes: Record<string, number>;
  suggestions: PollSuggestion[];
}

interface DynamicTopic {
  id: string;
  label: string;
  category?: string;
  enquiryCount: number;
  isAiDiscovered?: boolean;
  latestQueries?: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Merges newsletter poll votes and free-text suggestions into dynamic-topics —
 * the same store createPendingPipelineRun() picks the top enquiryCount entry
 * from when no custom topic is given. Called before that selection happens so
 * patient-voted/suggested topics are eligible to become the next blog post or
 * newsletter, instead of sitting unused in the poll data.
 */
export async function syncPollTopicsIntoDynamicTopics(): Promise<void> {
  const poll = await getStoreValue<PollData>(POLL_KEY, { votes: {}, suggestions: [] });
  const topics = await getStoreValue<DynamicTopic[]>(TOPICS_KEY, []);
  let topicsChanged = false;
  let pollChanged = false;

  for (const topic of NEWSLETTER_POLL_TOPICS) {
    const voteCount = poll.votes[topic];
    if (!voteCount) continue;

    const pollTopicId = `poll-${slugify(topic)}`;
    const existing = topics.find((t) => t.id === pollTopicId);
    if (existing) {
      if (existing.enquiryCount !== voteCount) {
        existing.enquiryCount = voteCount;
        topicsChanged = true;
      }
    } else {
      topics.push({
        id: pollTopicId,
        label: topic,
        category: "General Knee Health",
        enquiryCount: voteCount,
        isAiDiscovered: true,
      });
      topicsChanged = true;
    }
  }

  for (const suggestion of poll.suggestions) {
    if (suggestion.convertedToTopicId) continue;

    const topicId = `poll-suggestion-${crypto.randomUUID().slice(0, 8)}`;
    topics.push({
      id: topicId,
      label: suggestion.text,
      category: "General Knee Health",
      // Starts with a competitive baseline so a genuine patient suggestion can
      // actually win topic selection, not just sit below high-volume evergreen
      // contact-form topics that accumulate enquiryCount over months.
      enquiryCount: 3,
      isAiDiscovered: true,
    });
    suggestion.convertedToTopicId = topicId;
    topicsChanged = true;
    pollChanged = true;
  }

  if (topicsChanged) {
    // Keep baseline (isAiDiscovered === false) topics, prune least popular
    // AI-discovered ones — same 10-topic cap the contact-form sync applies.
    if (topics.length > 10) {
      topics.sort((a, b) => (b.enquiryCount || 0) - (a.enquiryCount || 0));
      const baseline = topics.filter((t) => t.isAiDiscovered === false);
      const discovered = topics.filter((t) => t.isAiDiscovered !== false).slice(0, 10 - baseline.length);
      await setStoreValue(TOPICS_KEY, [...baseline, ...discovered]);
    } else {
      await setStoreValue(TOPICS_KEY, topics);
    }
  }

  if (pollChanged) {
    await setStoreValue(POLL_KEY, poll);
  }
}
