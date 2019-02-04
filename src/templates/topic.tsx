import * as React from 'react'
import Helmet from 'react-helmet'
import styled from '../components/style/styled'

// Local
import { Layout } from '../components/shared/Layout'
import { Header } from '../components/home/Header'
import { MetaTags } from '../components/shared/MetaTags'
import { Container } from '../components/shared/Container'
import { Topic } from '../components/home/Content/Topic'
import { Sidebar } from '../components/home/Content/Sidebar'
import { Footer } from '../components/home/Footer'
import { SubmitForm } from '../components/home/Header/SubmitForm'
import { IssueType, TopicLinksType } from '../types'

type State = { submitModal: boolean }
type Props = {
  pageContext: {
    topicTitle: string
    topicLinks: TopicLinksType[]
    allIssues: IssueType[]
    firstIssueNumber: number
    topicsTitles: string[]
  }
}

export default class TopicTemplate extends React.Component<Props, State> {
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
            <Topic
              title={this.props.pageContext.topicTitle}
              topicLinks={this.props.pageContext.topicLinks}
            />
            <Sidebar
              submitModalClickHandler={this.submitModalClickHandler}
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