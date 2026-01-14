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

### 1. Curate Fresh Issue (`curate-fresh-issue.spec.ts`)

**User story**: Editor creates a new issue and curates it with links organized into topics.

- [x] Create issue from index page
- [ ] Navigate to new issue
- [ ] Add 2 links via URL input
- [ ] Create topic "Featured"
- [ ] Edit first link's title
- [ ] Assign first link to "Featured" topic (via topic button)
- [ ] Save all changes
- [ ] Refresh page
- [ ] Verify: topic exists, link is in topic, title persisted

### 2. Edit and Persist (`edit-and-persist.spec.ts`)

**User story**: Editor modifies link metadata and confirms changes persist.

- [ ] Navigate to issue with existing links
- [ ] Edit link title
- [ ] Edit link description
- [ ] Verify unsaved changes count shows
- [ ] Save changes
- [ ] Refresh page
- [ ] Verify all edits persisted

### 3. Topic Organization (`topic-organization.spec.ts`)

**User story**: Editor reorganizes topics and moves links between them.

- [ ] Navigate to issue
- [ ] Create two topics: "Tools" and "Articles"
- [ ] Verify topic order (Tools first, Articles second)
- [ ] Move "Tools" down (Articles should be first now)
- [ ] Refresh and verify new order persisted
- [ ] Drag link from Unassigned to "Articles"
- [ ] Save and refresh
- [ ] Verify link is in "Articles"

### 4. Delete Workflow (`delete-workflow.spec.ts`)

**User story**: Editor removes unwanted links and topics.

- [ ] Navigate to issue
- [ ] Add a test link
- [ ] Delete the link (via delete button or drag to trash)
- [ ] Verify unsaved changes shows
- [ ] Save
- [ ] Refresh
- [ ] Verify link is gone
- [ ] Create and then remove a topic
- [ ] Verify topic removal persists

### 5. Navigation Smoke Tests (`smoke/navigation.spec.ts`)

**Purpose**: Fast sanity checks that pages load.

- [x] Index page shows issue list
- [x] Can navigate to issue detail
- [x] Can navigate back to index
- [x] Issue detail shows expected sections

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
