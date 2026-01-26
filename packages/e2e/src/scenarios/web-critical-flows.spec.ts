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

    const nameInput = page.getByRole("textbox", { name: /name/i });
    const emailInput = page.getByRole("textbox", { name: /email/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    const timestamp = Date.now();
    await nameInput.fill(`Test User ${timestamp}`);
    await emailInput.fill(`test+${timestamp}@example.com`);

    await page.getByRole("button", { name: /subscribe/i }).click();

    const successMessage = page.getByText(/successfully added/i);
    const errorMessage = page.getByText(/error/i);

    await expect(successMessage.or(errorMessage)).toBeVisible({
      timeout: 15_000,
    });

    await expect(successMessage).toBeVisible();
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
