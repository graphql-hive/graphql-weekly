import { useState } from "react";

import { Button } from "../components/Button";
import Flex from "../components/Flex";
import Radio from "../components/Radio";
import { useAddLinksToTopicMutation } from "../generated/graphql";

interface Topic {
  id?: string | null;
  title?: string | null;
}

interface Link {
  topic?: { id?: string | null } | null;
}

interface TopicDialogProps {
  link?: Link;
  linkId?: string;
  onPanelClose?: () => void;
  refresh?: () => void;
  topics?: Topic[];
}

export default function TopicDialog({
  link,
  linkId,
  onPanelClose,
  refresh,
  topics = [],
}: TopicDialogProps) {
  const [topicId, setTopicId] = useState(link?.topic?.id ?? "");
  const addLinksToTopicMutation = useAddLinksToTopicMutation();

  const handleClick = () => {
    if (!topicId || !linkId) return;
    addLinksToTopicMutation.mutate(
      { linkId, topicId },
      {
        onSuccess: () => {
          refresh?.();
          onPanelClose?.();
        },
      },
    );
  };

  return (
    <section>
      <h1 style={{ margin: "0 0 32px" }}>Assign this link to a topic:</h1>
      {topics.map((topic, index) => (
        <Radio
          key={index}
          onClick={setTopicId}
          selectedValue={topicId}
          value={topic.id ?? ""}
        >
          {topic.title}
        </Radio>
      ))}
      <Flex align="flex-end">
        <Button
          disabled={addLinksToTopicMutation.isPending}
          onClick={handleClick}
        >
          {addLinksToTopicMutation.isPending ? "Saving..." : "Submit"}
        </Button>
      </Flex>
    </section>
  );
}
