import { Component, ChangeEvent } from "react";
import withRouter from "react-router-dom/withRouter";
import { graphql, compose, MutationFn } from "react-apollo";
import { gql } from "apollo-boost";
import { RouteComponentProps } from "react-router-dom";
import styled from "react-emotion";

import Loading from "../components/Loading";
import Card from "../components/Card";
import Flex from "../components/Flex";
import FlexItem from "../components/FlexCell";
import InputWithButton from "../components/InputWithButton";
import { Button } from "../components/Button";

import { colors } from "../style/colors";
import LinkCreator from "../product/LinkCreator";
import PreviewImageUpdate from "../product/PreviewImageUpdate";
import LinkCard from "../product/LinkCard";
import { Header, HeaderContainer } from "../product/Headers";
import PageHeader from "../product/PageHeader";

interface LinkData {
  topic: { id: string; position: number } | null;
  url: string;
  text: string;
  title: string;
  id: string;
}

interface TopicData {
  id: string;
  title: string;
  position: number;
  links: LinkData[];
}

interface IssueData {
  id: string;
  title: string;
  published: boolean;
  versionCount: number;
  previewImage: string;
  topics: TopicData[];
}

interface LinksQueryResult {
  allLinks: LinkData[];
  loading: boolean;
  refetch: () => void;
}

