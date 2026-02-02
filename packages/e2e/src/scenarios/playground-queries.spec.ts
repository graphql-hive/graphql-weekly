import { expect, test } from "@playwright/test";

import { WEB_URL } from "../urls.ts";

const playgroundQueries = [
  "Query for all the issues",
  "Query all the topics and links",
  "Query a specific issue",
];

test.describe("Playground", () => {
  test("auto-runs first query on scroll into view", async ({ page }) => {
    await page.goto(WEB_URL);

    // Set up response listener before scrolling triggers the auto-run
    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().includes("/graphql") && r.request().method() === "POST",
    );

    const runButton = page.getByRole("button", { name: /run query/i });
    await runButton.scrollIntoViewIfNeeded();

    // IntersectionObserver fires the first query automatically
    const response = await responsePromise;
    const body = await response.json();
    expect(body.errors).toBeUndefined();
    expect(body.data).toBeDefined();
    expect(body.data.allIssues).toBeDefined();
  });

  for (const title of playgroundQueries) {
    test(`"${title}" returns valid JSON without errors`, async ({ page }) => {
      await page.goto(WEB_URL);

      const select = page.getByLabel("Select query example");
      const runButton = page.getByRole("button", { name: /run query/i });

      await runButton.scrollIntoViewIfNeeded();
      // Wait for the auto-run of the default query to finish
      await expect(runButton).toBeEnabled({ timeout: 15_000 });

      await select.selectOption(title);

      // Listen for the GraphQL response before clicking
      const responsePromise = page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") && r.request().method() === "POST",
      );
      await runButton.click();
      const response = await responsePromise;

      const body = await response.json();
      expect(body.errors).toBeUndefined();
      expect(body.data).toBeDefined();
    });
  }
});
