import { expect, test } from "@playwright/test";

import { graphqlMutation } from "../helpers";

test.describe("Delete Workflow", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  let issueId: string;

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext({
      storageState: "e2e/.auth/user.json",
    });

    // Use unique high number to avoid collisions
    const issueNumber = 90_000 + Math.floor(Math.random() * 10_000);
    const json = await graphqlMutation(
      request,
      `mutation { createIssue(title: "Delete Workflow Test", number: ${issueNumber}, published: false) { id } }`,
    );
    expect(json.errors).toBeUndefined();
    issueId = json.data?.createIssue?.id as string;
    expect(issueId).toBeTruthy();

    await request.dispose();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/issue/${issueId}`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });
  });

  test("delete link and verify persistence", async ({ page }) => {
    const timestamp = Date.now();
    const testUrl = `https://example.com/delete-${timestamp}`;

    // Add a link we can delete
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear
    const linkUrlInput = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkUrlInput).toBeVisible({ timeout: 10_000 });

    // Find the link card containing our test URL and hover
    const linkCard = page.getByRole("button").filter({
      has: page.locator(`[aria-label="Link URL"][value="${testUrl}"]`),
    });
    await linkCard.hover();

    // Click delete button within this card
    await linkCard.locator('[aria-label="Delete link"]').click();

    // Verify unsaved changes appears
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Wait for Save button to be enabled (indicates createLinkMutation completed)
    const saveBtn = page.getByRole("button", { name: "Save" });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });

    // Save the deletion
    await saveBtn.click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh and verify link is gone
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });

    await expect(
      page.locator(`[aria-label="Link URL"][value="${testUrl}"]`),
    ).not.toBeVisible();
  });

  test("can cancel deletion via discard", async ({ page }) => {
    const timestamp = Date.now();
    const testUrl = `https://example.com/discard-${timestamp}`;

    // Add a link
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear
    const linkUrlInput = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkUrlInput).toBeVisible({ timeout: 10_000 });

    // Find the link card and delete it
    const linkCard = page.getByRole("button").filter({
      has: page.locator(`[aria-label="Link URL"][value="${testUrl}"]`),
    });
    await linkCard.hover();
    await linkCard.locator('[aria-label="Delete link"]').click();
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Discard instead of save
    await page.getByRole("button", { exact: true, name: "Discard" }).click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible();

    // Link should still be there
    await expect(linkUrlInput).toBeVisible();
  });
});
