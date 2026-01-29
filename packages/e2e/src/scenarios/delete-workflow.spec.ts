import { expect, test } from "@playwright/test";

import { createFreshIssue } from "../util";

test.describe("Delete Workflow", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("delete link and verify persistence", async ({ page }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const testUrl = `https://example.com/delete-${timestamp}`;

    // Add a link we can delete
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);

    // Wait for createLink mutation AND the refetch to complete
    let createdLinkId: string | null = null;
    const createLinkResponse = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      if (body?.data?.createLink?.id) {
        createdLinkId = body.data.createLink.id;
        return true;
      }
      return false;
    });
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await createLinkResponse;

    // Wait for UnassignedLinks refetch to include our new link with real ID
    await page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      const unassignedLinks = body?.data?.unassignedLinks;
      return (
        Array.isArray(unassignedLinks) &&
        unassignedLinks.some((l: { id: string }) => l.id === createdLinkId)
      );
    });
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear
    const linkUrlInput = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkUrlInput).toBeVisible({ timeout: 10_000 });

    // Find the link card containing our test URL and hover
    const linkCard = linkUrlInput.locator("xpath=ancestor::*[@role='button']");
    await linkCard.hover();

    // Click delete button within this card
    await linkCard.locator('[aria-label="Delete link"]').click();

    // Verify unsaved changes appears
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Wait for Save button to be enabled (indicates createLinkMutation completed)
    const saveBtn = page.getByRole("button", { name: "Save" });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });

    // Save and wait for successful GraphQL response (no errors)
    const saveResponsePromise = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      if (res.status() !== 200) return false;
      const body = await res.json().catch(() => null);
      return body?.data && !body?.errors;
    });
    await saveBtn.click();
    await saveResponsePromise;
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh and verify link is gone
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.locator(`[aria-label="Link URL"][value="${testUrl}"]`),
    ).not.toBeVisible();
  });

  test("can cancel deletion via discard", async ({ page }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const testUrl = `https://example.com/discard-${timestamp}`;

    // Add a link
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);

    // Wait for createLink mutation AND the refetch to complete
    let createdLinkId: string | null = null;
    const createLinkResponse = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      if (body?.data?.createLink?.id) {
        createdLinkId = body.data.createLink.id;
        return true;
      }
      return false;
    });
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await createLinkResponse;

    // Wait for UnassignedLinks refetch to include our new link with real ID
    await page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      const unassignedLinks = body?.data?.unassignedLinks;
      return (
        Array.isArray(unassignedLinks) &&
        unassignedLinks.some((l: { id: string }) => l.id === createdLinkId)
      );
    });
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear
    const linkUrlInput = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkUrlInput).toBeVisible({ timeout: 10_000 });

    // Find the link card and delete it
    const linkCard = linkUrlInput.locator("xpath=ancestor::*[@role='button']");
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
