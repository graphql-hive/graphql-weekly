import { useRef } from "react";

import type { IssueType } from "../types";

import { Issue } from "./home/Content/Issue";
import { Sidebar } from "./home/Content/Sidebar";
import { Header } from "./home/Header";
import { Container } from "./shared/Container";
import { SubmitForm, type SubmitFormHandle } from "./shared/SubmitForm";

interface Props {
  allIssues: IssueType[];
  firstIssueNumber: number;
  issue: IssueType;
  pathname: string;
  topicsTitles: string[];
}

export function IssuePage({
  allIssues,
  firstIssueNumber,
  issue,
  pathname,
  topicsTitles,
}: Props) {
  const submitFormRef = useRef<SubmitFormHandle>(null);
  const openModal = () => submitFormRef.current?.showModal();

  return (
    <>
      <Header submitModalClickHandler={openModal} />

      <Container>
        <div className="flex">
          <Issue
            firstIssueNumber={firstIssueNumber}
            issue={issue}
            lastIssueNumber={allIssues[0].number}
          />
          <Sidebar
            allIssues={allIssues}
            currentIssueNumber={issue.number}
            pathname={pathname}
            submitModalClickHandler={openModal}
            topicsTitles={topicsTitles}
          />
        </div>
      </Container>

      <SubmitForm ref={submitFormRef} />
    </>
  );
}
