# Test Improvement Plan

## Problem

Tests pass individually in `--ui` mode but fail when run together due to shared state.

## Root Causes

### 1. All scenario tests target the same issue

```ts
// delete-workflow, edit-and-persist, topic-organization
await page.locator('a[href^="/issue/"]').first().click();
```

Parallel runs modify the same DB row → save conflicts, flaky link counts.

### 2. `curate-fresh-issue` changes what "first" means

Creating new issues shifts which issue is `.first()` for other tests mid-run.

### 3. Sign-out test invalidates shared session

```ts
// auth.spec.ts
await page.getByRole("menuitem", { name: "Log out" }).click();
```

Server-side session invalidated → other tests using `user.json` get 401s.

## Solution

### Dedicated test issues

Each spec file gets its own issue to operate on:

| Spec file | Issue |
|-----------|-------|
| delete-workflow.spec.ts | Red |
| edit-and-persist.spec.ts | Green |
| topic-organization.spec.ts | Blue |
| curate-fresh-issue.spec.ts | creates new (no change needed) |

### Dedicated sign-out user

Create separate user + auth state for sign-out test:

- `e2e/.auth/signout-user.json`

Other tests remain unaffected when this session is invalidated.

## Implementation

### 1. Update global-setup.ts

```ts
const TEST_ISSUES = ["Red", "Green", "Blue"];

const SIGNOUT_USER = {
  email: "signout@e2e.local",
  handle: "signout-user",
  name: "Sign Out Test User",
  password: "test-password-signout",
};

setup("create test issues", async ({ request }) => {
  for (const name of TEST_ISSUES) {
    await request.post(`${API_URL}/graphql`, {
      data: {
        query: `mutation { createIssue(input: { number: 0, title: "${name}" }) { id } }`,
      },
    });
  }
});

setup("create signout user session", async ({ playwright }) => {
  // Same pattern as other users, save to e2e/.auth/signout-user.json
});
```

### 2. Update spec files

```ts
// delete-workflow.spec.ts
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href^="/issue/"]').filter({ hasText: "Red" }).click();
  await expect(page.getByText(/Issue #\d+/)).toBeVisible({ timeout: 15_000 });
});
```

```ts
// edit-and-persist.spec.ts → "Green"
// topic-organization.spec.ts → "Blue"
```

### 3. Update auth.spec.ts sign-out test

```ts
test("sign out clears session", async ({ browser }) => {
  const ctx = await browser.newContext({
    storageState: "e2e/.auth/signout-user.json",
  });
  const page = await ctx.newPage();

  // ... test sign out ...

  await ctx.close();
});
```

## Result

- Full parallel execution
- No shared mutable state
- No race conditions
- Deterministic test results
