import { expect, test } from "@playwright/test";

test.describe("Topic Organization", () => {
  test.use({ storageState: "e2e/.auth/user.json" });
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });

    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("create topic and verify it persists", async ({ page }) => {
    const timestamp = Date.now();
    const topicName = `Test Topic ${timestamp}`;

    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(topicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown

    const addTopicBtn = page.getByRole("button", { name: "Add Topic" });
    await addTopicBtn.click();

    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible({
      timeout: 10_000,
    });

    // Refresh and verify persistence
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible();
  });

  test("reorder topics and verify persistence", async ({ page }) => {
    const timestamp = Date.now();
    const topic1 = `Alpha ${timestamp}`;
    const topic2 = `Beta ${timestamp}`;

    // Create two topics
    const topicInput = page.getByPlaceholder("New topic name...");
    const addTopicBtn = page.getByRole("button", { name: "Add Topic" });

    await topicInput.fill(topic1);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown
    await addTopicBtn.click();
    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topic1 })).toBeVisible({
      timeout: 10_000,
    });

    await topicInput.fill(topic2);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown
    await addTopicBtn.click();
    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topic2 })).toBeVisible({
      timeout: 10_000,
    });

    // Get topic header divs (role="group") for position checking
    const topic1Header = page.locator('[role="group"]').filter({
      has: page.getByRole("heading", { name: topic1 }),
    });
    const topic2Header = page.locator('[role="group"]').filter({
      has: page.getByRole("heading", { name: topic2 }),
    });

    const topic1Box = await topic1Header.boundingBox();
    const topic2Box = await topic2Header.boundingBox();
    expect(topic1Box).toBeTruthy();
    expect(topic2Box).toBeTruthy();

    // Determine which is first (lower Y value)
    const topic1IsFirst = topic1Box!.y < topic2Box!.y;
    const firstHeader = topic1IsFirst ? topic1Header : topic2Header;

    // Hover on header to reveal move buttons
    await firstHeader.hover();

    // Wait for move button to be visible and enabled
    const moveDownBtn = firstHeader.locator('[title="Move down"]');
    await expect(moveDownBtn).toBeVisible();
    await expect(moveDownBtn).toBeEnabled();
    await moveDownBtn.click();

    // Wait for swap - check via bounding box (topic moves are saved immediately)
    await expect(async () => {
      const newTopic1Box = await topic1Header.boundingBox();
      const newTopic2Box = await topic2Header.boundingBox();
      // After moving down, the first topic should now have higher Y
      if (topic1IsFirst) {
        expect(newTopic1Box!.y).toBeGreaterThan(newTopic2Box!.y);
      } else {
        expect(newTopic2Box!.y).toBeGreaterThan(newTopic1Box!.y);
      }
    }).toPass({ timeout: 10_000 });

    // Refresh and verify persistence
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const persistedTopic1Box = await topic1Header.boundingBox();
    const persistedTopic2Box = await topic2Header.boundingBox();
    if (topic1IsFirst) {
      expect(persistedTopic1Box!.y).toBeGreaterThan(persistedTopic2Box!.y);
    } else {
      expect(persistedTopic2Box!.y).toBeGreaterThan(persistedTopic1Box!.y);
    }
  });

  test("remove topic from issue", async ({ page }) => {
    const timestamp = Date.now();
    const topicName = `Removable ${timestamp}`;

    // Create a topic
    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(topicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown
    await page.getByRole("button", { name: "Add Topic" }).click();
    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible({
      timeout: 10_000,
    });

    // Set up dialog handler BEFORE clicking
    page.once("dialog", (dialog) => dialog.accept());

    // Hover to reveal remove button
    const topicSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: topicName }),
    });
    await topicSection.hover();

    // Click remove
    const removeBtn = topicSection.locator('[title="Remove topic from issue"]');
    await removeBtn.click();

    // Wait for topic to be removed
    await expect(
      page.getByRole("heading", { name: topicName }),
    ).not.toBeVisible({
      timeout: 5000,
    });

    // Refresh and verify it's still gone
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: topicName }),
    ).not.toBeVisible();
  });

  // TODO: dnd-kit drag simulation doesn't work with Playwright's mouse/keyboard APIs
  // Manual testing required to verify drag-to-topic functionality
  test.skip("drag link to topic and verify persistence", async ({ page }) => {
    const timestamp = Date.now();
    const topicName = `Drag Target ${timestamp}`;
    const testUrl = `https://example.com/drag-test-${timestamp}`;

    // Create a topic
    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(topicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown
    await page.getByRole("button", { name: "Add Topic" }).click();
    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible({
      timeout: 10_000,
    });

    // Add a link to Unassigned
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear in Unassigned
    const linkUrlInput = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkUrlInput).toBeVisible({ timeout: 5000 });

    // Find the link card (sortable item with keyboard support)
    const linkCard = linkUrlInput.locator("xpath=ancestor::*[@role='button']");
    await expect(linkCard).toBeVisible();

    // Find the topic section (drop target)
    const topicSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: topicName }),
    });

    // Use keyboard-based drag (dnd-kit KeyboardSensor)
    // Focus the sortable item and use Space to pick up, arrows to move, Space to drop
    await linkCard.focus();
    await page.keyboard.press("Space"); // Pick up
    await page.keyboard.press("ArrowDown"); // Move to next container
    await page.keyboard.press("ArrowDown"); // Move again if needed
    await page.keyboard.press("Space"); // Drop

    // Verify link is now in topic section (optimistic update)
    await expect(async () => {
      const linkInTopic = topicSection.locator(
        `[aria-label="Link URL"][value="${testUrl}"]`,
      );
      await expect(linkInTopic).toBeVisible();
    }).toPass({ timeout: 5000 });

    // Verify unsaved changes indicator
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Save
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh and verify persistence
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    // Verify link is still in topic
    const persistedTopicSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: topicName }),
    });
    await expect(
      persistedTopicSection.locator(
        `[aria-label="Link URL"][value="${testUrl}"]`,
      ),
    ).toBeVisible();
  });
});
