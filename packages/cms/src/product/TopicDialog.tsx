import { Component } from "react";
import { graphql, MutationFn } from "react-apollo";
import { gql } from "apollo-boost";
import { Button } from "../components/Button";
import Radio from "../components/Radio";
import Flex from "../components/Flex";

const addLinks = gql`
  mutation addLinks($topicTopicId: String!, $linksLinkId: String!) {
    addLinksToTopic(topicId: $topicTopicId, linkId: $linksLinkId) {
      id
      issueId
    }
  }
`;

interface Topic {
  id: string;
  title: string;
}

interface Link {
  topic: { id: string } | null;
}

interface TopicDialogProps {
  mutate?: MutationFn;
  link?: Link;
  linkId?: string;
  topics?: Topic[];
  refresh?: () => void;
  onPanelClose?: () => void;
}

interface TopicDialogState {
  topicId: string;
}

class TopicDialog extends Component<TopicDialogProps, TopicDialogState> {
  constructor(props: TopicDialogProps) {
    super(props);
    this.state = {
      topicId: props.link?.topic?.id ?? "",
    };
  }

  handleClick = () => {
    return this.props
      .mutate?.({
        variables: {
          topicTopicId: this.state.topicId,
          linksLinkId: this.props.linkId,
        },
      })
      .then(() => {
        this.props.refresh?.();
        this.props.onPanelClose?.();
      });
  };

  handleChange = (topicId: string) => {
    this.setState({ topicId });
  };

  override render() {
    return (
      <section>
        <h1 style={{ margin: "0 0 32px" }}>Assign this link to a topic:</h1>
        {this.props.topics?.map((topic, index) => (
          <Radio
            onClick={this.handleChange}
            selectedValue={this.state.topicId}
            value={topic.id}
            key={index}
          >
            {topic.title}
          </Radio>
        ))}
        <Flex align="flex-end">
          <Button onClick={this.handleClick}>Submit</Button>
        </Flex>
      </section>
    );
  }
}

export default graphql(addLinks)(TopicDialog);
