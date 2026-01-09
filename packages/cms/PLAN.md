# Qlator Redesign — Simplified

## The Problem

1. Every edit triggers an API call immediately
2. Click-to-expand for editing is annoying
3. Reordering requires typing position numbers

## The Solution

**One component change, one state addition.**

---

## Step 1: Remove expand-to-edit ✅

`LinkCard` shows all fields inline. No expand state.

---

## Step 2: Lift edits to page state ✅

`editedLinks` Map in `issue.tsx` stores local changes.

---

## Step 3: Save/Discard buttons ✅

Sticky footer appears when there are unsaved changes.

---

## Step 4: Drag-and-drop

### 4a: Reorder within a topic ✅

`SpringList` per topic handles reordering.

### 4b: Move link between topics

Keep using `TopicDialog` modal for now. Cross-topic drag can come later.

---

## Step 5: Issue page TOC

If screen space allows (`xl:` breakpoint) the issue page should have a `sticky` TableOfContents component with links to all topics and numbers like "Tools & Open Source (3)"

---

## Step 6: Arrow buttons for topic reordering ✅

Up/down arrow buttons on topic headers. ArrowUp/ArrowDown keyboard support when header is focused.

---

## Other improvements done

- Topic remove button (X icon) on hover
- Merged PageHeader into Navbar (saves vertical space)
- `hover:duration-0` pattern for instant hover feedback
- Logo link to home page
