import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  type UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "../cn";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { Navbar } from "../components/Navbar";
import {
  type IssueQuery,
  useAddLinksToTopicMutation,
  useCreateLinkMutation,
  useCreateTopicMutation,
  useDeleteLinkMutation,
  useIssueQuery,
  useUnassignedLinksQuery,
  useUpdateLinkMutation,
  useUpdateTopicMutation,
  useUpdateTopicWhenIssueDeletedMutation,
} from "../generated/graphql";
import { PlusIcon } from "../icons/Plus";
import { LinkCard } from "../product/LinkCard";
import { PageHeader } from "../product/PageHeader";
import {
  markSubmissionConsumed,
  SUBMISSION_PREFIX,
  SubmissionsPanel,
} from "../product/SubmissionsPanel";
import { TopicAutocomplete } from "../product/TopicAutocomplete";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

type TopicData = NonNullable<
  NonNullable<IssueQuery["issue"]>["topics"]
>[number];
type LinkData = NonNullable<TopicData["links"]>[number];

const TRASH_ID = "trash";
const UNASSIGNED_ID = "unassigned";

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

// SortableItem wraps LinkCard with drag functionality
function SortableItem({
  id,
  link,
  onChange,
  onDelete,
}: {
  id: UniqueIdentifier;
  link: LinkData;
  onChange: (linkId: string, changes: Partial<LinkData>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LinkCard
        link={link}
        onChange={(changes) => onChange(link.id!, changes)}
        onDelete={onDelete}
        {...(listeners && { dragListeners: listeners })}
      />
    </div>
  );
}

// Trash drop zone
function Trash({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: TRASH_ID });

  return (
    <div
      className={`fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 border-2 border-dashed transition-colors ${
        isOver
          ? "border-red-500 bg-red-500/10 text-red-500"
          : "border-neu-400 dark:border-neu-600 text-neu-500 dark:text-neu-400"
      }`}
      ref={setNodeRef}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z"
          fill="currentColor"
        />
      </svg>
      Drop to delete
    </div>
  );
}

const tocLinkClass =
  "flex items-center py-1 pl-4 text-sm text-neu-500 dark:text-neu-400 hover:text-neu-700 dark:hover:text-neu-300 no-underline truncate gap-1";

function TableOfContents({
  footer,
  items,
  topics,
}: {
  footer?: React.ReactNode;
  items: Items;
  topics: TopicData[];
}) {
  return (
    <nav className="toc sticky top-[50vh] -translate-y-1/2 max-h-[calc(100vh-15rem)] overflow-y-auto">
      <a className={tocLinkClass} href="#unassigned">
        Unassigned{" "}
        <span className="text-neu-400 dark:text-neu-500 text-xs">
          ({items[UNASSIGNED_ID]?.length ?? 0})
        </span>
      </a>
      {topics.map((t) => (
        <a className={tocLinkClass} href={`#topic-${t.id}`} key={t.id}>
          {t.title}{" "}
          <span className="text-neu-400 dark:text-neu-500 text-xs">
            ({items[t.id!]?.length ?? 0})
          </span>
        </a>
      ))}
      {footer}
    </nav>
  );
}

export function IssuePage({ id }: { id: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <IssuePageContent id={id} />
    </QueryClientProvider>
  );
}

