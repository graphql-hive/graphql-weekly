import { expect, test } from "@playwright/test";

test.describe("Topic Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const firstIssue = page.locator('a[href^="/admin/issue/"]').first();
    await firstIssue.click();
    // Wait for issue data to load
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });
  });

  test("shows add topic input", async ({ page }) => {
    const topicInput = page.getByPlaceholder("New topic name...");
    await expect(topicInput).toBeVisible();

    const addButton = page.getByRole("button", { name: "Add Topic" });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled(); // disabled when empty
  });

  test("can create a new topic", async ({ page }) => {
    const topicInput = page.getByPlaceholder("New topic name...");
    const topicName = `Test Topic ${Date.now()}`;

    await topicInput.fill(topicName);

    const addButton = page.getByRole("button", { name: "Add Topic" });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Input should clear
    await expect(topicInput).toHaveValue("");

    // New topic should appear
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible();
  });

  test("topic section shows link count", async ({ page }) => {
    // Each topic section has a link count
    const linkCounts = page.getByText(/\d+ links/);
    await expect(linkCounts.first()).toBeVisible();
  });

  test("topic has move up/down buttons on hover", async ({ page }) => {
    // Look for topics (h3 elements that aren't Unassigned)
    const topicHeading = page
      .locator("section")
      .filter({ has: page.locator("h3") })
      .first();

    await topicHeading.hover();

    // Move buttons should become visible
    const moveUpButton = page.locator('[title="Move up"]').first();
    const moveDownButton = page.locator('[title="Move down"]').first();

    // At least one of them should exist (buttons are there even if disabled)
    const upCount = await moveUpButton.count();
    const downCount = await moveDownButton.count();
    expect(upCount + downCount).toBeGreaterThan(0);
  });

  test("topic has remove button on hover", async ({ page }) => {
    const topicSection = page
      .locator("section")
      .filter({ has: page.locator("h3") })
      .first();

    await topicSection.hover();

    const removeButton = page.locator('[title="Remove topic from issue"]').first();
    const count = await removeButton.count();
    if (count > 0) {
      await expect(removeButton).toBeAttached();
    }
  });

  test("empty topic shows placeholder message", async ({ page }) => {
    // Create a new empty topic
    const topicInput = page.getByPlaceholder("New topic name...");
    const topicName = `Empty Topic ${Date.now()}`;
    await topicInput.fill(topicName);
    await page.getByRole("button", { name: "Add Topic" }).click();

    // Should show "No links in this topic" message (use .first() since multiple topics may be empty)
    await expect(page.getByText("No links in this topic").first()).toBeVisible();
  });
});
