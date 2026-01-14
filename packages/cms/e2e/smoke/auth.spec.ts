import { expect, test } from "@playwright/test";

test.describe("Auth Gate", () => {
  test("index page is public (no auth required)", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("GraphQL Weekly")).toBeVisible();
    await expect(page.getByText(/\d+ issues/)).toBeVisible();
  });

  test("issue page redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/issue/test-id");

    await expect(page).toHaveURL("/login");
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("GraphQL Weekly CMS")).toBeVisible();
    await expect(page.getByText("Sign in with GitHub")).toBeVisible();
  });

  test("access-denied page is accessible", async ({ page }) => {
    await page.goto("/access-denied");

    await expect(page.getByTestId("access-denied")).toBeVisible();
    await expect(page.getByText("Access Required")).toBeVisible();
  });
});
