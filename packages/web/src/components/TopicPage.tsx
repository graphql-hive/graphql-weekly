import { useRef } from "react";

import type { IssueType, TopicLinksType } from "../types";

import { Sidebar } from "./home/Content/Sidebar";
import { Topic } from "./home/Content/Topic";
import { Header } from "./home/Header";
import { Container } from "./shared/Container";
import { SubmitForm, type SubmitFormHandle } from "./shared/SubmitForm";

interface Props {
  allIssues: IssueType[];
  firstIssueNumber: number;
  pathname: string;
  topicLinks: TopicLinksType[];
  topicsTitles: string[];
  topicTitle: string;
}

export function TopicPage({
  allIssues,
  pathname,
  topicLinks,
  topicsTitles,
  topicTitle,
}: Props) {
  const submitFormRef = useRef<SubmitFormHandle>(null);
  const openModal = () => submitFormRef.current?.showModal();

  return (
    <>
      <Header submitModalClickHandler={openModal} />

      <Container>
        <main className="flex" id="main-content">
          <Topic title={topicTitle} topicLinks={topicLinks} />
          <Sidebar
            allIssues={allIssues}
            pathname={pathname}
            submitModalClickHandler={openModal}
            topicsTitles={topicsTitles}
          />
        </main>
      </Container>

      <SubmitForm ref={submitFormRef} />
    </>
  );
}
