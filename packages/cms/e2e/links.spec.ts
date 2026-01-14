import { expect, test } from "@playwright/test";

test.describe("Link Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to an issue page
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    // Navigate to first issue
    const firstIssue = page.locator('a[href^="/issue/"]').first();
    await firstIssue.click();
    // Wait for issue data to load
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });
  });

  test("shows add link input on issue page", async ({ page }) => {
    const urlInput = page.getByPlaceholder("Paste URL to add link...");
    await expect(urlInput).toBeVisible();

    // Use exact: true to avoid matching "Add Topic" or draggable buttons
    const addButton = page.getByRole("button", { exact: true, name: "Add" });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled(); // disabled when no URL
  });

  test("can add a new link via URL", async ({ page }) => {
    const urlInput = page.getByPlaceholder("Paste URL to add link...");
    await urlInput.fill("https://example.com/test-link");

    const addButton = page.getByRole("button", { exact: true, name: "Add" });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Should clear input after adding
    await expect(urlInput).toHaveValue("");
  });

  test("shows unassigned section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Unassigned" })).toBeVisible();
    // Should show link count next to Unassigned heading
    await expect(page.getByText(/\d+ links/).first()).toBeVisible();
  });

  test("link card has title, description, and URL fields", async ({ page }) => {
    // Wait for links to load - look for any link card
    const linkCard = page.locator('[aria-label="Link title"]').first();

    // If there are links, check structure
    const count = await linkCard.count();
    if (count > 0) {
      await expect(linkCard).toBeVisible();
      const descField = page.locator('[aria-label="Link description"]').first();
      await expect(descField).toBeVisible();
      const urlField = page.locator('[aria-label="Link URL"]').first();
      await expect(urlField).toBeVisible();
    }
  });

  test("can edit link title inline", async ({ page }) => {
    const titleInput = page.locator('[aria-label="Link title"]').first();
    const count = await titleInput.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await titleInput.click();
    await titleInput.fill("Edited Title");

    // Should show unsaved changes bar
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();
  });

  test("shows save/discard buttons when changes pending", async ({ page }) => {
    const titleInput = page.locator('[aria-label="Link title"]').first();
    const count = await titleInput.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await titleInput.click();
    await titleInput.fill("Changed Title");

    // Should show action buttons
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Discard" })).toBeVisible();
  });

  test("can discard changes", async ({ page }) => {
    const titleInput = page.locator('[aria-label="Link title"]').first();
    const count = await titleInput.count();
    if (count === 0) {
      test.skip();
      return;
    }

    const originalValue = await titleInput.inputValue();
    await titleInput.click();
    await titleInput.fill("Changed Title");

    await page.getByRole("button", { name: "Discard" }).click();

    // Unsaved bar should disappear
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible();
    // Value should be restored
    await expect(titleInput).toHaveValue(originalValue);
  });

  test("link has delete button", async ({ page }) => {
    const deleteButton = page.locator('[aria-label="Delete link"]').first();
    const count = await deleteButton.count();
    if (count > 0) {
      // Button visible on hover, force visibility check
      await expect(deleteButton).toBeAttached();
    }
  });

  test("link has topic assignment button", async ({ page }) => {
    const topicButton = page.locator('[aria-label="Assign to topic"]').first();
    const count = await topicButton.count();
    if (count > 0) {
      await expect(topicButton).toBeAttached();
    }
  });
});
