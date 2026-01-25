import { expect, test } from "@playwright/test";

import { WEB_URL } from "../urls.ts";

test.describe("GraphQL Weekly", () => {
  test("homepage displays latest issue", async ({ page }) => {
    await page.goto(WEB_URL);

    // Main heading visible (h1 in header with newsletter description)
    await expect(
      page.getByRole("heading", { level: 1, name: /newsletter/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Issue content loaded (topics section)
    await expect(
      page.getByRole("link", { exact: true, name: "Articles" }),
    ).toBeVisible();
  });

  test("newsletter subscription flow", async ({ page }) => {
    await page.goto(WEB_URL);

    // Use label text to find inputs - NAME and EMAIL are visible labels
    const nameInput = page.getByRole("textbox", { name: /name/i });
    const emailInput = page.getByRole("textbox", { name: /email/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Fill form (clear first to ensure clean state)
    const timestamp = Date.now();
    await nameInput.clear();
    await nameInput.fill(`Test User ${timestamp}`);
    await emailInput.clear();
    await emailInput.fill(`test+${timestamp}@example.com`);

    // Submit
    await page.getByRole("button", { name: /subscribe/i }).click();

    // Wait for success message (API can be slow)
    await expect(page.getByText(/successfully added/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("topic navigation works", async ({ page }) => {
    await page.goto(WEB_URL);

    // Click on a topic link in sidebar/content
    const topicLink = page.getByRole("link", { name: /articles/i }).first();
    await topicLink.click();

    // Should navigate to topic page
    await expect(page).toHaveURL(/\/topic\//);

    // Topic page has content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("issue navigation works", async ({ page }) => {
    await page.goto(WEB_URL);

    // Find and click on an issue link in sidebar (format: "Issue 399")
    const issueLink = page.getByRole("link", { name: /^issue \d+$/i }).first();
    await issueLink.click();

    // Should navigate to issue page
    await expect(page).toHaveURL(/\/issues\/\d+/);

    // Issue page content visible (shows topics like homepage)
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });
});
