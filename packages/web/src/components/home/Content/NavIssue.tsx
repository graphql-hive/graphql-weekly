import { ArrowLeft } from "../../vectors/ArrowLeft";
import { ArrowRight } from "../../vectors/ArrowRight";

export const NavIssue = ({
  firstIssueNumber,
  lastIssueNumber,
  nextNumber,
  prevNumber,
}: {
  firstIssueNumber?: number;
  lastIssueNumber?: number;
  nextNumber: number;
  prevNumber: number;
}) => (
  <div className="w-full flex justify-between px-10.25 pt-8 pb-15.5">
    {prevNumber && firstIssueNumber !== prevNumber + 1 && (
      <a
        className="inline-flex items-center no-underline font-medium leading-none text-lg text-footer-dark h-6 p-2 -mx-2 focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2 rounded-sm"
        href={`/issues/${prevNumber}/#content`}
      >
        <ArrowLeft />
        <span className="mx-2.5">View issue {prevNumber}</span>
      </a>
    )}

    <div className="grow mx-auto shrink-0" />

    {nextNumber && lastIssueNumber !== nextNumber - 1 && (
      <a
        className="inline-flex items-center no-underline font-medium leading-none text-lg text-footer-dark h-6 p-2 -mx-2 focus-visible:outline-2 focus-visible:outline-purple focus-visible:outline-offset-2 rounded-sm"
        href={`/issues/${nextNumber}/#content`}
      >
        <span className="mx-2.5">View issue {nextNumber}</span>
        <ArrowRight />
      </a>
    )}
  </div>
);
