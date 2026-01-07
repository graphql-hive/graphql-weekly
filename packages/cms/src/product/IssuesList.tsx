import { PureComponent } from "react"
import { gql } from "apollo-boost"
import { graphql } from "react-apollo"
import chunk from "lodash.chunk"
import Flex from "../components/Flex"
import FlexCell from "../components/FlexCell"
import Card from "../components/Card"
import LinkCreator from "../product/LinkCreator"
import IssueCreator from "../product/IssueCreator"
import { ButtonLink } from "../components/Button"
import Loading from "../components/Loading"

interface Issue {
  id: string
  title: string
  published: boolean
}

interface IssuesQueryResult {
  allIssues: Issue[]
  loading: boolean
  refetch: () => Promise<unknown>
}

const query = gql`
  query issues {
    allIssues {
      id
      title
      published
    }
  }
`

interface IssuesListProps {
  data?: IssuesQueryResult | undefined
}

class IssuesList extends PureComponent<IssuesListProps> {
  renderIssues() {
    const allIssues = chunk(this.props.data?.allIssues ?? [], 10)

    return allIssues.map((issues, index) => (
      <Flex key={index} margin="0 10px 0 0">
        {issues
          .sort((a, b) => {
            const aNum = parseInt(a.title.split(" ")[1] ?? "0", 10)
            const bNum = parseInt(b.title.split(" ")[1] ?? "0", 10)
            return bNum - aNum
          })
          .map(issue => (
            <FlexCell
              key={issue.id}
              margin="0 0 10px"
              style={{ marginRight: 10, textAlign: "center" }}
            >
              <ButtonLink
                style={{ width: "100%" }}
                color="grey-bg"
                to={`/issue/${issue.id}`}
              >
                # {issue.title.split(" ")[1]}
              </ButtonLink>
            </FlexCell>
          ))}
      </Flex>
    ))
  }

  refresh = () => this.props.data?.refetch()

  override render() {
    const { data } = this.props

    if (data?.loading) {
      return (
        <Card>
          <Loading />
        </Card>
      )
    }

    return (
      <>
        <Card>
          <Flex>
            <FlexCell grow="0" basis="auto">
              <LinkCreator />
            </FlexCell>
            <FlexCell grow="0" basis="auto">
              <div style={{ marginLeft: 10 }}>
                <IssueCreator refresh={this.refresh} />
              </div>
            </FlexCell>
          </Flex>
        </Card>
        <Card>{this.renderIssues()}</Card>
      </>
    )
  }
}

export default graphql(query, {
  options: {
    fetchPolicy: "cache-and-network"
  }
})(IssuesList as any)
