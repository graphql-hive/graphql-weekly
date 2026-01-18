import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:2012";

test.describe("Edit and Persist", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  let issueId: string;

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext({
      baseURL: API_URL,
      storageState: "e2e/.auth/user.json",
    });

    const issueNumber = 80_000 + Math.floor(Math.random() * 10_000);
    const res = await request.post(`${API_URL}/graphql`, {
      data: {
        query: `mutation { createIssue(title: "Issue ${issueNumber}", number: ${issueNumber}, published: false) { id } }`,
      },
    });
    const json = await res.json();
    expect(json.errors).toBeUndefined();
    issueId = json.data?.createIssue?.id;
    expect(issueId).toBeTruthy();

    await request.dispose();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/issue/${issueId}`);
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });
  });

  test("edit link metadata and verify persistence after refresh", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testUrl = `https://example.com/edit-test-${timestamp}`;
    const newTitle = `Edited Title ${timestamp}`;
    const newDescription = `Edited description ${timestamp}`;

    // First, add a fresh link to ensure we have something to edit
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for network to settle (mutation + refetch complete) before editing
    // This ensures the link has a real ID from the server, not a temp optimistic ID

    const ourLinkUrl = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(ourLinkUrl).toBeVisible({ timeout: 5000 });

    const linkCard = ourLinkUrl.locator("xpath=ancestor::*[@role='button']");

    // Edit the title
    const titleInput = linkCard.locator('[aria-label="Link title"]');
    await titleInput.click();
    await titleInput.fill(newTitle);

    // Edit the description
    const descInput = linkCard.locator('[aria-label="Link description"]');
    await descInput.click();
    await descInput.fill(newDescription);

    // Verify unsaved changes count
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();
    // Should show 1 unsaved change (link edits are batched per link)
    await expect(page.getByText(/1 unsaved/)).toBeVisible();

    // Wait for Save button to be enabled (indicates createLinkMutation completed)
    const saveBtn = page.getByRole("button", { name: "Save" });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });

    // Save
    await saveBtn.click();
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible({
      timeout: 10_000,
    });

    // Refresh
    await page.reload();
    await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });

    // Verify edits persisted - find by URL
    const persistedLinkUrl = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(persistedLinkUrl).toBeVisible({ timeout: 10_000 });

    const persistedCard = persistedLinkUrl.locator(
      "xpath=ancestor::*[@role='button']",
    );
    await expect(
      persistedCard.locator('[aria-label="Link title"]'),
    ).toHaveValue(newTitle);
    await expect(
      persistedCard.locator('[aria-label="Link description"]'),
    ).toHaveValue(newDescription);
  });

  test("discard reverts all changes", async ({ page }) => {
    const timestamp = Date.now();
    const testUrl = `https://example.com/discard-test-${timestamp}`;

    // Add a link
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    await linkInput.fill(testUrl);
    await page.getByRole("button", { exact: true, name: "Add" }).click();
    await expect(linkInput).toHaveValue("");

    // Wait for network to settle (mutation + refetch complete)

    const ourLinkUrl = page.locator(
      `[aria-label="Link URL"][value="${testUrl}"]`,
    );
    await expect(ourLinkUrl).toBeVisible({ timeout: 5000 });

    const linkCard = ourLinkUrl.locator("xpath=ancestor::*[@role='button']");
    const titleInput = linkCard.locator('[aria-label="Link title"]');

    const originalTitle = await titleInput.inputValue();

    // Make edits
    await titleInput.fill("CHANGED TITLE");
    await expect(page.getByText(/\d+ unsaved/)).toBeVisible();

    // Discard
    await page.getByRole("button", { exact: true, name: "Discard" }).click();

    // Verify unsaved bar gone
    await expect(page.getByText(/\d+ unsaved/)).not.toBeVisible();

    // Verify value reverted
    await expect(titleInput).toHaveValue(originalTitle);
  });

  test("multiple edits accumulate in unsaved count", async ({ page }) => {
    const timestamp = Date.now();
    const url1 = `https://example.com/multi-1-${timestamp}`;
    const url2 = `https://example.com/multi-2-${timestamp}`;

    // Add two links
    const linkInput = page.getByPlaceholder("Paste URL to add link...");
    const addBtn = page.getByRole("button", { exact: true, name: "Add" });

    await linkInput.fill(url1);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    await linkInput.fill(url2);
    await addBtn.click();
    await expect(linkInput).toHaveValue("");

    // Wait for network to settle (both mutations + refetch complete)

    // Wait for both specific links to appear
    const link1Url = page.locator(`[aria-label="Link URL"][value="${url1}"]`);
    const link2Url = page.locator(`[aria-label="Link URL"][value="${url2}"]`);
    await expect(link1Url).toBeVisible({ timeout: 5000 });
    await expect(link2Url).toBeVisible({ timeout: 5000 });

    // Get link cards
    const link1Card = link1Url.locator("xpath=ancestor::*[@role='button']");
    const link2Card = link2Url.locator("xpath=ancestor::*[@role='button']");

    // Edit first link
    await link1Card.locator('[aria-label="Link title"]').fill("Edit 1");
    await expect(page.getByText(/1 unsaved/)).toBeVisible();

    // Edit second link
    await link2Card.locator('[aria-label="Link title"]').fill("Edit 2");
    await expect(page.getByText(/2 unsaved/)).toBeVisible();
  });
});
