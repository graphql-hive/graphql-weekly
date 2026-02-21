import { expect, test } from "@playwright/test";

import { createFreshIssue } from "../util";

test.describe("Publish Issue", () => {
  test.use({ storageState: "src/.auth/user.json" });

  test("clicking Publish updates draft tag to live", async ({ page }) => {
    await createFreshIssue(page);

    // Header should show "draft" tag
    const header = page.locator("header");
    await expect(header.getByText("draft", { exact: true })).toBeVisible();
    await expect(header.getByText("live", { exact: true })).not.toBeVisible();

    // Click Publish and wait for mutation response
    const publishResponse = page.waitForResponse(async (res) => {
      if (!res.url().includes("/graphql")) return false;
      if (res.request().method() !== "POST") return false;
      const body = await res.json().catch(() => null);
      return body?.data?.updateIssue && !body?.errors;
    });
    await page.getByRole("button", { name: "Publish" }).click();
    await publishResponse;

    // Tag should update to "live" without page reload
    await expect(header.getByText("live", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(header.getByText("draft", { exact: true })).not.toBeVisible();
  });
});
