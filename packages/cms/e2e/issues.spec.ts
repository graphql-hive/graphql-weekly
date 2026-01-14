import { expect, test } from "@playwright/test";

test.describe("Issue Management", () => {
  test("shows issue list on index page", async ({ page }) => {
    await page.goto("/admin");

    // Should show the GraphQL Weekly header
    await expect(page.getByText("GraphQL Weekly")).toBeVisible();

    // Should show issue count
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });

  test("shows issue cards with titles", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    // Issue links should exist
    const issueLinks = page.locator('a[href^="/admin/issue/"]');
    const count = await issueLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("can navigate to issue detail", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const firstIssue = page.locator('a[href^="/admin/issue/"]').first();
    await firstIssue.click();

    // Wait for loading to complete - "Curating:" appears when issue data loads
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });
  });

  test("issue detail shows navbar with back link", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const firstIssue = page.locator('a[href^="/admin/issue/"]').first();
    await firstIssue.click();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    // Should have logo/link back to index
    const logo = page.locator('a[href="/admin"]');
    await expect(logo).toBeVisible();
  });

  test("can create a new issue", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    // Issue creator input has placeholder "Number"
    const input = page.getByPlaceholder("Number");
    const issueNum = String(Date.now()).slice(-4);
    await input.clear();
    await input.fill(issueNum);

    // Click Add Issue button
    await page.getByRole("button", { name: "Add Issue" }).click();

    // Wait for new issue to appear in list
    await expect(page.getByText(`#${issueNum}`)).toBeVisible({ timeout: 5000 });
  });

  test("can navigate back from issue detail to index", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const firstIssue = page.locator('a[href^="/admin/issue/"]').first();
    await firstIssue.click();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    // Click logo to go back
    await page.locator('a[href="/admin"]').click();

    // Should be back on index with issue list
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });
});
