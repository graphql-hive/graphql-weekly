import { expect, test } from "@playwright/test";

import { CMS_URL } from "../urls.ts";

test.describe("Curate Fresh Issue", () => {
  test.use({ storageState: "src/.auth/user.json" });
  test("create issue, add link, edit metadata, save, verify persistence", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testTopicName = `Featured ${timestamp}`;
    const testLinkTitle = `Test Article ${timestamp}`;
    const testLinkDesc = `Description ${timestamp}`;

    // 1. Create new issue from index
    await page.goto(CMS_URL);
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

    // 2. Navigate to the new issue - wait for real ID (not temp-xxx)
    const newIssueLink = page
      .locator('a[href^="/issue/"]')
      .filter({ hasText: `#${issueNum}` })
      .first();
    await expect(async () => {
      const href = await newIssueLink.getAttribute("href");
      expect(href).not.toContain("temp-");
    }).toPass({ timeout: 10_000 });
    await newIssueLink.click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    // 3. Add a link via URL
    const testUrl = `https://example.com/curate-test-${timestamp}`;
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
    const addLinkBtn = page.getByRole("button", { exact: true, name: "Add" });
    await addLinkBtn.click();
    await createLinkResponse;

    // Wait for AllLinks refetch to include our new link with real ID
    await page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      const allLinks = body?.data?.allLinks;
      return (
        Array.isArray(allLinks) &&
        allLinks.some((l: { id: string }) => l.id === createdLinkId)
      );
    });
    await expect(linkInput).toHaveValue("");

    // Wait for our specific link to appear in Unassigned
    const unassignedSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Unassigned" }),
    });
    const ourLinkCard = unassignedSection.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(ourLinkCard).toBeVisible({ timeout: 10_000 });

    // 4. Create a topic (for coverage, even though we can't assign links to it yet)
    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(testTopicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown

    const addTopicBtn = page.getByRole("button", { name: "Add Topic" });
    await addTopicBtn.click();
    await expect(topicInput).toHaveValue("");
    await expect(
      page.getByRole("heading", { name: testTopicName }),
    ).toBeVisible({ timeout: 10_000 });

    // 5. Edit the link's title and description - target our specific link
    const linkCard = ourLinkCard.locator("xpath=ancestor::*[@role='button']");
    const titleInput = linkCard.locator('[aria-label="Link title"]');
    await titleInput.click();
    await titleInput.fill(testLinkTitle);

    const descInput = linkCard.locator('[aria-label="Link description"]');
    await descInput.click();
    await descInput.fill(testLinkDesc);

    // Verify unsaved changes indicator
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // 6. Wait for Save button to be enabled and save
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
      timeout: 15_000,
    });

    // 7. Refresh and verify persistence
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    // Topic should still exist
    await expect(
      page.getByRole("heading", { name: testTopicName }),
    ).toBeVisible();

    // Link should have persisted title and description - find by URL
    const persistedLinkCard = page
      .locator(`[aria-label="Link URL"][value="${testUrl}"]`)
      .locator("xpath=ancestor::*[@role='button']");
    await expect(persistedLinkCard).toBeVisible({ timeout: 10_000 });

    const persistedTitle = persistedLinkCard.locator(
      '[aria-label="Link title"]',
    );
    await expect(persistedTitle).toHaveValue(testLinkTitle);

    const persistedDesc = persistedLinkCard.locator(
      '[aria-label="Link description"]',
    );
    await expect(persistedDesc).toHaveValue(testLinkDesc);
  });

  test("can add multiple links", async ({ page }) => {
    const timestamp = Date.now();

    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible();

    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const unassignedSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Unassigned" }),
    });
    const initialLinkCount = await unassignedSection
      .locator('[aria-label="Link title"]')
      .count();

    // Add two links - wait for first to appear before adding second
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    await linkInput.fill(`https://example.com/article-1-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");
    // Wait for first link to appear in DOM
    await expect(
      unassignedSection.locator('[aria-label="Link title"]'),
    ).toHaveCount(initialLinkCount + 1, { timeout: 10_000 });

    await linkInput.fill(`https://example.com/article-2-${timestamp}`);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    // Verify links were added (mutation + refetch can be slow)
    await expect(async () => {
      const newCount = await unassignedSection
        .locator('[aria-label="Link title"]')
        .count();
      expect(newCount).toBeGreaterThanOrEqual(initialLinkCount + 2);
    }).toPass({ timeout: 10_000 });
  });
});
