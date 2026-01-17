import { expect, test } from "@playwright/test";

test.describe("Auth Gate (unauthenticated)", () => {
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
    await expect(
      page.getByRole("button", { name: "Log in with GitHub" }),
    ).toBeVisible();
  });

  test("access-denied page is accessible", async ({ page }) => {
    await page.goto("/access-denied");

    await expect(
      page.getByRole("heading", { name: "Access Required" }),
    ).toBeVisible();
  });
});

test.describe("Auth Gate (authenticated)", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("authenticated user can access issue pages", async ({ page }) => {
    await page.goto("/");
    const firstIssue = page.locator('a[href^="/issue/"]').first();
    const href = await firstIssue.getAttribute("href");

    await page.goto(href!);

    await expect(page).not.toHaveURL("/login");
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });
  });

  test("user menu shows handle and sign out button", async ({ page }) => {
    await page.goto("/");

    const userMenu = page.getByRole("button", { name: "User menu" });
    await expect(userMenu).toBeVisible();
    await expect(userMenu).toContainText("e2e-test-user");
    await userMenu.click();

    await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  test("sign out clears session and redirects to login on protected page", async ({
    page,
  }) => {
    await page.goto("/");
    const firstIssue = page.locator('a[href^="/issue/"]').first();
    const issueHref = await firstIssue.getAttribute("href");
    await page.goto(issueHref!);
    await expect(page.getByText("Curating:")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await page.waitForURL("/login");

    await page.goto(issueHref!);
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Auth Gate (non-collaborator)", () => {
  test.use({ storageState: "e2e/.auth/non-collaborator.json" });

  test("non-collaborator is redirected to access-denied on protected page", async ({
    page,
  }) => {
    await page.goto("/");
    const firstIssue = page.locator('a[href^="/issue/"]').first();
    const href = await firstIssue.getAttribute("href");

    await page.goto(href!);

    await expect(page).toHaveURL("/access-denied");
    await expect(
      page.getByRole("heading", { name: "Access Required" }),
    ).toBeVisible();
  });
});
