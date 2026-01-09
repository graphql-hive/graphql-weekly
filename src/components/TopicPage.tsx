import { Header } from './home/Header'
import { Container } from './shared/Container'
import { Topic } from './home/Content/Topic'
import { Sidebar } from './home/Content/Sidebar'
import type { IssueType, TopicLinksType } from '../types'

interface Props {
  topicTitle: string
  topicLinks: TopicLinksType[]
  allIssues: IssueType[]
  firstIssueNumber: number
  topicsTitles: string[]
}

export function TopicPage({
  topicTitle,
  topicLinks,
  allIssues,
  topicsTitles,
}: Props) {
  const noop = () => {}

  return (
    <>
      <Header submitModalClickHandler={noop} />

      <Container>
        <div className="flex">
          <Topic title={topicTitle} topicLinks={topicLinks} />
          <Sidebar
            submitModalClickHandler={noop}
            topicsTitles={topicsTitles}
            allIssues={allIssues}
          />
        </div>
      </Container>
    </>
  )
}
