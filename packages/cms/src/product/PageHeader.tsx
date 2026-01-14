import { useState } from "react";
import { Button } from "../components/Button";

import {
  usePublishIssueMutation,
  usePublishEmailDraftMutation,
  useDeleteIssueMutation,
  useUpdateTopicWhenIssueDeletedMutation,
} from "../generated/graphql";

const BASE_PATH = import.meta.env.BASE_URL || "/admin";

interface Topic {
  id?: string | null;
}

interface PageHeaderProps {
  id?: string | null;
  title?: string | null;
  versionCount?: number | null;
  published?: boolean | null;
  topics?: Topic[];
}

export default function PageHeader({
  id,
  title,
  versionCount,
  published,
  topics = [],
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
      versionCount: (versionCount ?? 0) + 1,
      isFoundation,
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
    window.location.href = BASE_PATH;
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
            type="checkbox"
            checked={isFoundation}
            onChange={(e) => setIsFoundation(e.target.checked)}
            className="w-3.5 h-3.5"
          />
          Foundation
        </label>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={handlePublish}>
            Publish
          </Button>
          <Button variant="secondary" onClick={increaseVersion}>
            Create Email
          </Button>
          {!published && (
            <Button variant="danger" onClick={handleDeleteIssue}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
