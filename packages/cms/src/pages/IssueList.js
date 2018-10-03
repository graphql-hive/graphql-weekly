import React, { Fragment, Component } from "react";
import withRouter from "react-router-dom/withRouter";
import { graphql, compose } from "react-apollo";
import { gql } from "apollo-boost";

import Loading from "../components/Loading";
import Card from "../components/Card";
import Flex from "../components/Flex";
import FlexItem from "../components/FlexCell";
import InputWithButton from "../components/InputWithButton";

import { colors } from "../style/colors";
import LinkCreator from "../product/LinkCreator";
import PreviewImageUpdate from "../product/PreviewImageUpdate";
import Topic from "../product/Topic";
import Content from "../product/Content";
import { Header, HeaderContainer } from "../product/Headers";
import PageHeader from "../product/PageHeader";

const allLinksQuery = gql`
  query allLinks {
    allLinks {
      topic {
        id
        position
      }
      url
      text
      title
      id
    }
  }
`;

const issueQuery = gql`
  query issue($id: ID!) {
    Issue(id: $id) {
      id
      title
      published
      versionCount
      previewImage
      topics(orderBy: position_ASC) {
        id
        title
        position
        links(orderBy: position_ASC) {
          title
          text
          url
          id
          topic {
            id
            position
          }
        }
      }
    }
  }
`;

const createTopicMutation = gql`
  mutation createTopic(
    $issue_comment: String!
    $title: String!
    $issueId: ID!
  ) {
    createTopic(
      issue_comment: $issue_comment
      title: $title
      issueId: $issueId
    ) {
      id
    }
  }
`;

class App extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      newTopic: ""
    };
  }
  refreshEverything = () => {
    this.props.links.refetch();
    this.props.issues.refetch();
  };

  handleTopicChange = e => {
    this.setState({
      newTopic: e.target.value
    });
  };

  submitTopic = () => {
    this.setState({
      loading: true
    });

    this.props
      .createTopic({
        variables: {
          issue_comment: " ",
          title: this.state.newTopic,
          issueId: this.props.match.params.id
        }
      })
      .then(() => {
        this.setState({ loading: false, newTopic: "" });
        this.refreshEverything();
      });
  };

  renderTopics() {
    const data = this.props.issues.Issue.topics;

    return data.map((topic, index) => (
      <Topic
        topicIndex={index}
        key={topic.id}
        topic={topic}
        topics={data}
        refresh={this.refreshEverything}
      />
    ));
  }

  renderUnassignedLinks() {
    const data = this.props.links.allLinks.filter(link => link.topic === null);

    return (
      <section>
        <HeaderContainer>
          <Header>Unassigned Links</Header>
        </HeaderContainer>
        {data.length > 0 ? (
          <Fragment>
            <section style={{ border: `1px solid ${colors.gray}` }}>
              {data.map(link => {
                return (
                  <Content
                    hasDelete
                    link={link}
                    key={link.id}
                    topics={this.props.issues.Issue.topics}
                    linkId={link.id}
                    refresh={this.refreshEverything}
                  />
                );
              })}
            </section>
            <div style={{ marginTop: 16 }}>
              <LinkCreator refresh={this.refreshEverything} />
            </div>
          </Fragment>
        ) : (
          <section>
            <p>No Links found! Add some below:</p>
            <LinkCreator refresh={this.refreshEverything} />
          </section>
        )}
      </section>
    );
  }

  renderPreviewImage() {
    return (
      <section>
        <HeaderContainer>
          <Header>Preview Image</Header>
        </HeaderContainer>
        <PreviewImageUpdate
          previewImage={this.props.issues.Issue.previewImage}
          refresh={this.refreshEverything}
          id={this.props.issues.Issue.id}
        />
      </section>
    );
  }

  render() {
    if (this.props.links.loading || this.props.issues.loading) {
      return (
        <Card>
          <Loading />
        </Card>
      );
    }

    return (
      <Fragment>
        <Card>
          <PageHeader
            id={this.props.match.params.id}
            {...this.props.issues.Issue}
          />
        </Card>
        <Card>
          <Flex>
            <FlexItem>{this.renderUnassignedLinks()}</FlexItem>
            <FlexItem margin="0 0 0 10px">
              {this.renderTopics()}

              <Flex align="center" style={{ padding: 16 }}>
                <InputWithButton
                  buttonLabel={"Add Topic"}
                  buttonDisabled={this.state.loading}
                  onClick={this.submitTopic}
                  value={this.state.newTopic}
                  disabled={this.state.loading}
                  onChange={this.handleTopicChange}
                  placeholder="Topic Title"
                />
              </Flex>
            </FlexItem>
          </Flex>
        </Card>
        <Card>{this.renderPreviewImage()}</Card>
      </Fragment>
    );
  }
}
export default compose(
  withRouter,
  graphql(allLinksQuery, {
    name: "links",
    options: {
      fetchPolicy: "cache-and-network"
    }
  }),
  graphql(issueQuery, {
    name: "issues",
    options: ({ match }) => {
      return {
        variables: {
          id: match.params.id
        },
        fetchPolicy: "cache-and-network"
      };
    }
  }),
  graphql(createTopicMutation, {
    name: "createTopic"
  })
)(App);
