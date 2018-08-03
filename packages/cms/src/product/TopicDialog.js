import React from "react";
import { graphql } from "react-apollo";
import { gql } from "apollo-boost";
import { Button } from "../components/Button";
import Radio from "../components/Radio";
import Flex from "../components/Flex";

const addLinks = gql`
  mutation addLinks($topicTopicId: ID!, $linksLinkId: ID!) {
    addToLinksOnTopic(topicTopicId: $topicTopicId, linksLinkId: $linksLinkId) {
      topicTopic {
        id
      }
    }
  }
`;

class TopicDialog extends React.Component {
  constructor(props) {
    super(props);

    console.log(props);

    this.state = {
      topicId: (props.link && props.link.topic && props.link.topic.id) || ''
    };
  }

  handleClick = () => {
    return this.props
      .mutate({
        variables: {
          topicTopicId: this.state.topicId,
          linksLinkId: this.props.linkId
        }
      })
      .then(() => {
        this.props.refresh();
        this.props.onPanelClose();
      });
  };

  handleChange = topicId => {
    return this.setState({
      topicId
    });
  };

  render() {
    return (
      <section>
        <h1 style={{ margin: "0 0 32px" }}>Assign this link to a topic:</h1>
        {this.props.topics.map((topic, index) => {
          return (
            <Radio
              onClick={this.handleChange}
              selectedValue={this.state.topicId}
              value={topic.id}
              key={index}
            >
              {topic.title}
            </Radio>
          );
        })}
        <Flex align="flex-end">
          <Button onClick={this.handleClick}>Submit</Button>
        </Flex>
      </section>
    );
  }
}

export default graphql(addLinks)(TopicDialog);