interface IssuesQueryResult {
  issue: IssueData;
  loading: boolean;
  refetch: () => void;
}

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
  query issue($id: String!) {
    issue(id: $id) {
      id
      title
      published
      versionCount
      previewImage
      topics {
        id
        title
        position
        links {
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
    $issueId: String!
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

const updateLinkMutation = gql`
  mutation updateLink(
    $id: String!
    $title: String
    $text: String
    $url: String
  ) {
    updateLink(id: $id, title: $title, text: $text, url: $url) {
      id
    }
  }
`;

const deleteLinkMutation = gql`
  mutation deleteLink($id: String!) {
    deleteLink(id: $id) {
      id
    }
  }
`;

const updateTopicMutation = gql`
  mutation updateTopic($id: String!, $title: String, $position: Int) {
    updateTopic(id: $id, title: $title, position: $position) {
      id
    }
  }
`;

const ActionBar = styled("div")`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const ChangesIndicator = styled("span")`
  display: flex;
  align-items: center;
  color: ${colors.dark};
  font-size: 14px;
  margin-right: auto;
`;

const TopicSection = styled("section")`
  margin-bottom: 10px;
`;

const TopicHeader = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

interface AppProps extends RouteComponentProps<{ id: string }> {
  links: LinksQueryResult;
  issues: IssuesQueryResult;
  createTopic: MutationFn;
  updateLink: MutationFn;
  deleteLink: MutationFn;
  updateTopic: MutationFn;
}

interface AppState {
  loading: boolean;
  newTopic: string;
  editedLinks: Map<string, Partial<LinkData>>;
  editedTopics: Map<string, Partial<TopicData>>;
  deletedLinkIds: Set<string>;
}

class App extends Component<AppProps, AppState> {
  override state: AppState = {
    loading: false,
    newTopic: "",
    editedLinks: new Map(),
    editedTopics: new Map(),
    deletedLinkIds: new Set(),
  };

  refreshEverything = () => {
    this.props.links.refetch();
    this.props.issues.refetch();
  };

  handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTopic: e.target.value });
  };

  submitTopic = () => {
    this.setState({ loading: true });

    this.props
      .createTopic({
        variables: {
          issue_comment: " ",
          title: this.state.newTopic,
          issueId: this.props.match.params.id,
        },
      })
      .then(() => {
        this.setState({ loading: false, newTopic: "" });
        this.refreshEverything();
      });
  };

  handleLinkChange = (link: LinkData) => {
    this.setState((prev) => ({
      editedLinks: new Map(prev.editedLinks).set(link.id, {
        title: link.title,
        text: link.text,
        url: link.url,
      }),
    }));
  };

  handleLinkDelete = (linkId: string) => {
    this.setState((prev) => ({
      deletedLinkIds: new Set(prev.deletedLinkIds).add(linkId),
    }));
  };

  handleTopicTitleChange = (topicId: string, title: string) => {
    this.setState((prev) => ({
      editedTopics: new Map(prev.editedTopics).set(topicId, { title }),
    }));
  };

  getMergedLink = (link: LinkData): LinkData => {
    const edits = this.state.editedLinks.get(link.id);
    return edits ? { ...link, ...edits } : link;
  };

  getMergedTopicTitle = (topic: TopicData): string => {
    const edits = this.state.editedTopics.get(topic.id);
    return edits?.title ?? topic.title;
  };

  hasUnsavedChanges = () => {
    return (
      this.state.editedLinks.size > 0 ||
      this.state.editedTopics.size > 0 ||
      this.state.deletedLinkIds.size > 0
    );
  };

  getChangesCount = () => {
    return (
      this.state.editedLinks.size +
      this.state.editedTopics.size +
      this.state.deletedLinkIds.size
    );
  };

  saveAll = async () => {
    this.setState({ loading: true });

    const linkPromises = [...this.state.editedLinks.entries()].map(
      ([id, changes]) =>
        this.props.updateLink({ variables: { id, ...changes } })
    );

    const topicPromises = [...this.state.editedTopics.entries()].map(
      ([id, changes]) =>
        this.props.updateTopic({ variables: { id, ...changes } })
    );

    const deletePromises = [...this.state.deletedLinkIds].map((id) =>
      this.props.deleteLink({ variables: { id } })
    );

    await Promise.all([...linkPromises, ...topicPromises, ...deletePromises]);

    this.setState({
      loading: false,
      editedLinks: new Map(),
      editedTopics: new Map(),
      deletedLinkIds: new Set(),
    });

    this.refreshEverything();
  };

  discardAll = () => {
    this.setState({
      editedLinks: new Map(),
      editedTopics: new Map(),
      deletedLinkIds: new Set(),
    });
  };

  renderTopic(topic: TopicData, topics: TopicData[]) {
    const visibleLinks = topic.links.filter(
      (link) => !this.state.deletedLinkIds.has(link.id)
    );

    return (
      <TopicSection key={topic.id}>
        <HeaderContainer>
          <TopicHeader>
            <input
              value={this.getMergedTopicTitle(topic)}
              onChange={(e) =>
                this.handleTopicTitleChange(topic.id, e.target.value)
              }
              style={{
                fontSize: 18,
                fontWeight: 600,
                border: "none",
                background: "transparent",
                padding: "4px 0",
                width: "100%",
              }}
            />
          </TopicHeader>
        </HeaderContainer>
        <section style={{ border: `1px solid ${colors.gray}` }}>
          {visibleLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={this.getMergedLink(link)}
              topics={topics}
              onChange={this.handleLinkChange}
              onDelete={() => this.handleLinkDelete(link.id)}
              refresh={this.refreshEverything}
            />
          ))}
        </section>
      </TopicSection>
    );
  }

  renderTopics() {
    const topics = this.props.issues.issue.topics;
    return topics.map((topic) => this.renderTopic(topic, topics));
  }

  renderUnassignedLinks() {
    const allLinks = this.props.links.allLinks.filter(
      (link) => link.topic === null && !this.state.deletedLinkIds.has(link.id)
    );
    const topics = this.props.issues.issue.topics;

    return (
      <section>
        <HeaderContainer>
          <Header>Unassigned Links</Header>
        </HeaderContainer>
        {allLinks.length > 0 ? (
          <>
            <section style={{ border: `1px solid ${colors.gray}` }}>
              {allLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={this.getMergedLink(link)}
                  topics={topics}
                  onChange={this.handleLinkChange}
                  onDelete={() => this.handleLinkDelete(link.id)}
                  refresh={this.refreshEverything}
                />
              ))}
            </section>
            <div style={{ marginTop: 16 }}>
              <LinkCreator refresh={this.refreshEverything} />
            </div>
          </>
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
          previewImage={this.props.issues.issue.previewImage}
          refresh={this.refreshEverything}
          id={this.props.issues.issue.id}
        />
      </section>
    );
  }

  override render() {
    if (this.props.links.loading || this.props.issues.loading) {
      return (
        <Card>
          <Loading />
        </Card>
      );
    }

    const hasChanges = this.hasUnsavedChanges();

    return (
      <>
        <Card>
          <PageHeader {...this.props.issues.issue} />
        </Card>
        <Card>
          <Flex>
            <FlexItem>{this.renderUnassignedLinks()}</FlexItem>
            <FlexItem margin="0 0 0 10px">
              {this.renderTopics()}

              <Flex align="center" style={{ padding: 16 }}>
                <InputWithButton
                  buttonLabel="Add Topic"
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

        <div style={{ height: 80 }} />

        {hasChanges && (
          <ActionBar>
            <ChangesIndicator>
              {this.getChangesCount()} unsaved change
              {this.getChangesCount() > 1 ? "s" : ""}
            </ChangesIndicator>
            <Button
              color="grey"
              onClick={this.discardAll}
              disabled={this.state.loading}
            >
              Discard
            </Button>
            <Button onClick={this.saveAll} disabled={this.state.loading}>
              {this.state.loading ? "Saving..." : "Save All"}
            </Button>
          </ActionBar>
        )}
      </>
    );
  }
}

export default compose(
  withRouter,
  graphql(allLinksQuery, {
    name: "links",
    options: {
      fetchPolicy: "cache-and-network",
    },
  }),
  graphql(issueQuery, {
    name: "issues",
    options: ({ match }: RouteComponentProps<{ id: string }>) => ({
      variables: { id: match.params.id },
      fetchPolicy: "cache-and-network",
    }),
  }),
  graphql(createTopicMutation, { name: "createTopic" }),
  graphql(updateLinkMutation, { name: "updateLink" }),
  graphql(deleteLinkMutation, { name: "deleteLink" }),
  graphql(updateTopicMutation, { name: "updateTopic" })
)(App);
