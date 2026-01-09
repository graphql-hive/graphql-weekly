import { Header } from './home/Header'
import { Container } from './shared/Container'
import { Issue } from './home/Content/Issue'
import { Sidebar } from './home/Content/Sidebar'
import type { IssueType } from '../types'

interface Props {
  issue: IssueType
  allIssues: IssueType[]
  firstIssueNumber: number
  topicsTitles: string[]
}

export function IssuePage({
  issue,
  allIssues,
  firstIssueNumber,
  topicsTitles,
}: Props) {
  const noop = () => {}

  return (
    <>
      <Header submitModalClickHandler={noop} />

      <Container>
        <div className="flex">
          <Issue
            issue={issue}
            lastIssueNumber={allIssues[0].number}
            firstIssueNumber={firstIssueNumber}
          />
          <Sidebar
            submitModalClickHandler={noop}
            currentIssueNumber={issue.number}
            topicsTitles={topicsTitles}
            allIssues={allIssues}
          />
        </div>
      </Container>
    </>
  )
}
