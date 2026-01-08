import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/Button";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";

import {
  usePublishIssueMutation,
  usePublishEmailDraftMutation,
  useDeleteIssueMutation,
  useUpdateTopicWhenIssueDeletedMutation,
} from "../generated/graphql";

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
  const [, navigate] = useLocation();
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
    navigate("/");
  };

  return (
    <Flex>
      <FlexCell align="center">
        <h1 className="m-0">
          Curating: <strong>{title}</strong> (version {versionCount})
        </h1>
      </FlexCell>
      <FlexCell align="center">
        <h1 className="m-0">
          <input
            type="checkbox"
            checked={isFoundation}
            onChange={(e) => setIsFoundation(e.target.checked)}
          />{" "}
          Foundation Edition
        </h1>
      </FlexCell>
      <FlexCell align="center">
        <Flex align="flex-end">
          <FlexCell align="center" grow="0" basis="auto">
            <Button onClick={handlePublish}>Publish</Button>
          </FlexCell>
          <FlexCell align="center" grow="0" basis="auto" margin="0 0 0 10px">
            <Button color="grey-bg" onClick={increaseVersion}>
              Create Email
            </Button>
          </FlexCell>
          {!published && (
            <FlexCell align="center" grow="0" basis="auto" margin="0 0 0 10px">
              <Button color="red" onClick={handleDeleteIssue}>
                Delete Issue
              </Button>
            </FlexCell>
          )}
        </Flex>
      </FlexCell>
    </Flex>
  );
}
