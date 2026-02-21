import { expect, test } from "@playwright/test";

import { CMS_URL, WEB_URL } from "../urls.ts";
import { createFreshIssue } from "../util";

test.describe("Topic Autocomplete & New Features", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("topic autocomplete shows suggestions from existing topics", async ({
    page,
  }) => {
    // Navigate to an existing issue (seeded data has "Articles" topic)
    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });

    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.scrollIntoViewIfNeeded();

    // Wait for the TopTopicTitles query to load (input loses data-list-empty)
    await expect(async () => {
      const isEmpty = await topicInput.getAttribute("data-list-empty");
      expect(isEmpty).toBeNull();
    }).toPass({ timeout: 10_000 });

    // Click to open popup (force bypasses astro-dev-toolbar overlay)
    await topicInput.click({ force: true });

    // Autocomplete popup should open
    const popup = page.locator("[role='listbox']");
    await expect(popup).toBeVisible({ timeout: 5000 });

    // Should have at least one suggestion item
    const items = popup.locator("[role='option']");
    await expect(items.first()).toBeVisible();

    // Selecting a suggestion should fill the input
    const firstSuggestionText = await items.first().textContent();
    await items.first().click();

    await expect(topicInput).toHaveValue(firstSuggestionText!.trim());
  });

  test("topic autocomplete filters suggestions as you type", async ({
    page,
  }) => {
    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.scrollIntoViewIfNeeded();

    // Wait for suggestions to load
    await expect(async () => {
      const isEmpty = await topicInput.getAttribute("data-list-empty");
      expect(isEmpty).toBeNull();
    }).toPass({ timeout: 10_000 });

    await topicInput.click({ force: true });

    const popup = page.locator("[role='listbox']");
    await expect(popup).toBeVisible({ timeout: 5000 });

    const initialCount = await popup.locator("[role='option']").count();
    expect(initialCount).toBeGreaterThan(0);

    // Type a nonsense string that won't match any topic
    await topicInput.fill("zzzznonexistent");

    // Should show "No matching topics" or fewer results
    await expect(async () => {
      const filtered = await popup.locator("[role='option']").count();
      expect(filtered).toBeLessThan(initialCount);
    }).toPass({ timeout: 3000 });
  });

  test("topic autocomplete submits on Enter", async ({ page }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const topicName = `AutoTopic ${timestamp}`;

    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(topicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete dropdown

    // Submit via Enter key instead of clicking Add Topic
    await topicInput.focus();
    await page.keyboard.press("Enter");

    await expect(topicInput).toHaveValue("");
    await expect(page.getByRole("heading", { name: topicName })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("selecting autocomplete suggestion with Enter submits full topic name, not partial", async ({
    page,
  }) => {
    await createFreshIssue(page);

    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.scrollIntoViewIfNeeded();

    // Wait for autocomplete suggestions to load
    await expect(async () => {
      const isEmpty = await topicInput.getAttribute("data-list-empty");
      expect(isEmpty).toBeNull();
    }).toPass({ timeout: 10_000 });

    // Type "a" — should match "Articles" from seed data
    await topicInput.click({ force: true });
    await topicInput.fill("a");

    const popup = page.locator("[role='listbox']");
    await expect(popup).toBeVisible({ timeout: 5000 });

    const articlesOption = popup.locator("[role='option']", {
      hasText: "Articles",
    });
    await expect(articlesOption).toBeVisible();

    // Use arrow keys to highlight "Articles", then press Enter
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // The created topic should be "Articles", not "a"
    await expect(topicInput).toHaveValue("");
    await expect(
      page.getByRole("heading", { name: "Articles" }),
    ).toBeVisible({ timeout: 10_000 });

    // Ensure no topic named "a" was created
    const allHeadings = page.locator("main h2, main h3");
    const headingTexts = await allHeadings.allTextContents();
    expect(headingTexts).not.toContain("a");
  });
});

test.describe("Link Metadata Prefill", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("createLink returns prefilled title and description from URL", async ({
    page,
  }) => {
    await createFreshIssue(page);

    // Use the local public site (guaranteed running in e2e) instead of
    // an external URL that could be down or slow in CI.
    const testUrl = WEB_URL;

    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);

    // Intercept createLink response to check prefilled metadata
    const createLinkResponse = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      return !!body?.data?.createLink?.id;
    });

    await page.getByRole("button", { exact: true, name: "Add" }).click();
    const response = await createLinkResponse;
    const body = await response.json();
    const createdLink = body.data.createLink;

    // The server should have fetched metadata — title should be non-empty
    expect(createdLink.title || createdLink.text).toBeTruthy();

    // After refetch, the link card should show the prefilled title
    await expect(linkInput).toHaveValue("");
    const linkCards = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(linkCards.first()).toBeVisible({ timeout: 10_000 });

    const card = linkCards.first().locator("xpath=ancestor::*[@role='button']");
    const titleInput = card.locator('[aria-label="Link title"]');

    // Title should be prefilled (not empty)
    await expect(async () => {
      const val = await titleInput.inputValue();
      expect(val.length).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });
  });
});

