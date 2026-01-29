import { expect, type Page } from "@playwright/test";

import { CMS_URL } from "./urls.ts";

/**
 * Creates a fresh issue and navigates to it.
 * Provides test isolation - each test gets its own clean issue.
 */
export async function createFreshIssue(page: Page): Promise<string> {
  await page.goto(CMS_URL);
  await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });

  const issueLinks = page.locator('a[href^="/issue/"]');
  const initialCount = await issueLinks.count();

  const issueInput = page.getByPlaceholder("Number");
  const issueNum = await issueInput.inputValue();

  const addIssueBtn = page.getByRole("button", { name: "Add Issue" });
  await expect(addIssueBtn).toBeEnabled();

  // Retry click until issue is created (handles hydration)
  await expect(async () => {
    await addIssueBtn.click();
    const newCount = await issueLinks.count();
    expect(newCount).toBeGreaterThan(initialCount);
  }).toPass({ timeout: 5000 });

  // Navigate to the new issue - wait for real ID (not temp-xxx)
  const newIssueLink = page
    .locator('a[href^="/issue/"]')
    .filter({ hasText: `#${issueNum}` })
    .first();

  await expect(async () => {
    const href = await newIssueLink.getAttribute("href");
    expect(href).not.toContain("temp-");
  }).toPass({ timeout: 10_000 });

  await newIssueLink.click();
  await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
    timeout: 15_000,
  });

  return issueNum;
}
