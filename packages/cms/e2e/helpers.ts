import type { APIRequestContext } from "@playwright/test";

const API_URL = "http://localhost:2012";

/**
 * Execute a GraphQL mutation with retries to handle server startup transience.
 * Wrangler sometimes returns "Your worker is starting..." before it's ready.
 */
export async function graphqlMutation(
  request: APIRequestContext,
  query: string,
  maxRetries = 5,
  retryDelayMs = 1000,
): Promise<{ data?: Record<string, unknown>; errors?: unknown[] }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await request.post(`${API_URL}/graphql`, {
        data: { query },
      });

      const text = await res.text();
      if (!text.startsWith("{")) {
        // Server returned non-JSON (likely startup message)
        if (attempt === maxRetries) {
          throw new Error(`Server returned non-JSON after ${maxRetries} attempts: ${text.slice(0, 100)}`);
        }
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }

      return JSON.parse(text);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  throw new Error("Unreachable");
}
