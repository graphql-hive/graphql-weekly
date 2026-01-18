import { expect, test } from "@playwright/test";

test.describe("Edit and Persist", () => {
  test.use({ storageState: "e2e/.auth/user.json" });
  test.beforeEach(async ({ page }) => {
    // Navigate to first issue
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });
  });

  test("edit link metadata and verify persistence after refresh", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const newTitle = `Edited Title ${timestamp}`;
    const newDescription = `Edited description ${timestamp}`;

    // First, add a fresh link to ensure we have something to edit
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(`https://example.com/edit-test-${timestamp}`);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for the link to appear
    await expect(page.locator('[aria-label="Link title"]').first()).toBeVisible(
      {
        timeout: 5000,
      },
    );

    // Edit the title
    const titleInput = page.locator('[aria-label="Link title"]').first();
    await titleInput.click();
    await titleInput.fill(newTitle);

    // Edit the description
    const descInput = page.locator('[aria-label="Link description"]').first();
    await descInput.click();
    await descInput.fill(newDescription);

    // Verify unsaved changes count
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();
    // Should show 1 unsaved change (link edits are batched per link)
    await expect(page.getByText(/1 unsaved/)).toBeVisible();

    // Save
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh
    await page.reload();
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });

    // Verify edits persisted
    const persistedTitle = page.locator('[aria-label="Link title"]').first();
    await expect(persistedTitle).toHaveValue(newTitle);

    const persistedDesc = page
      .locator('[aria-label="Link description"]')
      .first();
    await expect(persistedDesc).toHaveValue(newDescription);
  });

  test("discard reverts all changes", async ({ page }) => {
    // Get original values
    const titleInput = page.locator('[aria-label="Link title"]').first();
    const count = await titleInput.count();
    if (count === 0) {
      // Add a link first
      const linkInput = page.getByPlaceholder("Paste URL to add link...");
      await linkInput.fill(`https://example.com/discard-test-${Date.now()}`);
      await page.getByRole("button", { exact: true, name: "Add" }).click();
      await expect(
        page.locator('[aria-label="Link title"]').first(),
      ).toBeVisible({
        timeout: 5000,
      });
    }

    const originalTitle = await page
      .locator('[aria-label="Link title"]')
      .first()
      .inputValue();

    // Make edits
    await page
      .locator('[aria-label="Link title"]')
      .first()
      .fill("CHANGED TITLE");
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Discard
    await page.getByRole("button", { exact: true, name: "Discard" }).click();

    // Verify unsaved bar gone
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible();

    // Verify value reverted
    await expect(page.locator('[aria-label="Link title"]').first()).toHaveValue(
      originalTitle,
    );
  });

  test("multiple edits accumulate in unsaved count", async ({ page }) => {
    const timestamp = Date.now();

    // Add two links
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    await linkInput.fill(`https://example.com/multi-1-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    await linkInput.fill(`https://example.com/multi-2-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    // Wait for both links to appear
    await expect(async () => {
      const count = await page.locator('[aria-label="Link title"]').count();
      expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 5000 });

    // Edit first link
    await page.locator('[aria-label="Link title"]').first().fill("Edit 1");
    await expect(page.getByText(/1 unsaved/)).toBeVisible();

    // Edit second link
    await page.locator('[aria-label="Link title"]').nth(1).fill("Edit 2");
    await expect(page.getByText(/2 unsaved/)).toBeVisible();
  });
});
