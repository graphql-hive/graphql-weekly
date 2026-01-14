# E2E Test Plan

## Philosophy

Tests should be **scenario-based user journeys**, not feature checklists.
Each test creates its own data and verifies persistence by refreshing.

## Test Structure

```
e2e/
├── scenarios/
│   ├── curate-fresh-issue.spec.ts
│   ├── edit-and-persist.spec.ts
│   ├── topic-organization.spec.ts
│   └── delete-workflow.spec.ts
├── smoke/
│   └── navigation.spec.ts
└── TEST_PLAN.md
```

## Scenarios

### 1. Curate Fresh Issue (`curate-fresh-issue.spec.ts`) ✅

**User story**: Editor creates a new issue and curates it with links organized into topics.

- [x] Create issue from index page
- [x] Navigate to new issue
- [x] Add link via URL input
- [x] Create topic
- [x] Edit link's title and description
- [x] Save all changes
- [x] Refresh page
- [x] Verify: topic exists, link metadata persisted
- [x] Can add multiple links

Note: Assigning link to topic via button is blocked - Panel system not wired up.

### 2. Edit and Persist (`edit-and-persist.spec.ts`) ✅

**User story**: Editor modifies link metadata and confirms changes persist.

- [x] Navigate to issue with existing links
- [x] Edit link title
- [x] Edit link description
- [x] Verify unsaved changes count shows
- [x] Save changes
- [x] Refresh page
- [x] Verify all edits persisted
- [x] Discard reverts all changes
- [x] Multiple edits accumulate in unsaved count

### 3. Topic Organization (`topic-organization.spec.ts`) ✅

**User story**: Editor reorganizes topics.

- [x] Create topic and verify persistence
- [x] Reorder topics (move down) and verify persistence
- [x] Remove topic from issue

Note: Drag link to topic not tested - drag & drop needs manual verification first.

### 4. Delete Workflow (`delete-workflow.spec.ts`) ✅

**User story**: Editor removes unwanted links.

- [x] Add a test link
- [x] Delete the link (via delete button)
- [x] Verify unsaved changes shows
- [x] Save
- [x] Refresh
- [x] Verify link is gone
- [x] Can cancel deletion via discard

### 5. Navigation Smoke Tests (`smoke/navigation.spec.ts`) ✅

**Purpose**: Fast sanity checks that pages load.

- [x] Index page shows issue list
- [x] Can navigate to issue detail
- [x] Can navigate back to index
- [x] Issue detail shows expected sections

## Bugs Found During Testing

1. **Topic ordering bug (FIXED)**: `Issue.topics` resolver was not ordering by position.
   - File: `packages/api/src/resolvers/index.ts:364-372`
   - Added `.orderBy('position', 'asc')` to the query

2. **Panel system not wired up**: `PanelProvider` and `PanelRoot` are not mounted in component tree.
   - The "Assign to topic" button/dialog won't work until this is fixed
   - Tests skip panel-dependent features for now

## Data Strategy

- Tests create their own data (issues, links, topics)
- Use unique identifiers (timestamps) to avoid collisions
- Tests can safely delete - local DB is disposable
- No `test.skip()` for missing data - create what you need

## Assertions

Every scenario should:
1. Perform the user action
2. Verify immediate UI feedback (optimistic update)
3. Save changes
4. **Refresh page**
5. **Verify data persisted**

The refresh-and-verify step is critical - it's what makes these E2E tests, not unit tests.

## Running Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run with single worker (more stable with local wrangler)
bun run test:e2e --workers=1

# Run specific scenario
bun run test:e2e -g "topic"

# Run with retries for transient 503 errors
bun run test:e2e --retries=1
```
