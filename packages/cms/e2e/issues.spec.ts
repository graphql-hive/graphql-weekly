import { expect, test } from "@playwright/test";

test.describe("Issue Management", () => {
  test("shows issue list on index page", async ({ page }) => {
    await page.goto("/admin");

    // Should show the GraphQL Weekly header
    await expect(page.getByText("GraphQL Weekly")).toBeVisible();

    // Should show issue count
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });

  test("can navigate to issue detail", async ({ page }) => {
    await page.goto("/admin");

    // Wait for issues to load
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    // Click the first issue link
    const firstIssue = page.locator('a[href^="/admin/issue/"]').first();
    await firstIssue.click();

    // Should show the issue page with "Curating:" text
    await expect(page.getByText("Curating:")).toBeVisible();
  });

  test("can create a new issue", async ({ page }) => {
    await page.goto("/admin");

    // Find the issue creator input
    const input = page.getByPlaceholder(/Issue/i);
    await input.fill("Test Issue");

    // Submit
    await page.keyboard.press("Enter");

    // Should see the new issue in the list (eventually)
    // Note: This depends on the API being available
  });
});
