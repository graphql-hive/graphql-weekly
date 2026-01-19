# Test Flakiness Investigation Report

## Goal
Make Playwright tests pass reliably with `workers=2` (parallel execution).

## Outcome
**Failed.** Wrangler dev server cannot handle concurrent load. Yielding to `workers=1`.

---

## Starting Point (822292e)
The stable commit already had `workers: process.env.CI ? 1 : 2`, so CI was always running serial. Our fight was about making `workers=2` work locally.

---

## Changes Made (Categorized)

### KEEP - Valuable improvements

**1. Error state handling in `issue.tsx`**
```tsx
const queryError = linksError || issueError;
if (queryError) {
  return (
    <div role="alert">
      <h1>Failed to load issue</h1>
      <p>{queryError.message}</p>
      <button onClick={() => location.reload()}>Retry</button>
    </div>
  );
}
```
Previously, failed queries showed infinite loading. Now shows error + retry button. **Real production bug fix.**

**2. `aria-busy="true"` on loading state**
```tsx
<div aria-busy="true" className="...">
  <Loading />
</div>
```
Accessibility improvement. Tests can reliably detect loading state.

**3. aria-labels on topic buttons**
```tsx
<button aria-label="Move up" ...>
<button aria-label="Move down" ...>
<button aria-label="Remove topic from issue" ...>
```
Accessibility + testability.

**4. `testMatch: /\.spec\.ts$/` in playwright config**
Explicit pattern, prevents accidental test discovery.

**5. `WRANGLER_LOG: "none"` in webServer config**
Cleaner test output.

---

### MAYBE - Context-dependent

**1. `retry: false` in QueryClient**
With fetcher retry logic, prevents double-retries. Without fetcher retries, React Query's defaults are helpful. Keep only if keeping fetcher retries.

**2. Test helpers (`e2e/helpers.ts`)**
- `gotoIssuePage` / `reloadIssuePage` with retry logic
- `TEST_ISSUES` constants
- `setupTestIssue` SQL-based setup

Overkill for serial execution. The simpler approach in 822292e works with workers=1.

**3. Increased timeouts (`timeout: 60_000`, `navigationTimeout: 30_000`)**
Helps with slow CI, but masks real issues.

---

### DISCARD - Dead ends

**1. Fetcher retry logic**
```typescript
function isTransientError(error) { ... }
for (let attempt = 1; attempt <= maxRetries; attempt++) { ... }
```
- With workers=1, transient errors are rare
- Added complexity, doesn't solve root cause
- Timeout wrapper experiment made things worse
- SQLITE_BUSY should be handled server-side

**2. Complex helper retry logic**
```typescript
await expect(async () => {
  await page.goto(...);
  await expect(...).not.toBeVisible({ timeout: 5000 });
}).toPass({ intervals: [1000, 2000, 3000, 5000], timeout: 45_000 });
```
Over-engineered. Simple `page.goto()` + `expect().toBeVisible()` works with workers=1.

**3. SQL-based test setup**
GraphQL setup works fine with workers=1. SQL adds fragile string manipulation and bypasses app logic.

---

## Root Cause Analysis

Flakiness stemmed from **wrangler dev server limitations under concurrent load**:

1. **"Your worker is starting..."** - Server not ready during parallel requests
2. **SQLITE_BUSY** - D1 doesn't handle concurrent writes in dev mode
3. **ECONNRESET** - Server crashes under load, kills connections

**Conclusion:** wrangler dev + SQLite + parallel tests = fundamentally incompatible. No amount of client-side retry logic fixes server-side limitations.

---

## Test Results Over Time

| Run | Passed | Failed | Flaky | Notes |
|-----|--------|--------|-------|-------|
| Initial | 17 | 5 | 2 | Baseline with workers=2 |
| + fetcher retries | 21 | 1 | 2 | Best result |
| + timeout wrapper | 17 | 5 | 2 | Got worse |
| 822292e (workers=1 CI) | 24 | 0 | 0 | Stable in CI |

---

## Recommended Final State

```
Keep from this work:
+ Error state handling in issue.tsx (production bug fix)
+ aria-busy="true" on loading state
+ aria-labels on topic buttons
+ testMatch: /\.spec\.ts$/
+ WRANGLER_LOG: "none"
+ timeout: 60_000

Revert to 822292e:
- Fetcher retry logic
- React Query retry: false
- Complex test helpers
- SQL-based test setup

Accept:
workers: 1 everywhere
```
