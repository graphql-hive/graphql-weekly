import { useState } from "react";

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

  return (
    <>
      <span className="text-sm text-neu-600 dark:text-neu-400">
        Curating:{" "}
        <strong className="text-neu-900 dark:text-neu-100">{title}</strong>{" "}
        <span className="text-neu-400 dark:text-neu-500">
          (v{versionCount})
        </span>
      </span>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm text-neu-600 dark:text-neu-400 cursor-pointer select-none">
          <input
            checked={isFoundation}
            className="w-3.5 h-3.5"
            onChange={(e) => setIsFoundation(e.target.checked)}
            type="checkbox"
          />
          Foundation
        </label>

        <div className="flex items-center gap-2">
          <Button onClick={handlePublish} variant="primary">
            Publish
          </Button>
          <Button onClick={increaseVersion} variant="secondary">
            Create Email
          </Button>
          {!published && (
            <Button onClick={handleDeleteIssue} variant="danger">
              Delete
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
