# Qlator Redesign — Simplified

## The Problem

1. Every edit triggers an API call immediately
2. Click-to-expand for editing is annoying
3. Reordering requires typing position numbers

## The Solution

**One component change, one state addition.**

---

## Step 1: Remove expand-to-edit from `Content.tsx`

Make fields always visible. Kill the `expanded` state.

```tsx
// Before: expanded ? <EditSheet /> : <DisplayTitle />
// After: always show fields

function LinkCard({ link, onChange, onDelete }) {
  return (
    <Row>
      <Input
        value={link.title}
        onChange={(e) => onChange({ ...link, title: e.target.value })}
      />
      <TextArea
        value={link.text}
        onChange={(e) => onChange({ ...link, text: e.target.value })}
      />
      <Input
        value={link.url}
        onChange={(e) => onChange({ ...link, url: e.target.value })}
      />
      <button onClick={onDelete}>×</button>
    </Row>
  );
}
```

---

## Step 2: Lift edits to `IssueList` state

Instead of calling mutations on every change, store edits locally.

```tsx
interface AppState {
  loading: boolean;
  newTopic: string;
  editedLinks: Map<string, Partial<Link>>; // id -> changes
  editedTopics: Map<string, Partial<Topic>>; // id -> changes
}

handleLinkChange = (id: string, changes: Partial<Link>) => {
  this.setState((prev) => ({
    editedLinks: new Map(prev.editedLinks).set(id, {
      ...prev.editedLinks.get(id),
      ...changes,
    }),
  }));
};
```

---

## Step 3: Add Save/Discard buttons

```tsx
saveAll = async () => {
  const linkPromises = [...this.state.editedLinks.entries()].map(
    ([id, changes]) => this.props.updateLink({ variables: { id, ...changes } })
  );
  const topicPromises = [...this.state.editedTopics.entries()].map(
    ([id, changes]) => this.props.updateTopic({ variables: { id, ...changes } })
  );
  await Promise.all([...linkPromises, ...topicPromises]);
  this.setState({ editedLinks: new Map(), editedTopics: new Map() });
  this.refreshEverything();
};

discardAll = () => {
  this.setState({ editedLinks: new Map(), editedTopics: new Map() });
};
```

Add a sticky footer with two buttons. Done.

---

## Step 4: Drag-and-drop (do after steps 1-3 work)

**Mental model**: Topics are buckets. Links go into buckets. "Unassigned" is also a bucket.

### 4a: Reorder within a topic

Use `SpringList` per topic — handles reordering within that bucket.

```tsx
<SpringList onDragEnd={(order) => handleReorder(topic.id, order)}>
  {topic.links.map((link) => (
    <LinkCard key={link.id} link={link} />
  ))}
</SpringList>
```

### 4b: Move link between topics

This is the `TopicDialog` use case but with drag instead of modal.

Options:

1. **Keep the modal** — drag is nice-to-have, modal works fine for reassigning
2. **Add drop zones** — topics become drop targets, detect drops from other topics

For drop zones, add `onDragStart`/`onDragEnd` to track dragging state, render topics as drop targets when a link is being dragged. On drop, update `link.topic` in local state.

This is more work. Start with steps 1-3 + reordering within topics. Cross-topic drag can come later.

---

## That's It

**Files to change:**

1. `Content.tsx` → Remove `expanded` state, always show inputs
2. `IssueList.tsx` → Add `editedLinks`/`editedTopics` state, `saveAll`, `discardAll`
3. `Topic.tsx` → Pass `onChange` through to `Content`

**Files to delete:**

- `EditSheet.tsx` (inline editing replaces it)
- `TopicDialog.tsx` (drag-drop replaces it, or keep it as fallback)

**Estimated time: 2-4 hours**

---

## Why Not Context?

The state lives in one component (`IssueList`). Prop drilling two callbacks is fine. Adding React Context for this is like adding a database for a shopping list.

## Data Model Reminder

```
Issue
  └── Topics (sections/buckets)
        └── Links (assigned to topic, have position)
  └── Unassigned Links (topic = null)
```

Topics are drop zones. `SpringList` handles reordering within a zone. Cross-zone moves update `link.topic`.
