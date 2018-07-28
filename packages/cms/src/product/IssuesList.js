import React from "react";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import chunk from "lodash.chunk";
import Card from "../components/Card";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";
import { ButtonLink } from "../components/Button";
import Loading from "../components/Loading";

const query = gql`
  query issues {
    allIssues {
      id
      title
      published
    }
  }
`;

class IssuesList extends React.PureComponent {
  renderIssues() {
    const allIssues = chunk(this.props.data.allIssues, 10);

    return allIssues.map((issues, index) => {
      return (
        <Flex key={index} margin="0 10px 0 0">
          {issues
            .sort((a, b) => {
              return (
                parseInt(b.title.split(" ")[1], 10) <
                parseInt(a.title.split(" ")[1], 10)
              );
            })
            .map(issue => {
              console.log(issue);
              return (
                <FlexCell
                  key={issue.id}
                  margin="0 0 10px"
                  style={{ marginRight: 10, textAlign: "center" }}
                >
                  <ButtonLink
                    style={{ width: "100%" }}
                    color="grey-bg"
                    disabled={issue.published}
                    to={`/issue/${issue.id}`}
                  >
                    {issue.title}
                  </ButtonLink>
                </FlexCell>
              );
            })}
        </Flex>
      );
    });
  }
  render() {
    const { data } = this.props;

    if (data.loading) {
      return (
        <Card>
          <Loading />
        </Card>
      );
    }

    return <Card>{this.renderIssues()}</Card>;
  }
}

export default graphql(query)(IssuesList);
