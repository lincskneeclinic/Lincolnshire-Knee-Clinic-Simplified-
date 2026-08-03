import { getStoreValue, setStoreValue } from "@/lib/dataStore";
import { createPendingPipelineRun, runPipelineGeneration } from "@/lib/contentPipeline";

const STATE_KEY = "weekly-blog-automation";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly — cheap, and self-heals after downtime without needing exact-time cron semantics

interface AutomationState {
  lastTriggeredAt: string | null;
}

async function getLastTriggeredAt(): Promise<string | null> {
  const state = await getStoreValue<AutomationState>(STATE_KEY, { lastTriggeredAt: null });
  return state.lastTriggeredAt;
}

async function setLastTriggeredAt(iso: string): Promise<void> {
  await setStoreValue(STATE_KEY, { lastTriggeredAt: iso });
}

/**
 * Creates a new pipeline run (auto-selected from trending patient enquiries,
 * same topic-selection logic the manual "Trigger New Run" button uses) and
 * runs it through research + blog drafting. Reuses the exact same
 * `runPipelineGeneration` the manual flow uses, which already sends the
 * "blog draft ready for review" email itself (see graphMail.ts) — no
 * separate notification logic needed here.
 */
async function triggerScheduledRun(): Promise<void> {
  console.log("[Weekly Blog Automation] Triggering scheduled run…");
  const run = await createPendingPipelineRun(undefined, "scheduled");
  await runPipelineGeneration(run);
  console.log(`[Weekly Blog Automation] Scheduled run ${run.run_id} completed — topic: "${run.topic}"`);
}

/** Read-only status check — never mutates state, safe to call from a GET. */
export async function getAutomationStatus(): Promise<{ lastTriggeredAt: string | null; dueInHours: number | null }> {
  const lastTriggeredAt = await getLastTriggeredAt();
  if (!lastTriggeredAt) return { lastTriggeredAt: null, dueInHours: null };
  const elapsedMs = Date.now() - new Date(lastTriggeredAt).getTime();
  const dueInHours = Math.round((WEEK_MS - elapsedMs) / (60 * 60 * 1000));
  return { lastTriggeredAt, dueInHours };
}

/** Exported for the manual admin test-trigger route — bypasses the 7-day wait but still updates the same "last triggered" marker. */
export async function checkAndRunIfDue(force = false): Promise<{ ran: boolean; reason: string }> {
  try {
    const lastTriggeredAt = await getLastTriggeredAt();
    const now = new Date();

    if (!force && !lastTriggeredAt) {
      // First time this feature has ever run on this deployment — set a
      // baseline instead of firing immediately, so shipping this doesn't
      // surprise anyone with an unplanned run. Waits one real week from now.
      await setLastTriggeredAt(now.toISOString());
      return { ran: false, reason: "Initialized — first automatic run will fire in ~7 days." };
    }

    const elapsedMs = lastTriggeredAt ? now.getTime() - new Date(lastTriggeredAt).getTime() : Infinity;
    if (!force && elapsedMs < WEEK_MS) {
      return { ran: false, reason: `Not due yet — ${Math.round((WEEK_MS - elapsedMs) / (60 * 60 * 1000))}h remaining.` };
    }

    await triggerScheduledRun();
    await setLastTriggeredAt(now.toISOString());
    return { ran: true, reason: force ? "Manually forced." : "Weekly interval elapsed." };
  } catch (error) {
    console.error("[Weekly Blog Automation] Check/run failed:", error);
    return { ran: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __weeklyBlogSchedulerStarted: boolean | undefined;
}

/**
 * Starts the in-process hourly check. Only runs in the real production
 * server process — never during local `next dev`, so testing locally never
 * fires a real scheduled run (or a real email) against production data.
 * Guarded against double-start since Next.js can call instrumentation's
 * register() more than once in some dev/hot-reload scenarios.
 */
export function startWeeklyBlogScheduler(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Weekly Blog Automation] Skipped — not running in production.");
    return;
  }
  if (globalThis.__weeklyBlogSchedulerStarted) return;
  globalThis.__weeklyBlogSchedulerStarted = true;

  console.log("[Weekly Blog Automation] Scheduler started — checking hourly.");
  checkAndRunIfDue().catch((err) => console.error("[Weekly Blog Automation] Initial check failed:", err));
  setInterval(() => {
    checkAndRunIfDue().catch((err) => console.error("[Weekly Blog Automation] Scheduled check failed:", err));
  }, CHECK_INTERVAL_MS);
}
