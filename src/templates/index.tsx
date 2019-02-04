import * as React from 'react'
import Helmet from 'react-helmet'
import styled from '../components/style/styled'

// Local
import { Layout } from '../components/shared/Layout'
import { Header } from '../components/home/Header'
import { MetaTags } from '../components/shared/MetaTags'
import { Container } from '../components/shared/Container'
import { Issue } from '../components/home/Content/Issue'
import { Sidebar } from '../components/home/Content/Sidebar'
import { Footer } from '../components/home/Footer'
import { SubmitForm } from '../components/home/Header/SubmitForm'
import { IssueType } from '../types'

type State = { submitModal: boolean }
type Props = {
  pageContext: {
    issue: IssueType
    allIssues: IssueType[]
    firstIssueNumber: number
    topicsTitles: string[]
  }
}

export default class IndexTemplate extends React.Component<Props, State> {
  state = { submitModal: false }

  submitModalClickHandler = () => {
    this.setState({ submitModal: !this.state.submitModal })
  }

  render() {
    return (
      <Layout>
        <MetaTags />
        <Helmet />

        <Header submitModalClickHandler={this.submitModalClickHandler} />

        <Container>
          <LayoutWrapper>
            <Issue
              issue={this.props.pageContext.issue}
              lastIssueNumber={this.props.pageContext.allIssues[0].number}
              firstIssueNumber={this.props.pageContext.firstIssueNumber}
            />
            <Sidebar
              submitModalClickHandler={this.submitModalClickHandler}
              currentIssueNumber={this.props.pageContext.issue.number}
              topicsTitles={this.props.pageContext.topicsTitles}
              allIssues={this.props.pageContext.allIssues}
            />
          </LayoutWrapper>
        </Container>

        <Footer />
        {this.state.submitModal && (
          <SubmitForm onCancelClicked={() => this.submitModalClickHandler()} />
        )}
      </Layout>
    )
  }
}

const LayoutWrapper = styled.div`
  display: flex;
`