function IssuePageContent({ id }: { id: string }) {
  const qc = useQueryClient();

  const [newTopic, setNewTopic] = useState("");
  const [newLink, setNewLink] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const [editedLinks, setEditedLinks] = useState<
    Map<string, Partial<LinkData>>
  >(new Map());

  // dnd-kit state
  const [items, setItems] = useState<Items>({});
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  // Track moves for saving (linkId -> newContainerId)
  const [linkMoves, setLinkMoves] = useState<Map<string, string>>(new Map());
  const [deletedLinkIds, setDeletedLinkIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const tempToRealIdRef = useRef<Map<string, string>>(new Map());
  const [activeSubmission, setActiveSubmission] = useState<{
    description: string;
    title: string;
    url: string;
  } | null>(null);

  const { data: linksData, isLoading: linksLoading } =
    useUnassignedLinksQuery();
  const { data: issueData, isLoading: issueLoading } = useIssueQuery({ id });

  const createTopicMutation = useCreateTopicMutation();
  const createLinkMutation = useCreateLinkMutation();
  const updateLinkMutation = useUpdateLinkMutation();
  const deleteLinkMutation = useDeleteLinkMutation();
  const updateTopicMutation = useUpdateTopicMutation();
  const removeTopicMutation = useUpdateTopicWhenIssueDeletedMutation();
  const addLinksToTopicMutation = useAddLinksToTopicMutation();

  const invalidateQueries = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["UnassignedLinks"] });
    qc.invalidateQueries({ queryKey: ["Issue", { id }] });
  }, [qc, id]);

  const issue = issueData?.issue;
  const topics = useMemo(() => issue?.topics ?? [], [issue]);
  const unassignedLinks = useMemo(
    () => linksData?.unassignedLinks ?? [],
    [linksData],
  );

  const linkMap = useMemo(() => {
    const map = new Map<string, LinkData>();
    for (const link of unassignedLinks) {
      if (link.id) map.set(link.id, link as LinkData);
    }
    for (const topic of topics) {
      for (const link of topic.links ?? []) {
        if (link.id) map.set(link.id, link);
      }
    }
    return map;
  }, [unassignedLinks, topics]);

  // Initialize items from data (only when server data changes, not on moves)
  useEffect(() => {
    if (!issue) return;

    // Unassigned links (already filtered server-side)
    const unassigned = unassignedLinks
      .filter((link) => link.id && !deletedLinkIds.has(link.id))
      .map((link) => link.id!);

    // Topic links
    const topicItems = Object.fromEntries(
      topics
        .filter((topic) => topic.id)
        .map((topic) => [
          topic.id,
          (topic.links ?? [])
            .filter((link) => link.id && !deletedLinkIds.has(link.id))
            .map((link) => link.id!),
        ]),
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from server data
    setItems({ [UNASSIGNED_ID]: unassigned, ...topicItems });
  }, [issue, unassignedLinks, topics, deletedLinkIds]);

  // Containers list (for iteration)
  const containers = useMemo(
    () => [UNASSIGNED_ID, ...topics.map((t) => t.id!).filter(Boolean)],
    [topics],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  // Plain function, not memoized - always uses current items
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) return id;
    return Object.keys(items).find((key) => items[key]?.includes(id));
  };

  // Collision detection optimized for multiple containers
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items,
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId] ?? [];
          if (containerItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id),
              ),
            })[0];
            if (closest?.id) {
              overId = closest.id;
            }
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const onDragCancel = () => {
    if (clonedItems) setItems(clonedItems);
    setActiveId(null);
    setClonedItems(null);
    setActiveSubmission(null);
  };

  // Other handlers
  const submitTopic = useCallback(() => {
    if (!newTopic.trim()) return;
    const topicTitle = newTopic;
    setNewTopic("");
    createTopicMutation.mutate(
      { issue_comment: " ", issueId: id, title: topicTitle },
      { onSuccess: invalidateQueries },
    );
  }, [createTopicMutation, newTopic, id, invalidateQueries]);

  const submitLink = useCallback(() => {
    if (!newLink || !/^https?:\/\/.+/.test(newLink)) return;
    const urlToAdd = newLink;
    const tempId = `temp-link-${Date.now()}`;

    setNewLink("");

    // Optimistic update - add link to cache immediately
    qc.setQueryData<{ unassignedLinks: typeof unassignedLinks }>(
      ["UnassignedLinks"],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          unassignedLinks: [
            {
              __typename: "Link" as const,
              id: tempId,
              text: null,
              title: null,
              url: urlToAdd,
            },
            ...(old.unassignedLinks ?? []),
          ],
        };
      },
    );

    createLinkMutation.mutate(
      { url: urlToAdd },
      {
        onError: () => {
          // Rollback optimistic update
          qc.setQueryData<{ unassignedLinks: typeof unassignedLinks }>(
            ["UnassignedLinks"],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                unassignedLinks:
                  old.unassignedLinks?.filter((l) => l.id !== tempId) ?? [],
              };
            },
          );
          setNewLink(urlToAdd);
        },
        onSuccess: (data) => {
          const realId = data.createLink?.id;
          if (realId) {
            // Store mapping so future edits to temp ID are redirected to real ID
            tempToRealIdRef.current.set(tempId, realId);

            // Migrate any edits from temp ID to real ID
            setEditedLinks((prev) => {
              const edits = prev.get(tempId);
              if (!edits) return prev;
              const next = new Map(prev);
              next.delete(tempId);
              next.set(realId, edits);
              return next;
            });
            // Migrate any link moves from temp ID to real ID
            setLinkMoves((prev) => {
              const topicId = prev.get(tempId);
              if (!topicId) return prev;
              const next = new Map(prev);
              next.delete(tempId);
              next.set(realId, topicId);
              return next;
            });
            // Migrate deleted link IDs
            setDeletedLinkIds((prev) => {
              if (!prev.has(tempId)) return prev;
              const next = new Set(prev);
              next.delete(tempId);
              next.add(realId);
              return next;
            });
          }
          invalidateQueries();
        },
      },
    );
  }, [createLinkMutation, newLink, invalidateQueries, qc]);

  const handleLinkChange = useCallback(
    (linkId: string, changes: Partial<LinkData>) => {
      // Resolve temp ID to real ID if the mapping exists (handles race condition
      // where user edits after mutation completes but before React re-renders)
      const resolvedId = tempToRealIdRef.current.get(linkId) ?? linkId;

      setEditedLinks((prev) => {
        const existing = prev.get(resolvedId) ?? {};
        return new Map(prev).set(resolvedId, { ...existing, ...changes });
      });
    },
    [],
  );

  const handleLinkDelete = useCallback((linkId: string) => {
    const resolvedId = tempToRealIdRef.current.get(linkId) ?? linkId;
    setDeletedLinkIds((prev) => new Set(prev).add(resolvedId));
  }, []);

  const handleTopicRemove = useCallback(
    (topicId: string, topicTitle: string) => {
      if (!confirm(`Remove topic "${topicTitle}" from this issue?`)) return;
      removeTopicMutation.mutate(
        { id: topicId },
        { onSuccess: invalidateQueries },
      );
    },
    [removeTopicMutation, invalidateQueries],
  );

  const handleTopicMove = useCallback(
    async (topicIndex: number, direction: "down" | "up") => {
      if (!topics) return;
      const targetIndex = direction === "up" ? topicIndex - 1 : topicIndex + 1;
      if (targetIndex < 0 || targetIndex >= topics.length) return;

      const currentTopic = topics[topicIndex];
      const targetTopic = topics[targetIndex];
      if (!currentTopic?.id || !targetTopic?.id) return;

      await Promise.all([
        updateTopicMutation.mutateAsync({
          id: currentTopic.id,
          position: targetIndex,
        }),
        updateTopicMutation.mutateAsync({
          id: targetTopic.id,
          position: topicIndex,
        }),
      ]);
      invalidateQueries();
    },
    [topics, updateTopicMutation, invalidateQueries],
  );

  const getMergedLink = useCallback(
    (link: LinkData): LinkData => {
      const edits = editedLinks.get(link.id!);
      return edits ? { ...link, ...edits } : link;
    },
    [editedLinks],
  );

  const hasUnsavedChanges =
    editedLinks.size > 0 || deletedLinkIds.size > 0 || linkMoves.size > 0;
  const changesCount = editedLinks.size + deletedLinkIds.size + linkMoves.size;

  const saveAll = useCallback(async () => {
    setSaveError(null);

    try {
      const linkPromises = [...editedLinks.entries()].map(([lid, changes]) => {
        const current = linkMap.get(lid);
        return updateLinkMutation.mutateAsync({
          id: lid,
          text:
            changes.text === undefined
              ? (current?.text ?? "")
              : (changes.text ?? ""),
          title:
            changes.title === undefined
              ? (current?.title ?? "")
              : (changes.title ?? ""),
          url:
            changes.url === undefined
              ? (current?.url ?? "")
              : (changes.url ?? ""),
        });
      });

      const deletePromises = [...deletedLinkIds].map((lid) =>
        deleteLinkMutation.mutateAsync({ id: lid }),
      );

      const movePromises = [...linkMoves.entries()].map(([linkId, topicId]) => {
        if (topicId === UNASSIGNED_ID) {
          // TODO: Need a mutation to unassign link from topic
          return Promise.resolve();
        }
        return addLinksToTopicMutation.mutateAsync({ linkId, topicId });
      });

      await Promise.all([...linkPromises, ...deletePromises, ...movePromises]);

      setEditedLinks(new Map());
      setDeletedLinkIds(new Set());
      setLinkMoves(new Map());
      invalidateQueries();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save changes";
      setSaveError(message);
    }
  }, [
    editedLinks,
    deletedLinkIds,
    linkMap,
    linkMoves,
    updateLinkMutation,
    deleteLinkMutation,
    addLinksToTopicMutation,
    invalidateQueries,
  ]);

  const discardAll = useCallback(() => {
    setEditedLinks(new Map());
    setDeletedLinkIds(new Set());
    setLinkMoves(new Map());
    setSaveError(null);
  }, []);

  if (linksLoading || issueLoading || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const isSaving =
    updateLinkMutation.isPending ||
    deleteLinkMutation.isPending ||
    addLinksToTopicMutation.isPending ||
    createLinkMutation.isPending;

  const isMutating =
    isSaving ||
    updateTopicMutation.isPending ||
    removeTopicMutation.isPending ||
    createTopicMutation.isPending ||
    createLinkMutation.isPending;

  const activeLink = activeId ? linkMap.get(String(activeId)) : null;

  return (
    <div
      className={cn(
        "min-h-screen bg-neu-50 dark:bg-neu-950",
        isMutating && "cursor-progress",
      )}
    >
      <Navbar />
      <PageHeader {...issue} topics={topics} />

      <div className="xl:grid xl:grid-cols-[1fr_864px_1fr] xl:justify-center xl:gap-6">
        <div />

        <main className="max-w-4xl w-full mx-auto xl:mx-0 px-4 py-6">
          <div className="mb-6 flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-neu-300 dark:border-neu-600 dark:bg-neu-800 dark:text-neu-100 text-sm focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] outline-none"
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Paste URL to add link..."
              ref={linkInputRef}
              type="text"
              value={newLink}
            />
            <Button
              className={cn(!newLink && "opacity-30")}
              disabled={createLinkMutation.isPending}
              onClick={() => {
                if (!newLink) {
                  linkInputRef.current?.focus();
                  return;
                }
                submitLink();
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          <DndContext
            collisionDetection={collisionDetectionStrategy}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragCancel={onDragCancel}
            onDragEnd={({ active, over }) => {
              const activeIdStr = String(active.id);
              const isSubmission = activeIdStr.startsWith(SUBMISSION_PREFIX);

              // Handle submission drop
              if (isSubmission) {
                const overId = over?.id;
                if (overId == null || overId === TRASH_ID) {
                  setActiveId(null);
                  setActiveSubmission(null);
                  return;
                }

                const overContainer = findContainer(overId);
                if (!overContainer) {
                  setActiveId(null);
                  setActiveSubmission(null);
                  return;
                }

                // Get submission data from active.data
                const submissionData = active.data.current as
                  | {
                      description: string;
                      id: string;
                      title: string;
                      type: string;
                      url: string;
                    }
                  | undefined;

                if (submissionData?.url) {
                  // Create link from submission
                  createLinkMutation.mutate(
                    { url: submissionData.url },
                    {
                      onSuccess: async (data) => {
                        const newLinkId = data.createLink?.id;
                        if (!newLinkId) {
                          invalidateQueries();
                          return;
                        }

                        // Prefill link data from submission
                        await updateLinkMutation.mutateAsync({
                          id: newLinkId,
                          text: submissionData.description || "",
                          title: submissionData.title || "",
                          url: submissionData.url,
                        });

                        // Mark submission as consumed
                        if (submissionData.id) {
                          markSubmissionConsumed(submissionData.id);
                        }

                        if (overContainer === UNASSIGNED_ID) {
                          invalidateQueries();
                        } else {
                          // If dropped on a topic, also assign it
                          addLinksToTopicMutation.mutate(
                            {
                              linkId: newLinkId,
                              topicId: String(overContainer),
                            },
                            { onSuccess: invalidateQueries },
                          );
                        }
                      },
                    },
                  );
                }

                setActiveId(null);
                setActiveSubmission(null);
                return;
              }

              // Use clonedItems (from onDragStart) to find original container
              // because onDragOver already moved the item in items state
              const activeContainer = clonedItems
                ? Object.keys(clonedItems).find((key) =>
                    clonedItems[key]?.includes(active.id),
                  )
                : findContainer(active.id);

              if (!activeContainer) {
                setActiveId(null);
                setActiveSubmission(null);
                return;
              }

              const overId = over?.id;

              if (overId == null) {
                setActiveId(null);
                setActiveSubmission(null);
                return;
              }

              // Dropped on trash
              if (overId === TRASH_ID) {
                setItems((items) => {
                  const container = items[activeContainer];
                  if (!container) return items;
                  return {
                    ...items,
                    [activeContainer]: container.filter(
                      (id) => id !== active.id,
                    ),
                  };
                });
                const linkId = String(active.id);
                const resolvedId =
                  tempToRealIdRef.current.get(linkId) ?? linkId;
                setDeletedLinkIds((prev) => new Set(prev).add(resolvedId));
                setActiveId(null);
                setActiveSubmission(null);
                return;
              }

              const overContainer = findContainer(overId);

              if (overContainer) {
                const activeIndex =
                  items[activeContainer]?.indexOf(active.id) ?? -1;
                const overIndex = items[overContainer]?.indexOf(overId) ?? -1;

                if (activeIndex !== overIndex) {
                  setItems((items) => {
                    const container = items[overContainer];
                    if (!container) return items;
                    return {
                      ...items,
                      [overContainer]: arrayMove(
                        container,
                        container.indexOf(active.id),
                        overIndex < 0 ? container.length : overIndex,
                      ),
                    };
                  });
                }

                // Track move if container changed
                if (activeContainer !== overContainer) {
                  const linkId = String(active.id);
                  const resolvedId =
                    tempToRealIdRef.current.get(linkId) ?? linkId;
                  setLinkMoves((prev) =>
                    new Map(prev).set(resolvedId, String(overContainer)),
                  );
                }
              }

              setActiveId(null);
              setActiveSubmission(null);
            }}
            onDragOver={({ active, over }) => {
              const overId = over?.id;
              if (overId == null || overId === TRASH_ID || active.id in items)
                return;

              const overContainer = findContainer(overId);
              const activeContainer = findContainer(active.id);

              if (
                !overContainer ||
                !activeContainer ||
                activeContainer === overContainer
              )
                return;

              setItems((items) => {
                const activeItems = items[activeContainer];
                const overItems = items[overContainer];
                if (!activeItems || !overItems) return items;

                const overIndex = overItems.indexOf(overId);
                const activeIndex = activeItems.indexOf(active.id);
                const movedItem = activeItems[activeIndex];
                if (movedItem === undefined) return items;

                let newIndex: number;
                if (overId in items) {
                  newIndex = overItems.length + 1;
                } else {
                  const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                      over.rect.top + over.rect.height;
                  const modifier = isBelowOverItem ? 1 : 0;
                  newIndex =
                    overIndex === -1
                      ? overItems.length + 1
                      : overIndex + modifier;
                }

                recentlyMovedToNewContainer.current = true;

                return {
                  ...items,
                  [activeContainer]: activeItems.filter(
                    (item) => item !== active.id,
                  ),
                  [overContainer]: [
                    ...overItems.slice(0, newIndex),
                    movedItem,
                    ...overItems.slice(newIndex),
                  ],
                };
              });
            }}
            onDragStart={({ active }) => {
              setActiveId(active.id);
              setClonedItems(items);

              // Track submission data for overlay
              const activeIdStr = String(active.id);
              if (activeIdStr.startsWith(SUBMISSION_PREFIX)) {
                const data = active.data.current as
                  | {
                      description: string;
                      title: string;
                      url: string;
                    }
                  | undefined;
                setActiveSubmission(data ?? null);
              } else {
                setActiveSubmission(null);
              }
            }}
            sensors={sensors}
          >
            {/* Unassigned section */}
            <section className="mb-8" id="unassigned">
              <div className="flex items-center gap-1 justify-between mb-3">
                <h2 className="text-lg text-neu-900 dark:text-neu-100">
                  Unassigned
                </h2>
                <span className="text-sm text-neu-500 dark:text-neu-400">
                  {items[UNASSIGNED_ID]?.length ?? 0} links
                </span>
              </div>

              <DroppableContainer
                id={UNASSIGNED_ID}
                items={items[UNASSIGNED_ID] ?? []}
              >
                {(items[UNASSIGNED_ID] ?? []).length > 0 ? (
                  (items[UNASSIGNED_ID] ?? []).map((linkId) => {
                    const link = linkMap.get(String(linkId));
                    if (!link) return null;
                    return (
                      <SortableItem
                        id={linkId}
                        key={linkId}
                        link={getMergedLink(link)}
                        onChange={handleLinkChange}
                        onDelete={() => handleLinkDelete(link.id!)}
                      />
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-neu-500 dark:text-neu-400 text-sm">
                    No unassigned links
                  </div>
                )}
              </DroppableContainer>
            </section>

            {/* Topic sections */}
            {topics.map((topic, topicIndex) => {
              const topicItems = items[topic.id!] ?? [];
              const isFirst = topicIndex === 0;
              const isLast = topicIndex === topics.length - 1;

              return (
                <section
                  className="mb-8 group/topic"
                  id={`topic-${topic.id}`}
                  key={topic.id}
                >
                  {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- keyboard nav for reordering */}
                  <div
                    className="flex items-center gap-3 mb-3"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" && !isFirst) {
                        e.preventDefault();
                        handleTopicMove(topicIndex, "up");
                      } else if (e.key === "ArrowDown" && !isLast) {
                        e.preventDefault();
                        handleTopicMove(topicIndex, "down");
                      }
                    }}
                    role="group"
                    tabIndex={0}
                  >
                    {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
                    <h3 className="text-lg text-neu-900 dark:text-neu-100">
                      {topic.title}
                    </h3>
                    <span className="text-sm text-neu-500 dark:text-neu-400">
                      {topicItems.length} links
                    </span>
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/topic:opacity-100">
                      <button
                        className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={isFirst || updateTopicMutation.isPending}
                        onClick={() => handleTopicMove(topicIndex, "up")}
                        title="Move up"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 15l7-7 7 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </button>
                      <button
                        className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={isLast || updateTopicMutation.isPending}
                        onClick={() => handleTopicMove(topicIndex, "down")}
                        title="Move down"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 9l-7 7-7-7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </button>
                      <button
                        className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors hover:duration-0 disabled:opacity-50"
                        disabled={removeTopicMutation.isPending}
                        onClick={() =>
                          handleTopicRemove(topic.id!, topic.title!)
                        }
                        title="Remove topic from issue"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <DroppableContainer id={topic.id!} items={topicItems}>
                    {topicItems.length > 0 ? (
                      topicItems.map((linkId) => {
                        const link = linkMap.get(String(linkId));
                        if (!link) return null;
                        return (
                          <SortableItem
                            id={linkId}
                            key={linkId}
                            link={getMergedLink(link)}
                            onChange={handleLinkChange}
                            onDelete={() => handleLinkDelete(link.id!)}
                          />
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-neu-500 dark:text-neu-400 text-sm">
                        No links in this topic
                      </div>
                    )}
                  </DroppableContainer>
                </section>
              );
            })}

            {/* Drag Overlay - rendered via portal to document.body */}
            {
              createPortal(
                <DragOverlay>
                  {activeId && activeLink ? (
                    <div className="shadow-lg scale-[1.02]">
                      <LinkCard
                        isDragOverlay
                        link={getMergedLink(activeLink)}
                      />
                    </div>
                  ) : activeId && activeSubmission ? (
                    <div className="w-80 p-2 bg-white dark:bg-neu-900 border border-neu-300 dark:border-neu-600 shadow-lg">
                      <div className="text-sm text-neu-900 dark:text-neu-100 truncate">
                        {activeSubmission.title || "Untitled"}
                      </div>
                      {activeSubmission.description && (
                        <div className="text-xs text-neu-500 dark:text-neu-400 truncate mt-0.5">
                          {activeSubmission.description}
                        </div>
                      )}
                      <div className="text-xs text-neu-400 dark:text-neu-500 truncate mt-1 font-mono">
                        {activeSubmission.url}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>,
                document.body,
                // React 19's ReactPortal type differs from dnd-kit's expected ReactNode
              ) as unknown as React.JSX.Element
            }

            {/* Trash zone - shown when dragging */}
            {activeId && !containers.includes(String(activeId)) && (
              <Trash isOver={false} />
            )}

            {/* Submissions panel */}
            <SubmissionsPanel />
          </DndContext>

          <div className="flex gap-2">
            <TopicAutocomplete
              disabled={createTopicMutation.isPending}
              inputRef={topicInputRef}
              onSubmit={submitTopic}
              onValueChange={setNewTopic}
              value={newTopic}
            />
            <Button
              className={cn(!newTopic && "opacity-30")}
              disabled={createTopicMutation.isPending}
              onClick={() => {
                if (!newTopic) {
                  topicInputRef.current?.focus();
                  return;
                }
                submitTopic();
              }}
              variant="secondary"
            >
              Add Topic
            </Button>
          </div>
        </main>

        <aside className="hidden xl:block shrink-0 py-6">
          <TableOfContents
            footer={
              <>
                <hr className="my-1 mx-3 border-neu-100 dark:border-neu-800" />
                <button
                  className="flex items-center gap-1 py-1 pl-4 text-sm text-neu-500 dark:text-neu-400 hover:text-neu-700 dark:hover:text-neu-300 group"
                  onClick={() => topicInputRef.current?.focus()}
                  type="button"
                >
                  Add topic
                  <PlusIcon className="size-4 text-neu-400 dark:text-neu-500 group-hover:text-neu-700 dark:group-hover:text-neu-300" />
                </button>
              </>
            }
            items={items}
            topics={topics}
          />
        </aside>
      </div>

      <footer
        className="h-64 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {(hasUnsavedChanges || saveError) && (
        <>
          <div className="h-20" />
          <div
            className={cn(
              "fixed bottom-0 inset-x-0 border-t shadow-lg",
              saveError
                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                : "bg-white dark:bg-neu-900 border-neu-200 dark:border-neu-700 dark:shadow-neu-950/50",
            )}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {saveError ? (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Save failed: {saveError}
                  </span>
                ) : (
                  <span className="text-sm text-neu-600 dark:text-neu-400">
                    {changesCount} unsaved{" "}
                    {changesCount === 1 ? "change" : "changes"}
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  disabled={isSaving}
                  onClick={discardAll}
                  variant="secondary"
                >
                  Discard
                </Button>
                <Button disabled={isSaving} onClick={saveAll} variant="primary">
                  {isSaving ? "Saving..." : saveError ? "Retry" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Droppable container component
function DroppableContainer({
  children,
  id,
  items,
}: {
  children: React.ReactNode;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div
        className={`bg-white dark:bg-neu-900 border border-neu-200 dark:border-neu-700 min-h-[60px] transition-colors ${
          isOver ? "bg-neu-100 dark:bg-neu-800" : ""
        }`}
        ref={setNodeRef}
      >
        {children}
      </div>
    </SortableContext>
  );
}
