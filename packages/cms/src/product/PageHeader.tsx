import { useState } from "react";

import { cn } from "../cn";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import {
  useDeleteIssueMutation,
  usePublishEmailDraftMutation,
  usePublishIssueMutation,
  useUpdateTopicWhenIssueDeletedMutation,
} from "../generated/graphql";

const BASE_PATH = import.meta.env.BASE_URL || "/";

interface Topic {
  id?: string | null;
}

interface PageHeaderProps {
  id?: string | null;
  published?: boolean | null;
  title?: string | null;
  topics?: Topic[];
  versionCount?: number | null;
}

export function PageHeader({
  id,
  published,
  title,
  topics = [],
  versionCount,
}: PageHeaderProps) {
  const [isFoundation, setIsFoundation] = useState(false);

  const publishIssueMutation = usePublishIssueMutation();
  const publishEmailDraftMutation = usePublishEmailDraftMutation();
  const deleteIssueMutation = useDeleteIssueMutation();
  const updateTopicWhenIssueDeletedMutation =
    useUpdateTopicWhenIssueDeletedMutation();

  const isMutating =
    publishIssueMutation.isPending ||
    publishEmailDraftMutation.isPending ||
    deleteIssueMutation.isPending;

  const handlePublish = () => {
    if (!id) return;
    publishIssueMutation.mutate({ id, published: true });
  };

  const increaseVersion = () => {
    if (!id) return;
    publishEmailDraftMutation.mutate({
      id,
      isFoundation,
      versionCount: (versionCount ?? 0) + 1,
    });
  };

  const handleDeleteIssue = async () => {
    if (!id) return;
    for (const topic of topics) {
      if (topic.id) {
        await updateTopicWhenIssueDeletedMutation.mutateAsync({ id: topic.id });
      }
    }
    await deleteIssueMutation.mutateAsync({ id });
    globalThis.location.href = BASE_PATH;
  };

  // Extract issue number from title like "Issue 1"
  const issueNumber = title?.match(/\d+/)?.[0];

  return (
    <header className="sticky top-12 z-10 bg-neu-50 dark:bg-neu-950 border-b border-neu-200 dark:border-neu-800">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* System status line */}
          <div className="flex items-center gap-2 text-sm tabular-nums">
            <span className="text-neu-900 dark:text-neu-100">Issue</span>
            <span className="text-neu-900 dark:text-neu-100 font-medium">
              <span className="text-neu-400 dark:text-neu-500">#</span>
              {issueNumber}
            </span>
            <span className="text-neu-400 dark:text-neu-500 max-md:!text-transparent max-md:mx-auto">
              @
            </span>
            <span className="text-neu-500 dark:text-neu-400">
              v{versionCount}
            </span>
            {published ? (
              <Tag pulse variant="live">
                live
              </Tag>
            ) : (
              <Tag variant="draft">draft</Tag>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <label
              className={cn(
                "flex items-center gap-2 text-xs cursor-pointer select-none transition-colors",
                "text-neu-500 hover:text-neu-700 dark:text-neu-400 dark:hover:text-neu-200",
                isFoundation && "text-primary dark:text-primary",
              )}
            >
              <span
                className={cn(
                  "size-3 border transition-colors",
                  isFoundation
                    ? "bg-primary border-primary"
                    : "border-neu-400 dark:border-neu-600",
                )}
              />
              <input
                checked={isFoundation}
                className="sr-only"
                onChange={(e) => setIsFoundation(e.target.checked)}
                type="checkbox"
              />
              <span className="uppercase tracking-wider">foundation</span>
            </label>

            <div className="h-4 w-px bg-neu-300 dark:bg-neu-700 max-md:mx-auto max-md:!bg-transparent" />

            <div className="flex items-center gap-2">
              <Button
                disabled={isMutating}
                onClick={handlePublish}
                size="sm"
                variant="primary"
              >
                {publishIssueMutation.isPending ? "Publishing" : "Publish"}
              </Button>
              <Button
                disabled={isMutating}
                onClick={increaseVersion}
                size="sm"
                variant="secondary"
              >
                {publishEmailDraftMutation.isPending ? "Emailing" : "Email"}
              </Button>
              {!published && (
                <Button
                  className="text-base"
                  disabled={isMutating}
                  onClick={handleDeleteIssue}
                  size="sm"
                  square
                  variant="danger"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
