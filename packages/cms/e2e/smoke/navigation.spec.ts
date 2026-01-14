import { expect, test } from "@playwright/test";

test.describe("Navigation Smoke Tests", () => {
  test("index page loads with issue list", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("GraphQL Weekly")).toBeVisible();
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const issueLinks = page.locator('a[href^="/issue/"]');
    await expect(issueLinks.first()).toBeVisible();
  });

  test("can navigate to issue detail and back", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    // Navigate to issue
    const firstIssue = page.locator('a[href^="/issue/"]').first();
    await firstIssue.click();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    // Verify issue page structure
    await expect(
      page.getByRole("heading", { name: "Unassigned" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Paste URL to add link..."),
    ).toBeVisible();
    await expect(page.getByPlaceholder("New topic name...")).toBeVisible();

    // Navigate back
    await page.locator('a[href="/"]').click();
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });
});
