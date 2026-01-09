import { useState } from 'react'
import { Header } from './home/Header'
import { Container } from './shared/Container'
import { Issue } from './home/Content/Issue'
import { Sidebar } from './home/Content/Sidebar'
import { SubmitForm } from './shared/SubmitForm'
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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const openModal = () => setIsSubmitModalOpen(true)
  const closeModal = () => setIsSubmitModalOpen(false)

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

      {isSubmitModalOpen && <SubmitForm onCancelClicked={closeModal} />}
    </>
  )
}
