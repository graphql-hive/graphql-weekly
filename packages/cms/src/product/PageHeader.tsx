import { useState } from "react";

import { cn } from "../cn";
import { Button } from "../components/Button";
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
    <header
      className={cn(
        "sticky top-12 z-10 bg-neu-100 dark:bg-neu-900 border-b border-neu-200 dark:border-neu-800",
        isMutating && "opacity-70 pointer-events-none"
      )}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Issue identification */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-base text-neu-900 dark:text-neu-100 tabular-nums">
              Issue #{issueNumber}
            </h1>
            <span className="text-xs text-neu-500 dark:text-neu-500 tabular-nums">
              v{versionCount}
            </span>
            {published && (
              <span className="text-[10px] uppercase tracking-wider text-primary px-1.5 py-0.5 border border-primary/30 bg-primary/10">
                live
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-neu-500 dark:text-neu-400 cursor-pointer select-none hover:text-neu-700 dark:hover:text-neu-300 transition-colors">
              <input
                checked={isFoundation}
                className="w-3 h-3 accent-primary"
                onChange={(e) => setIsFoundation(e.target.checked)}
                type="checkbox"
              />
              <span className="uppercase tracking-wider">Foundation</span>
            </label>

            <div className="h-4 w-px bg-neu-300 dark:bg-neu-700" />

            <div className="flex items-center gap-2">
              <Button
                disabled={isMutating}
                onClick={handlePublish}
                variant="primary"
              >
                Publish
              </Button>
              <Button
                disabled={isMutating}
                onClick={increaseVersion}
                variant="secondary"
              >
                Email
              </Button>
              {!published && (
                <Button
                  disabled={isMutating}
                  onClick={handleDeleteIssue}
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