test.describe("Partial Link Updates", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("editing only title preserves description on save", async ({ page }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const testUrl = `https://example.com/partial-${timestamp}`;
    const originalDesc = `Original description ${timestamp}`;
    const newTitle = `New Title ${timestamp}`;

    // Add a link
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);

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

    // Wait for refetch
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

    const ourLinkUrl = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(ourLinkUrl).toBeVisible({ timeout: 5000 });

    const card = ourLinkUrl.locator("xpath=ancestor::*[@role='button']");

    // Fill BOTH title and description first, then save
    const titleInput = card.locator('[aria-label="Link title"]');
    const descInput = card.locator('[aria-label="Link description"]');

    await descInput.click();
    await descInput.fill(originalDesc);
    await titleInput.click();
    await titleInput.fill("Initial Title");

    await expect(page.getByText(/\d+ unsaved/)).toBeVisible({
      timeout: 10_000,
    });
    const saveBtn = page.getByRole("button", { exact: true, name: "Save" });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });

    const saveResponse = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      if (res.status() !== 200) return false;
      const body = await res.json().catch(() => null);
      return body?.data && !body?.errors;
    });
    await saveBtn.click();
    await saveResponse;
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Now edit ONLY the title
    await titleInput.click();
    await titleInput.fill(newTitle);
    await expect(page.getByText(/1 unsaved/)).toBeVisible();

    // Save again
    const saveResponse2 = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      if (res.status() !== 200) return false;
      const body = await res.json().catch(() => null);
      return body?.data && !body?.errors;
    });
    await saveBtn.click();
    await saveResponse2;
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh and verify BOTH title changed and description preserved
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const persistedUrl = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(persistedUrl).toBeVisible({ timeout: 10_000 });

    const persistedCard = persistedUrl.locator(
      "xpath=ancestor::*[@role='button']",
    );
    await expect(
      persistedCard.locator('[aria-label="Link title"]'),
    ).toHaveValue(newTitle);
    await expect(
      persistedCard.locator('[aria-label="Link description"]'),
    ).toHaveValue(originalDesc);
  });
});

test.describe("Table of Contents", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("ToC sidebar shows topics and unassigned section", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1400 });
    await createFreshIssue(page);

    // ToC should be visible in aside
    const toc = page.locator("aside nav");
    await expect(toc).toBeVisible();

    // Should contain an "Unassigned" link
    const unassignedLink = toc.locator('a[href="#unassigned"]');
    await expect(unassignedLink).toBeVisible();
    await expect(unassignedLink).toContainText("Unassigned");

    // Should show link count in parentheses
    await expect(unassignedLink).toContainText(/\(\d+\)/);
  });

  test("ToC updates when topic is added", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1400 });
    await createFreshIssue(page);

    const timestamp = Date.now();
    const topicName = `TocTopic ${timestamp}`;

    const toc = page.locator("aside nav");
    await expect(toc).toBeVisible();

    // Add a topic
    const topicInput = page.getByPlaceholder("New topic name...");
    await topicInput.fill(topicName);
    await page.keyboard.press("Escape"); // Dismiss autocomplete
    await page
      .locator("main")
      .getByRole("button", { exact: true, name: "Add Topic" })
      .click();
    await expect(topicInput).toHaveValue("");

    // Topic should appear in ToC
    await expect(toc.getByText(topicName)).toBeVisible({ timeout: 10_000 });
  });

  test("ToC 'Add topic' button focuses topic input", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1400 });

    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const toc = page.locator("aside nav");
    await expect(toc).toBeVisible();

    // Click the "Add topic" button in the ToC footer
    const addTopicTocBtn = page.locator("aside").getByText("Add topic");
    await addTopicTocBtn.click();

    // The topic input should be focused
    const topicInput = page.getByPlaceholder("New topic name...");
    await expect(topicInput).toBeFocused();
  });

  test("ToC is hidden on narrow viewports", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1024 });

    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const aside = page.locator("aside nav");
    await expect(aside).not.toBeVisible();
  });
});

test.describe("Textarea Auto-resize", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("link description textarea grows with content", async ({ page }) => {
    await createFreshIssue(page);

    const timestamp = Date.now();
    const testUrl = `https://example.com/resize-${timestamp}`;

    // Add a link
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    const ourLink = page.locator(`[aria-label="Link URL"][value="${testUrl}"]`);
    await expect(ourLink).toBeVisible({ timeout: 10_000 });

    const card = ourLink.locator("xpath=ancestor::*[@role='button']");
    const descInput = card.locator('[aria-label="Link description"]');

    // Get initial height
    const initialBox = await descInput.boundingBox();
    expect(initialBox).toBeTruthy();
    const initialHeight = initialBox!.height;

    // Type multi-line content
    await descInput.click();
    await descInput.fill(
      "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8",
    );

    // Height should have grown
    await expect(async () => {
      const newBox = await descInput.boundingBox();
      expect(newBox!.height).toBeGreaterThan(initialHeight);
    }).toPass({ timeout: 3000 });
  });
});

test.describe("Add Button Empty State", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("clicking Add link with empty input focuses the input", async ({
    page,
  }) => {
    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    // Ensure input is empty and not focused
    await expect(linkInput).toHaveValue("");
    await addBtn.click();

    // Input should now be focused
    await expect(linkInput).toBeFocused();
  });

  test("clicking Add Topic with empty input focuses the input", async ({
    page,
  }) => {
    await page.goto(CMS_URL);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href^="/issue/"]').first().click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    const topicInput = page.getByPlaceholder("New topic name...");
    const addTopicBtn = page
      .locator("main")
      .getByRole("button", { exact: true, name: "Add Topic" });

    await expect(topicInput).toHaveValue("");
    await addTopicBtn.click();

    await expect(topicInput).toBeFocused();
  });
});
