import React, { Component, ChangeEvent } from "react";
import gql from "graphql-tag";
import { graphql, MutationFn } from "react-apollo";
import InputWithButton from "../components/InputWithButton";
import { colors } from "../style/colors";
import { HeaderContainer, Header } from "./Headers";
import Content from "./Content";

interface Link {
  id: string;
  title: string;
  text: string;
  url: string;
  topic: { id: string; position: number } | null;
}

interface TopicData {
  id: string;
  title: string;
  position: number;
  links: Link[];
}

interface PositionUpdaterProps {
  mutate?: MutationFn;
  refresh?: () => void;
  topicId?: string;
  position?: number;
}

interface PositionUpdaterState {
  loading: boolean;
  position: string;
}

class PositionUpdaterBase extends Component<
  PositionUpdaterProps,
  PositionUpdaterState
> {
  constructor(props: PositionUpdaterProps) {
    super(props);
    this.state = {
      loading: false,
      position: String(props.position ?? 0),
    };
  }

  handlePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ position: e.target.value });
  };

  submitPosition = () => {
    return this.props
      .mutate?.({
        variables: {
          id: this.props.topicId,
          position: parseInt(this.state.position, 10) || 0,
        },
      })
      .then(() => this.props.refresh?.());
  };

  override render() {
    return (
      <section
        style={{
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "#0c344b" }}>order</span>
        <InputWithButton
          style={{ width: 24 }}
          type="number"
          buttonLabel="Change"
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

const PositionUpdater = graphql(gql`
  mutation updateTopic($id: String!, $position: Int) {
    updateTopic(id: $id, position: $position) {
      id
      position
    }
  }
`)(PositionUpdaterBase as any) as React.ComponentType<{
  refresh?: () => void;
  topicId?: string;
  topicIndex?: number;
  position?: number;
  topics?: TopicData[];
}>;

interface TopicProps {
  topic: TopicData;
  topicIndex: number;
  topics: TopicData[];
  refresh: () => void;
}

export default function Topic({
  topic,
  topicIndex,
  topics,
  refresh,
}: TopicProps) {
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
        {topic.links.map((link) => (
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
