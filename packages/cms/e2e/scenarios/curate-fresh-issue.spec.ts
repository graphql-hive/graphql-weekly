import { expect, test } from "@playwright/test";

test.describe("Curate Fresh Issue", () => {
  test.use({ storageState: "e2e/.auth/user.json" });
  test("create issue, add link, edit metadata, save, verify persistence", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testTopicName = `Featured ${timestamp}`;
    const testLinkTitle = `Test Article ${timestamp}`;
    const testLinkDesc = `Description ${timestamp}`;

    // 1. Create new issue from index
    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    const issueLinks = page.locator('a[href^="/issue/"]');
    const initialCount = await issueLinks.count();

    const issueInput = page.getByPlaceholder("Number");
    const issueNum = await issueInput.inputValue();

    const addIssueBtn = page.getByRole("button", { name: "Add Issue" });
    await expect(addIssueBtn).toBeEnabled();

    // Retry click until issue is created (handles hydration)
    await expect(async () => {
      await addIssueBtn.click();
      const newCount = await issueLinks.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 5000 });

    // 2. Navigate to the new issue
    const newIssueLink = page.getByText(`#${issueNum}`);
    await expect(newIssueLink).toBeVisible();
    await newIssueLink.click();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    // 3. Add a link via URL
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill("https://graphql.org/learn/");

    const addLinkBtn = page.getByRole("button", { exact: true, name: "Add" });
    await addLinkBtn.click();
    await expect(linkInput).toHaveValue("");

    // Wait for link to appear in Unassigned
    const unassignedSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Unassigned" }),
    });
    await expect(
      unassignedSection.locator('[aria-label="Link URL"]').first(),
    ).toBeVisible({ timeout: 5000 });

    // 4. Create a topic (for coverage, even though we can't assign links to it yet)
    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(testTopicName);

    const addTopicBtn = page.getByRole("button", { name: "Add Topic" });
    await addTopicBtn.click();
    await expect(topicInput).toHaveValue("");
    await expect(
      page.getByRole("heading", { name: testTopicName }),
    ).toBeVisible();

    // 5. Edit the link's title and description
    const titleInput = unassignedSection
      .locator('[aria-label="Link title"]')
      .first();
    await titleInput.click();
    await titleInput.fill(testLinkTitle);

    const descInput = unassignedSection
      .locator('[aria-label="Link description"]')
      .first();
    await descInput.click();
    await descInput.fill(testLinkDesc);

    // Verify unsaved changes indicator
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // 6. Save all changes
    const saveBtn = page.getByRole("button", { name: "Save" });
    await saveBtn.click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // 7. Refresh and verify persistence
    await page.reload();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    // Topic should still exist
    await expect(
      page.getByRole("heading", { name: testTopicName }),
    ).toBeVisible();

    // Link should have persisted title and description
    const persistedTitle = page.locator('[aria-label="Link title"]').first();
    await expect(persistedTitle).toHaveValue(testLinkTitle);

    const persistedDesc = page
      .locator('[aria-label="Link description"]')
      .first();
    await expect(persistedDesc).toHaveValue(testLinkDesc);
  });

  test("can add multiple links", async ({ page }) => {
    const timestamp = Date.now();

    await page.goto("/");
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    const unassignedSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Unassigned" }),
    });
    const initialLinkCount = await unassignedSection
      .locator('[aria-label="Link title"]')
      .count();

    // Add two links
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    await linkInput.fill(`https://example.com/article-1-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    await linkInput.fill(`https://example.com/article-2-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    // Verify links were added
    await expect(async () => {
      const newCount = await unassignedSection
        .locator('[aria-label="Link title"]')
        .count();
      expect(newCount).toBeGreaterThanOrEqual(initialLinkCount + 2);
    }).toPass({ timeout: 5000 });
  });
});
