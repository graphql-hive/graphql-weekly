import { useState, useCallback } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../components/Button";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import SpringList from "../components/SpringList";
import LinkCard from "../product/LinkCard";
import PageHeader from "../product/PageHeader";

import {
  useAllLinksQuery,
  useIssueQuery,
  useCreateTopicMutation,
  useCreateLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useUpdateTopicMutation,
  useUpdateTopicWhenIssueDeletedMutation,
  type IssueQuery,
} from "../generated/graphql";

type TopicData = NonNullable<
  NonNullable<IssueQuery["issue"]>["topics"]
>[number];
type LinkData = NonNullable<TopicData["links"]>[number];

export default function IssuePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [newTopic, setNewTopic] = useState("");
  const [newLink, setNewLink] = useState("");
  const [editedLinks, setEditedLinks] = useState<
    Map<string, Partial<LinkData>>
  >(new Map());
  const [deletedLinkIds, setDeletedLinkIds] = useState<Set<string>>(new Set());
  const [linkOrder, setLinkOrder] = useState<Map<string, string[]>>(new Map());

  const { data: linksData, isLoading: linksLoading } = useAllLinksQuery();
  const { data: issueData, isLoading: issueLoading } = useIssueQuery({ id });

  const createTopicMutation = useCreateTopicMutation();
  const createLinkMutation = useCreateLinkMutation();
  const updateLinkMutation = useUpdateLinkMutation();
  const deleteLinkMutation = useDeleteLinkMutation();
  const updateTopicMutation = useUpdateTopicMutation();
  const removeTopicMutation = useUpdateTopicWhenIssueDeletedMutation();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["AllLinks"] });
    queryClient.invalidateQueries({ queryKey: ["Issue", { id }] });
  }, [queryClient, id]);

  const submitTopic = useCallback(() => {
    createTopicMutation.mutate(
      { issue_comment: " ", title: newTopic, issueId: id },
      {
        onSuccess: () => {
          setNewTopic("");
          invalidateQueries();
        },
      }
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
      }
    );
  }, [createLinkMutation, newLink, invalidateQueries]);

  const handleLinkChange = useCallback((link: LinkData) => {
    setEditedLinks((prev) =>
      new Map(prev).set(link.id!, {
        title: link.title ?? null,
        text: link.text ?? null,
        url: link.url ?? null,
      })
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
        { onSuccess: invalidateQueries }
      );
    },
    [removeTopicMutation, invalidateQueries]
  );

  const handleTopicMove = useCallback(
    async (topicIndex: number, direction: "up" | "down") => {
      const topics = issueData?.issue?.topics;
      if (!topics) return;

      const targetIndex = direction === "up" ? topicIndex - 1 : topicIndex + 1;
      if (targetIndex < 0 || targetIndex >= topics.length) return;

      const currentTopic = topics[topicIndex];
      const targetTopic = topics[targetIndex];
      if (!currentTopic?.id || !targetTopic?.id) return;

      // Swap positions
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
    [issueData?.issue?.topics, updateTopicMutation, invalidateQueries]
  );

  const handleLinkReorder = useCallback(
    (bucketId: string, orderedLinks: LinkData[], newOrder: number[]) => {
      const reorderedIds = newOrder.map((i) => orderedLinks[i]!.id!);
      setLinkOrder((prev) => new Map(prev).set(bucketId, reorderedIds));
    },
    []
  );

  const getOrderedLinks = useCallback(
    (bucketId: string, items: LinkData[]): LinkData[] => {
      const order = linkOrder.get(bucketId);
      if (!order) return items;
      const linkMap = new Map(items.map((link) => [link.id, link]));
      return order
        .map((lid) => linkMap.get(lid))
        .filter((x): x is LinkData => !!x);
    },
    [linkOrder]
  );

  const getMergedLink = useCallback(
    (link: LinkData): LinkData => {
      const edits = editedLinks.get(link.id!);
      return edits ? { ...link, ...edits } : link;
    },
    [editedLinks]
  );

  const hasUnsavedChanges =
    editedLinks.size > 0 || deletedLinkIds.size > 0 || linkOrder.size > 0;
  const changesCount = editedLinks.size + deletedLinkIds.size + linkOrder.size;

  const saveAll = useCallback(async () => {
    const linkPromises = [...editedLinks.entries()].map(([lid, changes]) =>
      updateLinkMutation.mutateAsync({
        id: lid,
        title: changes.title!,
        text: changes.text!,
        url: changes.url!,
      })
    );

    const deletePromises = [...deletedLinkIds].map((lid) =>
      deleteLinkMutation.mutateAsync({ id: lid })
    );

    await Promise.all([...linkPromises, ...deletePromises]);

    setEditedLinks(new Map());
    setDeletedLinkIds(new Set());
    setLinkOrder(new Map());
    invalidateQueries();
  }, [
    editedLinks,
    deletedLinkIds,
    updateLinkMutation,
    deleteLinkMutation,
    invalidateQueries,
  ]);

  const discardAll = useCallback(() => {
    setEditedLinks(new Map());
    setDeletedLinkIds(new Set());
    setLinkOrder(new Map());
  }, []);

  if (linksLoading || issueLoading || !issueData?.issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const issue = issueData.issue;
  const topics = issue.topics ?? [];
  const allLinks = linksData?.allLinks ?? [];

  const unassignedLinks = allLinks.filter(
    (link) => link.topic === null && !deletedLinkIds.has(link.id!)
  );
  const orderedUnassigned = getOrderedLinks(
    "unassigned",
    unassignedLinks as LinkData[]
  );

  const isSaving = updateLinkMutation.isPending || deleteLinkMutation.isPending;

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

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg  text-neu-900 dark:text-neu-100">
              Unassigned
            </h2>
            <span className="text-sm text-neu-500 dark:text-neu-400">
              {orderedUnassigned.length} links
            </span>
          </div>

          {orderedUnassigned.length > 0 ? (
            <div className="bg-white dark:bg-neu-900 border border-neu-200 dark:border-neu-700 overflow-hidden">
              <SpringList
                onDragEnd={(newOrder) =>
                  handleLinkReorder("unassigned", orderedUnassigned, newOrder)
                }
              >
                {orderedUnassigned.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={getMergedLink(link)}
                    topics={topics}
                    onChange={handleLinkChange}
                    onDelete={() => handleLinkDelete(link.id!)}
                    refresh={invalidateQueries}
                  />
                ))}
              </SpringList>
            </div>
          ) : (
            <div className="bg-white dark:bg-neu-900 border border-dashed border-neu-300 dark:border-neu-700 p-8 text-center text-neu-500 dark:text-neu-400 text-sm">
              No unassigned links
            </div>
          )}
        </section>

        {topics.map((topic, topicIndex) => {
          const visibleLinks = (topic.links ?? []).filter(
            (link) => !deletedLinkIds.has(link.id!)
          );
          const orderedLinks = getOrderedLinks(topic.id!, visibleLinks);
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
                <h3 className="text-lg  text-neu-900 dark:text-neu-100">
                  {topic.title}
                </h3>
                <span className="text-sm text-neu-500 dark:text-neu-400">
                  {orderedLinks.length} links
                </span>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/topic:opacity-100">
                  <button
                    onClick={() => handleTopicMove(topicIndex, "up")}
                    disabled={isFirst || updateTopicMutation.isPending}
                    className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800  transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-neu-600 dark:hover:text-neu-300 hover:bg-neu-100 dark:hover:bg-neu-800  transition-colors hover:duration-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="p-1.5 text-neu-400 dark:text-neu-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950  transition-colors hover:duration-0 disabled:opacity-50"
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

              {orderedLinks.length > 0 ? (
                <div className="bg-white dark:bg-neu-900  border border-neu-200 dark:border-neu-700">
                  <SpringList
                    onDragEnd={(newOrder) =>
                      handleLinkReorder(topic.id!, orderedLinks, newOrder)
                    }
                  >
                    {orderedLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={getMergedLink(link)}
                        topics={topics}
                        onChange={handleLinkChange}
                        onDelete={() => handleLinkDelete(link.id!)}
                        refresh={invalidateQueries}
                      />
                    ))}
                  </SpringList>
                </div>
              ) : (
                <div className="bg-white dark:bg-neu-900  border border-dashed border-neu-300 dark:border-neu-700 p-6 text-center text-neu-500 dark:text-neu-400 text-sm">
                  No links in this topic
                </div>
              )}
            </section>
          );
        })}

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
