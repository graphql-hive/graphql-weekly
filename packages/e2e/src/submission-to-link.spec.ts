import { expect, test } from "@playwright/test";

import { CMS_URL, WEB_URL } from "./urls.ts";

test.describe("Cross-App: Web to CMS", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("submit link on web, verify in CMS submissions panel", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testTitle = `E2E Cross-App Test ${timestamp}`;
    const testUrl = `https://example.com/cross-app-${timestamp}`;
    const testDescription = `Cross-app test description ${timestamp}`;

    // 1. Submit link via web app
    await page.goto(`${WEB_URL}/`);
    await expect(
      page.getByRole("heading", { level: 1, name: /newsletter/i }),
    ).toBeVisible({ timeout: 15_000 });

    const submitBtn = page.getByRole("button", { name: /submit link/i }).first();
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });
    await submitBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    await dialog.getByRole("textbox", { name: /title/i }).fill(testTitle);
    await dialog.getByRole("textbox", { name: /url/i }).fill(testUrl);
    await dialog.getByRole("textbox", { name: /^name$/i }).fill("E2E Test");
    await dialog
      .getByRole("textbox", { name: /email/i })
      .fill(`test+${timestamp}@example.com`);
    await dialog
      .getByRole("textbox", { name: /description/i })
      .fill(testDescription);

    await dialog.getByRole("button", { name: /submit link/i }).click();

    await expect(dialog.getByText(/submitted for review/i)).toBeVisible({
      timeout: 15_000,
    });
    await dialog.getByRole("button", { name: /close/i }).click();

    // 2. Go to CMS and navigate to any issue to see submissions panel
    await page.goto(`${CMS_URL}/`);
    await expect(page.getByText(/\d+ issues/)).toBeVisible({ timeout: 15_000 });

    const issueLink = page.locator('a[href^="/issue/"]').first();
    await issueLink.click();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });

    // 3. Open submissions panel and verify our submission is there
    const submissionsHeader = page.locator("text=Submissions").first();
    await expect(submissionsHeader).toBeVisible({ timeout: 10_000 });

    const expandBtn = page.getByLabel("Expand panel");
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
    }

    // Our submission should be visible
    await expect(page.locator(`text=${testTitle}`).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator(`text=${testUrl}`).first()).toBeVisible();
  });
});
