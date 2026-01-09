import { useRef } from 'react'
import { Header } from './home/Header'
import { Container } from './shared/Container'
import { Issue } from './home/Content/Issue'
import { Sidebar } from './home/Content/Sidebar'
import { SubmitForm, type SubmitFormHandle } from './shared/SubmitForm'
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
  const submitFormRef = useRef<SubmitFormHandle>(null)
  const openModal = () => submitFormRef.current?.showModal()

  return (
    <>
      <Header submitModalClickHandler={openModal} />

      <Container>
        <div className="flex">
          <Issue
            issue={issue}
            lastIssueNumber={allIssues[0].number}
            firstIssueNumber={firstIssueNumber}
          />
          <Sidebar
            submitModalClickHandler={openModal}
            currentIssueNumber={issue.number}
            topicsTitles={topicsTitles}
            allIssues={allIssues}
          />
        </div>
      </Container>

      <SubmitForm ref={submitFormRef} />
    </>
  )
}
