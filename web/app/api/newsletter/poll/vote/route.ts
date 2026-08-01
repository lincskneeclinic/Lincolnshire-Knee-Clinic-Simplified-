import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";
import { NEWSLETTER_POLL_TOPICS } from "@/lib/newsletterMarkdown";

const POLL_KEY = "newsletter-poll";
const DEFAULT_POLL = {
  votes: {} as Record<string, number>,
  suggestions: [] as { text: string; date: string }[],
};

// GET (not POST) because this is reached by clicking a plain <a> link inside
// an email — email clients strip <form>/JS, so a real form submission isn't
// possible. Redirects back to the site with a confirmation banner instead of
// returning JSON, since a browser is what's following this link.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const option = url.searchParams.get("option") || "";

  const redirectTo = new URL("/newsletter", url.origin);
  redirectTo.hash = "poll";

  if (!NEWSLETTER_POLL_TOPICS.includes(option)) {
    redirectTo.searchParams.set("pollError", "1");
    return NextResponse.redirect(redirectTo);
  }

  const data = await getStoreValue(POLL_KEY, DEFAULT_POLL);
  data.votes[option] = (data.votes[option] || 0) + 1;
  await setStoreValue(POLL_KEY, data);

  redirectTo.searchParams.set("voted", option);
  return NextResponse.redirect(redirectTo);
}
