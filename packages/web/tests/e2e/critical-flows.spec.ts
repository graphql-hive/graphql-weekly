import { expect, test } from "@playwright/test";

test.describe("GraphQL Weekly", () => {
  test("homepage displays latest issue", async ({ page }) => {
    await page.goto("/");

    // Main heading visible
    await expect(
      page.getByRole("heading", { name: /graphql weekly/i }),
    ).toBeVisible();

    // Issue content loaded (topics section)
    await expect(page.getByRole("link", { name: /articles/i })).toBeVisible();
  });

  test("newsletter subscription flow", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.getByPlaceholder(/email/i);
    const nameInput = page.getByPlaceholder(/name/i);

    await expect(emailInput).toBeVisible();
    await expect(nameInput).toBeVisible();

    // Fill form
    const timestamp = Date.now();
    await nameInput.fill(`Test User ${timestamp}`);
    await emailInput.fill(`test+${timestamp}@example.com`);

    // Submit
    await page.getByRole("button", { name: /subscribe/i }).click();

    // Wait for success message
    await expect(page.getByText(/successfully added/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("submit link modal opens and has required fields", async ({ page }) => {
    await page.goto("/");

    // Open modal via header button
    await page.getByRole("button", { name: /submit a link/i }).first().click();

    // Dialog visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Required fields present
    await expect(dialog.getByPlaceholder(/title/i)).toBeVisible();
    await expect(dialog.getByPlaceholder(/url/i)).toBeVisible();
    await expect(dialog.getByPlaceholder(/name/i)).toBeVisible();
    await expect(dialog.getByPlaceholder(/email/i)).toBeVisible();

    // Close modal
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("topic navigation works", async ({ page }) => {
    await page.goto("/");

    // Click on a topic link in sidebar/content
    const topicLink = page.getByRole("link", { name: /articles/i }).first();
    await topicLink.click();

    // Should navigate to topic page
    await expect(page).toHaveURL(/\/topic\//);

    // Topic page has content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("issue navigation works", async ({ page }) => {
    await page.goto("/");

    // Find and click on an issue link in sidebar
    const issueLink = page.getByRole("link", { name: /issue #\d+/i }).first();
    const issueText = await issueLink.textContent();
    await issueLink.click();

    // Should navigate to issue page
    await expect(page).toHaveURL(/\/issues\/\d+/);

    // Issue content visible
    await expect(
      page.getByRole("heading", { name: new RegExp(issueText || "", "i") }),
    ).toBeVisible();
  });
});
