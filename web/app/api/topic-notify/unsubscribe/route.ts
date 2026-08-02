import { NextResponse } from "next/server";
import { unsubscribeFromAllTopics } from "@/lib/topicNotify";

// GET (not POST) because this is reached by clicking a plain <a> link inside
// an email — same reasoning as app/api/newsletter/poll/vote/route.ts.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") || "";

  if (email) {
    await unsubscribeFromAllTopics(email);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Unsubscribed | Lincolnshire Knee Clinic</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 2rem; }
    .box { max-width: 420px; }
    h1 { font-family: Georgia, serif; color: #0c4a6e; font-size: 1.5rem; margin-bottom: 1rem; }
    a { color: #14b8a6; font-weight: bold; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <h1>You've been unsubscribed</h1>
    <p>You won't receive any more topic-update emails from Lincolnshire Knee Clinic.</p>
    <p><a href="https://lincolnshirekneeclinic.co.uk">Return to the site</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
