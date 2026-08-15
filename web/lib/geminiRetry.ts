// Gemini occasionally returns 503 ("model overloaded") or 429 (rate limited)
// under transient load — retrying with backoff clears these without a manual
// re-trigger from the portal. Other errors (bad key, invalid request) fail fast.
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const RETRY_DELAYS_MS = [2000, 5000, 12000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateContentWithRetry(
  model: { generateContent: (prompt: string) => Promise<any> },
  prompt: string
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err: any) {
      const status = err?.status;
      if (!RETRYABLE_STATUS_CODES.has(status) || attempt >= RETRY_DELAYS_MS.length) {
        throw err;
      }
      console.warn(
        `Gemini request failed with status ${status} (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), retrying in ${RETRY_DELAYS_MS[attempt]}ms...`
      );
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}
