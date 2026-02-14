import { expect, test } from "@playwright/test";

import { createFreshIssue } from "../util";

test.describe("Save Issue Links", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("edit multiple links and save persists all changes in one mutation", async ({
    page,
  }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const url1 = `https://example.com/save-test-1-${timestamp}`;
    const url2 = `https://example.com/save-test-2-${timestamp}`;
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    // Add two links
    await linkInput.fill(url1);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    await linkInput.fill(url2);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    // Wait for both links to appear with real IDs
    const link1Url = page.locator(`[aria-label="Link URL"][value="${url1}"]`);
    const link2Url = page.locator(`[aria-label="Link URL"][value="${url2}"]`);
    await expect(link1Url).toBeVisible({ timeout: 10_000 });
    await expect(link2Url).toBeVisible({ timeout: 10_000 });

    // Edit both links
    const link1Card = link1Url.locator("xpath=ancestor::*[@role='button']");
    const link2Card = link2Url.locator("xpath=ancestor::*[@role='button']");

    const title1 = `Edited First ${timestamp}`;
    const title2 = `Edited Second ${timestamp}`;

    await link1Card.locator('[aria-label="Link title"]').fill(title1);
    await link2Card.locator('[aria-label="Link title"]').fill(title2);

    // Should show 2 unsaved changes
    await expect(page.getByText(/2 unsaved/)).toBeVisible();

    // Save — should use saveIssueLinks (single mutation)
    const saveBtn = page.getByRole("button", { exact: true, name: "Save" });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });

    await saveBtn.click();
    await expect(page.getByText(/unsaved/)).not.toBeVisible({ timeout: 15_000 });

    // Verify persistence after reload
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const persistedLink1 = page.locator(
      `[aria-label="Link URL"][value="${url1}"]`,
    );
    await expect(persistedLink1).toBeVisible({ timeout: 10_000 });

    const persistedCard1 = persistedLink1.locator(
      "xpath=ancestor::*[@role='button']",
    );
    await expect(
      persistedCard1.locator('[aria-label="Link title"]'),
    ).toHaveValue(title1);

    const persistedLink2 = page.locator(
      `[aria-label="Link URL"][value="${url2}"]`,
    );
    const persistedCard2 = persistedLink2.locator(
      "xpath=ancestor::*[@role='button']",
    );
    await expect(
      persistedCard2.locator('[aria-label="Link title"]'),
    ).toHaveValue(title2);
  });
});
