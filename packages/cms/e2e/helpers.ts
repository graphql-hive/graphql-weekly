import { type APIRequestContext, expect, type Page } from "@playwright/test";
import { execSync } from "node:child_process";

const API_URL = "http://localhost:2012";

/**
 * Run SQL query against local D1 database with retry for SQLITE_BUSY.
 */
function execSql(sql: string, maxRetries = 5): { results: Record<string, unknown>[] }[] {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = execSync(
        `cd ../api && bunx wrangler d1 execute graphqlweekly --local --command "${sql.replaceAll('"', String.raw`\"`)}" --json`,
        { encoding: "utf8" },
      );
      return JSON.parse(result);
    } catch (error) {
      const isBusy = error instanceof Error && error.message.includes("SQLITE_BUSY");
      if (!isBusy || attempt === maxRetries) throw error;
      // Exponential backoff with jitter
      const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 100, 2000);
      execSync(`sleep ${delay / 1000}`);
    }
  }
  throw new Error("Unreachable");
}

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

/**
 * Navigate to an issue page with retry logic for server startup transience.
 * Handles "Your worker is starting..." responses during concurrent test runs.
 */
export async function gotoIssuePage(page: Page, issueId: string): Promise<void> {
  await expect(async () => {
    await page.goto(`/issue/${issueId}`);
    await page.waitForLoadState("domcontentloaded");
    // Wait for loading spinner to disappear (aria-busy=true becomes absent)
    // Short inner timeouts - outer retry handles transient failures
    await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 3000 });
  }).toPass({ intervals: [1000, 2000, 3000, 5000], timeout: 45_000 });
}

/**
 * Reload an issue page with retry logic for server startup transience.
 * Uses fresh navigation and waits for loading spinner to disappear.
 */
export async function reloadIssuePage(page: Page): Promise<void> {
  const url = page.url();
  await expect(async () => {
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");
    // Wait for loading spinner to disappear (aria-busy=true becomes absent)
    // Short inner timeouts - outer retry handles transient failures
    await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 3000 });
  }).toPass({ intervals: [1000, 2000, 3000, 5000], timeout: 45_000 });
}

/**
 * Test issue numbers and their IDs. Global setup creates these, test files just reference them.
 */
export const TEST_ISSUES = {
  CURATE_FRESH: { id: "test-issue-60001", number: 60_001, title: "Curate Fresh Issue Test" },
  DELETE_WORKFLOW: { id: "test-issue-90001", number: 90_001, title: "Delete Workflow Test" },
  EDIT_PERSIST: { id: "test-issue-80001", number: 80_001, title: "Edit and Persist Test" },
  TOPIC_ORG: { id: "test-issue-70001", number: 70_001, title: "Topic Organization Test" },
} as const;

/**
 * Set up a test issue using direct SQL. Deletes existing issue with same number,
 * then creates fresh one with predictable ID.
 */
export function setupTestIssue(config: typeof TEST_ISSUES[keyof typeof TEST_ISSUES]): void {
  const { id, number, title } = config;

  // Delete any existing issue with this number (cascades to topics/links via cleanup)
  const findResult = execSql(`SELECT id FROM Issue WHERE number = ${number}`);
  const existing = findResult[0]?.results[0] as { id: string } | undefined;

  if (existing) {
    // Clean up links from topics, then topics, then issue
    execSql(`DELETE FROM Link WHERE topicId IN (SELECT id FROM Topic WHERE issueId = '${existing.id}')`);
    execSql(`DELETE FROM Topic WHERE issueId = '${existing.id}'`);
    execSql(`DELETE FROM Issue WHERE id = '${existing.id}'`);
  }

  // Create fresh issue with known ID
  execSql(
    `INSERT INTO Issue (id, number, title, date, published) VALUES ('${id}', ${number}, '${title}', datetime('now'), 0)`
  );
}

/**
 * @deprecated Use TEST_ISSUES and setupTestIssue instead
 */
export function createTestIssue(
  _request: APIRequestContext,
  title: string,
  number: number,
): string {
  // Check if issue exists with this number
  const findResult = execSql(`SELECT id, title FROM Issue WHERE number = ${number}`);
  const existing = findResult[0]?.results[0] as { id: string; title: string } | undefined;

  if (existing) {
    if (existing.title === title) {
      // Same test - clean up links from topics, then topics
      execSql(`DELETE FROM Link WHERE topicId IN (SELECT id FROM Topic WHERE issueId = '${existing.id}')`);
      execSql(`DELETE FROM Topic WHERE issueId = '${existing.id}'`);
      return existing.id;
    }
    throw new Error(
      `Issue #${number} already exists with title "${existing.title}" (expected "${title}").`
    );
  }

  // Create new issue
  const id = `test-issue-${number}`;
  execSql(
    `INSERT INTO Issue (id, number, title, date, published) VALUES ('${id}', ${number}, '${title}', datetime('now'), 0)`
  );
  return id;
}
