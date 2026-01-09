import { useRef } from 'react'
import { Header } from './home/Header'
import { Container } from './shared/Container'
import { Topic } from './home/Content/Topic'
import { Sidebar } from './home/Content/Sidebar'
import { SubmitForm, type SubmitFormHandle } from './shared/SubmitForm'
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
  const submitFormRef = useRef<SubmitFormHandle>(null)
  const openModal = () => submitFormRef.current?.showModal()

  return (
    <>
      <Header submitModalClickHandler={openModal} />

      <Container>
        <div className="flex">
          <Topic title={topicTitle} topicLinks={topicLinks} />
          <Sidebar
            submitModalClickHandler={openModal}
            topicsTitles={topicsTitles}
            allIssues={allIssues}
          />
        </div>
      </Container>

      <SubmitForm ref={submitFormRef} />
    </>
  )
}
