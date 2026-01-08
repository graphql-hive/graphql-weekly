import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import Loading from "../components/Loading";
import SpringList from "../components/SpringList";
import LinkCard from "../product/LinkCard";
import PageHeader from "../product/PageHeader";

import {
  useAllLinksQuery,
  useIssueQuery,
  useCreateTopicMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  type IssueQuery,
} from "../generated/graphql";

type TopicData = NonNullable<
  NonNullable<IssueQuery["issue"]>["topics"]
>[number];
type LinkData = NonNullable<TopicData["links"]>[number];

export default function IssueList() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [newTopic, setNewTopic] = useState("");
  const [editedLinks, setEditedLinks] = useState<
    Map<string, Partial<LinkData>>
  >(new Map());
  const [deletedLinkIds, setDeletedLinkIds] = useState<Set<string>>(new Set());
  const [linkOrder, setLinkOrder] = useState<Map<string, string[]>>(new Map());

  const { data: linksData, isLoading: linksLoading } = useAllLinksQuery();
  const { data: issueData, isLoading: issueLoading } = useIssueQuery({ id });

  const createTopicMutation = useCreateTopicMutation();
  const updateLinkMutation = useUpdateLinkMutation();
  const deleteLinkMutation = useDeleteLinkMutation();

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <PageHeader {...issue} topics={topics} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Unassigned</h2>
            <span className="text-sm text-gray-500">
              {orderedUnassigned.length} links
            </span>
          </div>

          {orderedUnassigned.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 text-sm">
              No unassigned links
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Paste URL to add link..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Add
            </button>
          </div>
        </section>

        {topics.map((topic) => {
          const visibleLinks = (topic.links ?? []).filter(
            (link) => !deletedLinkIds.has(link.id!)
          );
          const orderedLinks = getOrderedLinks(topic.id!, visibleLinks);

          return (
            <section key={topic.id} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {topic.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {orderedLinks.length} links
                </span>
              </div>

              {orderedLinks.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 text-sm">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
          <button
            onClick={submitTopic}
            disabled={createTopicMutation.isPending || !newTopic}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Topic
          </button>
        </div>
      </main>

      {hasUnsavedChanges && (
        <>
          <div className="h-20" />
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {changesCount} unsaved{" "}
                {changesCount === 1 ? "change" : "changes"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={discardAll}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={saveAll}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
