import React from "react";
import styled from "react-emotion";
import withRouter from "react-router-dom/withRouter";
import { graphql, compose } from "react-apollo";
import { gql } from "apollo-boost";
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
  mutation incrVersion($id: String!, $versionCount: Int) {
    updateIssue(id: $id, versionCount: $versionCount) {
      id
      versionCount
    }
  }
`;

const deleteIssue = gql`
  mutation delete($id: String!) {
    deleteIssue(id: $id) {
      id
    }
  }
`;

const updateTopicWhenIssueDeleted = gql`
  mutation updateTopic($id: String!) {
    updateTopicWhenIssueDeleted(id: $id) {
      id
    }
  }
`;

class PageHeader extends React.Component {
  handlePublish = () => {
    return this.props.publishIssue({
      variables: {
        id: this.props.id,
        published: true,
      },
    });
  };

  increaseVersion = () => {
    return this.props.increaseVersion({
      variables: {
        id: this.props.id,
        versionCount: this.props.versionCount + 1,
      },
    });
  };

  deleteIssue = () => {
    return this.props.topics.map(topic => {
      return this.props.updateTopicWhenIssueDeleted({
        variables: {
          id: topic.id,
        },
      })
      .then(() => {
        return this.props
          .deleteIssue({
            variables: {
              id: this.props.id,
            },
          })
          .then(() => {
            this.props.history.push("/");
          });
      });
    })
      // .updateTopicWhenIssueDeleted({
      //   variables: {
      //     id: this.props.id,
      //   },
      // })
      // .then(() => {
      //   return this.props
      //     .deleteIssue({
      //       variables: {
      //         id: this.props.id,
      //       },
      //     })
      //     .then(() => {
      //       this.props.history.push("/");
      //     });
      // });

    // return this.props
    //   .deleteIssue({
    //     variables: {
    //       id: this.props.id
    //     }
    //   })
    //   .then(() => {
    //     this.props.history.push("/");
    //   });
  };

  render() {
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
          <Flex align="flex-end">
            <FlexCell align="center" grow="0" basis="auto">
              <Button onClick={this.handlePublish}>Publish</Button>
            </FlexCell>
            <FlexCell align="center" grow="0" basis="auto" margin="0 0 0 10px">
              <Button color="grey-bg" onClick={this.increaseVersion}>
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
  graphql(publishIssue, {
    name: "publishIssue",
  }),
  graphql(incrVersion, {
    name: "increaseVersion",
  }),
  graphql(deleteIssue, {
    name: "deleteIssue",
  }),
  graphql(updateTopicWhenIssueDeleted, {
    name: "updateTopicWhenIssueDeleted",
  })
)(PageHeader);
