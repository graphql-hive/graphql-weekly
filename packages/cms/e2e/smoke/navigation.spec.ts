import { expect, test } from "@playwright/test";

test.describe("Navigation Smoke Tests", () => {
  test("index page loads with issue list (public)", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("GraphQL Weekly")).toBeVisible();
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const issueLinks = page.locator('a[href^="/issue/"]');
    await expect(issueLinks.first()).toBeVisible();
  });
});

test.describe("Navigation (authenticated)", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("can navigate to issue detail and back", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const firstIssue = page.locator('a[href^="/issue/"]').first();
    await firstIssue.click();
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("heading", { name: "Unassigned" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Paste URL to add link..."),
    ).toBeVisible();
    await expect(page.getByPlaceholder("New topic name...")).toBeVisible();

    await page.locator('a[href="/"]').click();
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });
});
