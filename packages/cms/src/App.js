import React, { Fragment, Component } from "react";
import withRouter from "react-router-dom/withRouter";
import { graphql, compose } from "react-apollo";
import { gql } from "apollo-boost";

import Loading from "./components/Loading";
import Card from "./components/Card";
import Flex from "./components/Flex";
import FlexItem from "./components/FlexCell";
import InputWithButton from "./components/InputWithButton";

import { colors } from "./style/colors";
import LinkCreator from "./product/LinkCreator";
import Topic from "./product/Topic";
import Content from "./product/Content";
import { Header, HeaderContainer } from "./product/Headers";

import client from "./client";
import PageHeader from "./PageHeader";

const allLinksQuery = gql`
  query allLinks {
    allLinks {
      topic {
        id
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
      title
      published
      versionCount
      topics(orderBy: position_ASC) {
        id
        title
        links(orderBy: position_ASC) {
          title
          text
          url
          id
        }
      }
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
    client
      .mutate(
        `{
          createTopic(issue_comment:" " title:"${
            this.state.newTopic
          }", issueId:"${this.props.params.id}"){id}
        }`
      )
      .then(() => {
        this.setState({ loading: false, newTopic: "" });
        this.refreshEverything();
      });
  };

  renderTopics() {
    const data = this.props.issues.Issue.topics;

    return data.map((topic, index) => (
      <Topic
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
        ) : (
          <section>
            <p>No Links found! Add some below:</p>
            <LinkCreator refresh={this.refreshEverything} />
          </section>
        )}
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
      </Fragment>
    );
  }
}
export default compose(
  withRouter,
  graphql(allLinksQuery, {
    name: "links"
  }),
  graphql(issueQuery, {
    name: "issues",
    options: ({ match }) => {
      return {
        variables: {
          id: match.params.id
        }
      };
    }
  })
)(App);
