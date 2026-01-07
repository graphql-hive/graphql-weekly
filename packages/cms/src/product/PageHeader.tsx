import { Component, MouseEvent } from "react";
import styled from "react-emotion";
import withRouter from "react-router-dom/withRouter";
import { graphql, compose, MutationFn } from "react-apollo";
import { gql } from "apollo-boost";
import { RouteComponentProps } from "react-router-dom";
import { Button } from "../components/Button";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";

const Title = styled("h1")`
  margin: 0;
`;

const publishIssue = gql`
  mutation pub($id: String!, $published: Boolean) {
    updateIssue(id: $id, published: $published) {
      id
    }
  }
`;

const incrVersion = gql`
  mutation incrVersion(
    $id: String!
    $versionCount: Int
    $isFoundation: Boolean
  ) {
    publishEmailDraft(
      id: $id
      versionCount: $versionCount
      isFoundation: $isFoundation
    ) {
      id
      versionCount
    }
  }
`;

const deleteIssueMutation = gql`
  mutation delete($id: String!) {
    deleteIssue(id: $id) {
      id
    }
  }
`;

const updateTopicWhenIssueDeletedMutation = gql`
  mutation updateTopic($id: String!) {
    updateTopicWhenIssueDeleted(id: $id) {
      id
    }
  }
`;

interface Topic {
  id: string;
}

interface PageHeaderProps extends RouteComponentProps {
  id: string;
  title: string;
  versionCount: number;
  published: boolean;
  topics: Topic[];
  publishIssue: MutationFn;
  increaseVersion: MutationFn;
  deleteIssue: MutationFn;
  updateTopicWhenIssueDeleted: MutationFn;
}

interface PageHeaderState {
  isFoundation: boolean;
}

class PageHeader extends Component<PageHeaderProps, PageHeaderState> {
  override state: PageHeaderState = {
    isFoundation: false,
  };

  handlePublish = (isFoundation: boolean) => {
    return this.props.publishIssue({
      variables: {
        id: this.props.id,
        published: true,
        isFoundation,
      },
    });
  };

  increaseVersion = (isFoundation: boolean) => {
    return this.props.increaseVersion({
      variables: {
        id: this.props.id,
        versionCount: this.props.versionCount + 1,
        isFoundation,
      },
    });
  };

  deleteIssue = () => {
    return this.props.topics.map((topic) => {
      return this.props
        .updateTopicWhenIssueDeleted({
          variables: { id: topic.id },
        })
        .then(() => {
          return this.props
            .deleteIssue({
              variables: { id: this.props.id },
            })
            .then(() => {
              this.props.history.push("/");
            });
        });
    });
  };

  override render() {
    const { published } = this.props;

    return (
      <Flex>
        <FlexCell align="center">
          <Title>
            Curating: <strong>{this.props.title}</strong> (version{" "}
            {this.props.versionCount})
          </Title>
        </FlexCell>
        <FlexCell align="center">
          <Title>
            <input
              type="checkbox"
              onClick={(event: MouseEvent<HTMLInputElement>) => {
                const target = event.target as HTMLInputElement;
                this.setState({ isFoundation: target.checked });
              }}
            />{" "}
            Foundation Edition
          </Title>
        </FlexCell>
        <FlexCell align="center">
          <Flex align="flex-end">
            <FlexCell align="center" grow="0" basis="auto">
              <Button
                onClick={() => this.handlePublish(this.state.isFoundation)}
              >
                Publish
              </Button>
            </FlexCell>
            <FlexCell align="center" grow="0" basis="auto" margin="0 0 0 10px">
              <Button
                color="grey-bg"
                onClick={() => this.increaseVersion(this.state.isFoundation)}
              >
                Create Email
              </Button>
            </FlexCell>
            {!published && (
              <FlexCell
                align="center"
                grow="0"
                basis="auto"
                margin="0 0 0 10px"
              >
                <Button color="red" onClick={this.deleteIssue}>
                  Delete Issue
                </Button>
              </FlexCell>
            )}
          </Flex>
        </FlexCell>
      </Flex>
    );
  }
}

export default compose(
  withRouter,
  graphql(publishIssue, { name: "publishIssue" }),
  graphql(incrVersion, { name: "increaseVersion" }),
  graphql(deleteIssueMutation, { name: "deleteIssue" }),
  graphql(updateTopicWhenIssueDeletedMutation, {
    name: "updateTopicWhenIssueDeleted",
  })
)(PageHeader);
