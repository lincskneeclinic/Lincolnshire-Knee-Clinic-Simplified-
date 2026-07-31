"use client";

import { useEffect, useState } from "react";

// Shows a view count that "auto-updates": the server renders whatever was last
// cached (this page is ISR, so that number can be a few minutes stale), and on
// mount this fires a beacon that increments the real count and swaps the displayed
// number to the live total shortly after the page loads — without needing a manual
// refresh.
export function ArticleViewCounter({ slug, initialViews }: { slug: string; initialViews: number }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/education-views/${encodeURIComponent(slug)}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success && typeof data.views === "number") {
          setViews(data.views);
        }
      })
      .catch(() => {
        // Silent — a failed view beacon shouldn't disrupt the reading experience.
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return <>{views.toLocaleString()}</>;
}
