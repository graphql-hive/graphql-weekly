/* eslint-disable no-console */
/**
 * Seeds e2e test data into D1 BEFORE wrangler dev starts.
 * Called from playwright globalSetup.
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const API_DIR = resolve(import.meta.dirname, "../../api");

export function seedDatabase() {
  const issueId = "seed-issue-1";
  const topicId = "seed-topic-001";
  const linkId = "seed-link-001";
  const now = new Date().toISOString();

  // Create published issue #1 (title must be "Issue N" format for CMS to calculate next number)
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR IGNORE INTO Issue (id, title, number, published, date) VALUES ('${issueId}', 'Issue 1', 1, 1, '${now}')"`,
    { stdio: "inherit" },
  );

  // Create topic linked to seed issue
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR IGNORE INTO Topic (id, title, issue_comment, position, issueId) VALUES ('${topicId}', 'Articles', '', 0, '${issueId}')"`,
    { stdio: "inherit" },
  );

  // Create link
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR IGNORE INTO Link (id, position, text, title, topicId, url) VALUES ('${linkId}', 0, 'A test article for e2e', 'Test Article', '${topicId}', 'https://example.com/test-article')"`,
    { stdio: "inherit" },
  );

  // Add AllowedEmail for test user
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR IGNORE INTO AllowedEmail (email) VALUES ('test@e2e.local')"`,
    { stdio: "inherit" },
  );

  console.log("✅ Seeded test data");
}

// Run when executed directly
seedDatabase();
