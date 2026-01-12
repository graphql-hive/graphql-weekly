import { useState } from "react";
import { Button } from "../components/Button";
import Radio from "../components/Radio";
import Flex from "../components/Flex";
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
  topics?: Topic[];
  refresh?: () => void;
  onPanelClose?: () => void;
}

export default function TopicDialog({
  link,
  linkId,
  topics = [],
  refresh,
  onPanelClose,
}: TopicDialogProps) {
  const [topicId, setTopicId] = useState(link?.topic?.id ?? "");
  const addLinksToTopicMutation = useAddLinksToTopicMutation();

  const handleClick = () => {
    if (!topicId || !linkId) return;
    addLinksToTopicMutation.mutate(
      { topicId, linkId },
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
          onClick={setTopicId}
          selectedValue={topicId}
          value={topic.id ?? ""}
          key={index}
        >
          {topic.title}
        </Radio>
      ))}
      <Flex align="flex-end">
        <Button
          onClick={handleClick}
          disabled={addLinksToTopicMutation.isPending}
        >
          {addLinksToTopicMutation.isPending ? "Saving..." : "Submit"}
        </Button>
      </Flex>
    </section>
  );
}
