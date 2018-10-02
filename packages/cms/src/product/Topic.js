import React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import InputWithButton from "../components/InputWithButton";
import { colors } from "../style/colors";
import { HeaderContainer, Header } from "./Headers";
import Content from "./Content";

class PositionUpdater extends React.Component {
  constructor(props) {
    super();

    this.state = {
      loading: false,
      position: props && props.position
    };
  }

  handlePositionChange = e => {
    this.setState({
      position: e.target.value
    });
  };

  submitPosition = () => {
    return this.props
      .mutate({
        variables: {
          id: this.props.topicId,
          position: parseInt(this.state.position, 10) || 0
        }
      })
      .then(() => {
        return this.props.refresh();
      });
  };

  render() {
    return (
      <section style={{ alignSelf: 'center'}}>
        <InputWithButton
          style={{width: 24}}
          type="number"
          buttonLabel={"Change"}
          buttonDisabled={this.state.loading}
          onClick={this.submitPosition}
          value={this.state.position}
          disabled={this.state.loading}
          onChange={this.handlePositionChange}
          placeholder="Topic Position"
        />
      </section>
    );
  }
}

PositionUpdater = graphql(gql`
  mutation updateTopic($id: ID!, $position: Int) {
    updateTopic(id: $id, position: $position) {
      id
      position
    }
  }
`)(PositionUpdater);

export default function Topic({ topic, topicIndex, topics, refresh }) {
  return (
    <section style={{ marginBottom: "10px" }}>
      <HeaderContainer>
        <Header>{topic.title}</Header>
        <PositionUpdater
          refresh={refresh}
          topics={topics}
          topicId={topic.id}
          topicIndex={topicIndex}
          position={topic.position}
        />
      </HeaderContainer>
      <section style={{ border: `1px solid ${colors.gray}` }}>
        {topic.links.map((link, index) => (
          <Content
            hasDelete
            link={link}
            key={link.id}
            linkId={link.id}
            topics={topics}
            refresh={refresh}
          />
        ))}
      </section>
    </section>
  );
}
