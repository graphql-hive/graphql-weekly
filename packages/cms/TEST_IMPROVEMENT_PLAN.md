# Test Improvement Plan

## Current State

### Implemented (commits a1c2903, 099bd18)

1. **Dedicated issues per spec file** - Each scenario spec creates its own issue via GraphQL API in `beforeAll`:
   - `delete-workflow.spec.ts` → issue number 90000-99999
   - `edit-and-persist.spec.ts` → issue number 80000-89999
   - `topic-organization.spec.ts` → issue number 70000-79999

2. **Dedicated sign-out user** - `e2e/.auth/signout-user.json` prevents session invalidation from affecting other tests

3. **Direct navigation** - Tests navigate to `/issue/${issueId}` instead of clicking through list

4. **PageHeader fix** - Uses `number` prop directly instead of regex extraction from title

### Test Results

With `--workers=1 --retries=2`: 22 passed (2 flaky), 1 failed (unrelated issue creation test)

**Race condition fixed** (commit dba3507). Remaining flakiness is due to Cloudflare Worker errors, not application logic.

---

## Discovered Issue: Optimistic Update Race Condition

### Symptom

Link edits don't persist after save+reload, even though "unsaved" indicator appears and disappears correctly.

### Root Cause

Race condition in temp→real ID migration during optimistic updates:

```
Timeline:
1. User clicks "Add" → createLinkMutation starts
2. Optimistic update adds link with temp-ID to cache
3. Link appears in UI with temp-ID
4. User edits title → editedLinks.set(tempId, {...})
5. Mutation completes → onSuccess migrates editedLinks[tempId] → editedLinks[realId]
6. User clicks Save → updateLinkMutation(realId, edits)
7. Reload → edits are gone
```

The bug: Step 5's `setEditedLinks` is async. If steps 4-6 interleave with React's state batching, the migration can race with ongoing edits, causing:
- Edits stored with temp-ID after migration already happened
- Edits lost when cache is invalidated and refetched

### Why Old Tests Didn't Fail

Old tests clicked on existing issues from the list. Those issues already had stable real IDs. The temp→real migration only happens for newly created links, and old tests added links to issues that had time to stabilize.

---

## Solution: Robust Optimistic Update Pattern

### Option A: Key Edits by URL (Immutable Key) ✓ Recommended

Instead of keying `editedLinks` by link ID (which changes), key by URL (which is immutable):

```tsx
// Before: Map<linkId, edits>
const [editedLinks, setEditedLinks] = useState<Map<string, Partial<LinkData>>>(new Map());

// After: Map<url, edits>
const [editedLinks, setEditedLinks] = useState<Map<string, Partial<LinkData>>>(new Map());

const handleLinkChange = useCallback((link: LinkData) => {
  if (!link.url) return;
  setEditedLinks((prev) =>
    new Map(prev).set(link.url!, {  // Key by URL, not ID
      text: link.text ?? null,
      title: link.title ?? null,
    }),
  );
}, []);

const saveAll = useCallback(async () => {
  // Resolve URL → current ID at save time
  const linkPromises = [...editedLinks.entries()].map(([url, changes]) => {
    const link = [...linkMap.values()].find(l => l.url === url);
    if (!link?.id || link.id.startsWith('temp-')) return Promise.resolve(); // Skip unsaved links
    return updateLinkMutation.mutateAsync({
      id: link.id,
      text: changes.text!,
      title: changes.title!,
      url,
    });
  });
  // ...
}, [editedLinks, linkMap, updateLinkMutation]);
```

**Pros:**
- URL is immutable once link is created
- No migration needed
- Simple mental model

**Cons:**
- Can't edit URL without losing other edits (acceptable - URL edits are rare)

### Option B: Block Edits Until Real ID

Disable input fields on links with temp-IDs:

```tsx
<input
  disabled={link.id?.startsWith('temp-')}
  // ...
/>
```

**Pros:**
- Simple
- Makes race impossible

**Cons:**
- Worse UX - user has to wait

### Option C: Queue Edits During Migration

Use a ref to queue edits that arrive during mutation:

```tsx
const pendingEditsRef = useRef<Map<string, Partial<LinkData>>>(new Map());
const isMigrating = useRef(false);

const handleLinkChange = useCallback((link: LinkData) => {
  if (isMigrating.current && link.id?.startsWith('temp-')) {
    // Queue for after migration
    pendingEditsRef.current.set(link.id, {...});
    return;
  }
  setEditedLinks(...);
}, []);

// In onSuccess:
isMigrating.current = true;
setEditedLinks((prev) => {
  // ... migrate ...
  // Also apply any queued edits
  for (const [tempId, edits] of pendingEditsRef.current) {
    // ...
  }
  pendingEditsRef.current.clear();
  return next;
});
isMigrating.current = false;
```

**Pros:**
- No UX impact
- Handles all edge cases

**Cons:**
- Complex
- Refs + state coordination is error-prone

---

## Recommendation

**Option A (key by URL) implemented** (commit dba3507) for these reasons:

1. **Simplest mental model** - URL is the natural identifier for a link from user's perspective
2. **No migration logic** - Eliminates the race condition entirely
3. **Minimal code change** - Only `handleLinkChange` and `saveAll` need updates
4. **URL stability** - URLs don't change during normal editing flow

The only downside (can't edit URL without losing other edits) is acceptable because:
- URL edits are rare
- User can save other edits first, then edit URL

**Additional fix**: Also update the query cache directly with the real ID in `onSuccess` (not just invalidate). This ensures `linkMap` has the real ID immediately, rather than waiting for async refetch.

---

## Test Improvements (Future)

1. **Add explicit wait for real ID** in tests that create then edit links:
   ```ts
   // After adding link, wait for temp-ID to be replaced
   await expect(async () => {
     const linkId = await linkCard.getAttribute('data-link-id');
     expect(linkId).not.toMatch(/^temp-/);
   }).toPass({ timeout: 5000 });
   ```

2. **Increase retries in CI** - Flaky tests need safety margin

3. **Add data-link-id attribute** for debugging test failures
