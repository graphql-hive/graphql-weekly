import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  MeasuringStrategy,
  useDroppable,
  type UniqueIdentifier,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "../components/Button";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import LinkCard from "../product/LinkCard";
import PageHeader from "../product/PageHeader";
import SubmissionsPanel, {
  SUBMISSION_PREFIX,
  markSubmissionConsumed,
} from "../product/SubmissionsPanel";

import {
  useAllLinksQuery,
  useIssueQuery,
  useCreateTopicMutation,
  useCreateLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useUpdateTopicMutation,
  useUpdateTopicWhenIssueDeletedMutation,
  useAddLinksToTopicMutation,
  type IssueQuery,
} from "../generated/graphql";

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
  topics,
  onChange,
  onDelete,
  refresh,
  isDragOverlay,
}: {
  id: UniqueIdentifier;
  link: LinkData;
  topics: TopicData[];
  onChange: (link: LinkData) => void;
  onDelete: () => void;
  refresh: () => void;
  isDragOverlay?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LinkCard
        link={link}
        topics={topics}
        onChange={onChange}
        onDelete={onDelete}
        refresh={refresh}
        {...(listeners && { dragListeners: listeners })}
        {...(isDragOverlay && { isDragOverlay })}
      />
    </div>
  );
}

// Trash drop zone
function Trash({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: TRASH_ID });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 border-2 border-dashed transition-colors ${
        isOver
          ? "border-red-500 bg-red-500/10 text-red-500"
          : "border-neu-400 dark:border-neu-600 text-neu-500 dark:text-neu-400"
      }`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
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

export default function IssuePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [newTopic, setNewTopic] = useState("");
  const [newLink, setNewLink] = useState("");
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
  const [activeSubmission, setActiveSubmission] = useState<{
    title: string;
    description: string;
    url: string;
  } | null>(null);

  const { data: linksData, isLoading: linksLoading } = useAllLinksQuery();
  const { data: issueData, isLoading: issueLoading } = useIssueQuery({ id });

  const createTopicMutation = useCreateTopicMutation();
  const createLinkMutation = useCreateLinkMutation();
  const updateLinkMutation = useUpdateLinkMutation();
  const deleteLinkMutation = useDeleteLinkMutation();
  const updateTopicMutation = useUpdateTopicMutation();
  const removeTopicMutation = useUpdateTopicWhenIssueDeletedMutation();
  const addLinksToTopicMutation = useAddLinksToTopicMutation();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["AllLinks"] });
    queryClient.invalidateQueries({ queryKey: ["Issue", { id }] });
  }, [queryClient, id]);

  const issue = issueData?.issue;
  const topics = issue?.topics ?? [];
  const allLinks = linksData?.allLinks ?? [];

  // Build link lookup map
  const linkMap = useMemo(() => {
    const map = new Map<string, LinkData>();
    allLinks.forEach((link) => {
      if (link.id) map.set(link.id, link as LinkData);
    });
    topics.forEach((topic) => {
      (topic.links ?? []).forEach((link) => {
        if (link.id) map.set(link.id, link);
      });
    });
    return map;
  }, [allLinks, topics]);

  // Initialize items from data (only when server data changes, not on moves)
  useEffect(() => {
    if (!issue) return;

    const newItems: Items = {};

    // Unassigned links
    const unassigned = allLinks
      .filter(
        (link) =>
          link.topic === null && link.id && !deletedLinkIds.has(link.id),
      )
      .map((link) => link.id!);
    newItems[UNASSIGNED_ID] = unassigned;

    // Topic links
    topics.forEach((topic) => {
      if (topic.id) {
        const topicLinks = (topic.links ?? [])
          .filter((link) => link.id && !deletedLinkIds.has(link.id))
          .map((link) => link.id!);
        newItems[topic.id] = topicLinks;
      }
    });

    setItems(newItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue, allLinks, topics, deletedLinkIds]);

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
    createTopicMutation.mutate(
      { issue_comment: " ", title: newTopic, issueId: id },
      {
        onSuccess: () => {
          setNewTopic("");
          invalidateQueries();
        },
      },
    );
  }, [createTopicMutation, newTopic, id, invalidateQueries]);

  const submitLink = useCallback(() => {
    if (!newLink || !/^https?:\/\/.+/.test(newLink)) return;
    createLinkMutation.mutate(
      { url: newLink },
      {
        onSuccess: () => {
          setNewLink("");
          invalidateQueries();
        },
      },
    );
  }, [createLinkMutation, newLink, invalidateQueries]);

  const handleLinkChange = useCallback((link: LinkData) => {
    setEditedLinks((prev) =>
      new Map(prev).set(link.id!, {
        title: link.title ?? null,
        text: link.text ?? null,
        url: link.url ?? null,
      }),
    );
  }, []);

  const handleLinkDelete = useCallback((linkId: string) => {
    setDeletedLinkIds((prev) => new Set(prev).add(linkId));
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
    async (topicIndex: number, direction: "up" | "down") => {
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
    const linkPromises = [...editedLinks.entries()].map(([lid, changes]) =>
      updateLinkMutation.mutateAsync({
        id: lid,
        title: changes.title!,
        text: changes.text!,
        url: changes.url!,
      }),
    );

    const deletePromises = [...deletedLinkIds].map((lid) =>
      deleteLinkMutation.mutateAsync({ id: lid }),
    );

    const movePromises = [...linkMoves.entries()].map(([linkId, topicId]) => {
      if (topicId === UNASSIGNED_ID) {
        // TODO: Need a mutation to unassign link from topic
        return Promise.resolve();
      }
      return addLinksToTopicMutation.mutateAsync({ topicId, linkId });
    });

    await Promise.all([...linkPromises, ...deletePromises, ...movePromises]);

    setEditedLinks(new Map());
    setDeletedLinkIds(new Set());
    setLinkMoves(new Map());
    invalidateQueries();
  }, [
    editedLinks,
    deletedLinkIds,
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
    addLinksToTopicMutation.isPending;

  const activeLink = activeId ? linkMap.get(String(activeId)) : null;

  return (
    <div className="min-h-screen bg-neu-50 dark:bg-neu-950">
      <Navbar>
        <PageHeader {...issue} topics={topics} />
      </Navbar>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Paste URL to add link..."
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="flex-1 px-3 py-2 border border-neu-300 dark:border-neu-600 dark:bg-neu-800 dark:text-neu-100 text-sm focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] outline-none"
          />
          <Button
            variant="secondary"
            onClick={submitLink}
            disabled={createLinkMutation.isPending || !newLink}
          >
            Add
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={({ active }) => {
            setActiveId(active.id);
            setClonedItems(items);

            // Track submission data for overlay
            const activeIdStr = String(active.id);
            if (activeIdStr.startsWith(SUBMISSION_PREFIX)) {
              const data = active.data.current as
                | {
                    title: string;
                    description: string;
                    url: string;
                  }
                | undefined;
              setActiveSubmission(data ?? null);
            } else {
              setActiveSubmission(null);
            }
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
                  overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
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
                    type: string;
                    id: string;
                    url: string;
                    title: string;
                    description: string;
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
                        title: submissionData.title || "",
                        text: submissionData.description || "",
                        url: submissionData.url,
                      });

                      // Mark submission as consumed
                      if (submissionData.id) {
                        markSubmissionConsumed(submissionData.id);
                      }

                      if (overContainer !== UNASSIGNED_ID) {
                        // If dropped on a topic, also assign it
                        addLinksToTopicMutation.mutate(
                          { topicId: String(overContainer), linkId: newLinkId },
                          { onSuccess: invalidateQueries },
                        );
                      } else {
                        invalidateQueries();
                      }
                    },
                  },
                );
              }

              setActiveId(null);
              setActiveSubmission(null);
              return;
            }

            const activeContainer = findContainer(active.id);

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
                  [activeContainer]: container.filter((id) => id !== active.id),
                };
              });
              setDeletedLinkIds((prev) => new Set(prev).add(String(active.id)));
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
                setLinkMoves((prev) =>
                  new Map(prev).set(String(active.id), String(overContainer)),
                );
              }
            }

            setActiveId(null);
            setActiveSubmission(null);
          }}
          onDragCancel={onDragCancel}
        >
          {/* Unassigned section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
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
                      key={linkId}
                      id={linkId}
                      link={getMergedLink(link)}
                      topics={topics}
                      onChange={handleLinkChange}
                      onDelete={() => handleLinkDelete(link.id!)}
                      refresh={invalidateQueries}
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
              <section key={topic.id} className="mb-8 group/topic">
                <div
                  className="flex items-center gap-3 mb-3"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" && !isFirst) {
                      e.preventDefault();
                      handleTopicMove(topicIndex, "up");
                    } else if (e.key === "ArrowDown" && !isLast) {
                      e.preventDefault();
                      handleTopicMove(topicIndex, "down");
                    }
                  }}
                >
                  <h3 className="text-lg text-neu-900 dark:text-neu-100">
                    {topic.title}
                  </h3>
                  <span className="text-sm text-neu-500 dark:text-neu-400">
                    {topicItems.length} links
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/topic:opacity-100">
                    <button
                      onClick={() => handleTopicMove(topicIndex, "up")}
                      disabled={isFirst || updateTopicMutation.isPending}
                      className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleTopicMove(topicIndex, "down")}
                      disabled={isLast || updateTopicMutation.isPending}
                      className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800 transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleTopicRemove(topic.id!, topic.title!)}
                      disabled={removeTopicMutation.isPending}
                      className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors hover:duration-0 disabled:opacity-50"
                      title="Remove topic from issue"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
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
                          key={linkId}
                          id={linkId}
                          link={getMergedLink(link)}
                          topics={topics}
                          onChange={handleLinkChange}
                          onDelete={() => handleLinkDelete(link.id!)}
                          refresh={invalidateQueries}
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

          {/* Drag Overlay */}
          {createPortal(
            <DragOverlay>
              {activeId && activeLink ? (
                <div className="shadow-lg scale-[1.02]">
                  <LinkCard
                    link={getMergedLink(activeLink)}
                    topics={topics}
                    onChange={() => {}}
                    onDelete={() => {}}
                    refresh={() => {}}
                    isDragOverlay
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
          )}

          {/* Trash zone - shown when dragging */}
          {activeId && !containers.includes(String(activeId)) && (
            <Trash isOver={false} />
          )}

          {/* Submissions panel */}
          <SubmissionsPanel />
        </DndContext>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New topic name..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="flex-1 px-3 py-2 border border-neu-300 dark:border-neu-600 dark:bg-neu-800 dark:text-neu-100 text-sm focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] outline-none"
          />
          <Button
            variant="secondary"
            onClick={submitTopic}
            disabled={createTopicMutation.isPending || !newTopic}
          >
            Add Topic
          </Button>
        </div>
      </main>

      {hasUnsavedChanges && (
        <>
          <div className="h-20" />
          <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-neu-900 border-t border-neu-200 dark:border-neu-700 shadow-lg dark:shadow-neu-950/50">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-neu-600 dark:text-neu-400">
                {changesCount} unsaved{" "}
                {changesCount === 1 ? "change" : "changes"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={discardAll}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button variant="primary" onClick={saveAll} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
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
  id,
  items,
  children,
}: {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`bg-white dark:bg-neu-900 border border-neu-200 dark:border-neu-700 min-h-[60px] transition-colors ${
          isOver ? "bg-neu-100 dark:bg-neu-800" : ""
        }`}
      >
        {children}
      </div>
    </SortableContext>
  );
}
