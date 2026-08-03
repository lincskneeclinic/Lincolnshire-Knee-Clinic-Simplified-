export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { startWeeklyBlogScheduler } = await import("./lib/weeklyBlogAutomation");
  startWeeklyBlogScheduler();
}
