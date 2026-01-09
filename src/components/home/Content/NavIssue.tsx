import { ArrowLeft } from '../../vectors/ArrowLeft'
import { ArrowRight } from '../../vectors/ArrowRight'

export const NavIssue = ({
  firstIssueNumber,
  lastIssueNumber,
  nextNumber,
  prevNumber,
}: {
  firstIssueNumber?: number
  lastIssueNumber?: number
  nextNumber: number
  prevNumber: number
}) => (
  <div className="w-full flex justify-between px-[41px] pt-8 pb-[62px]">
    {prevNumber && firstIssueNumber !== prevNumber + 1 && (
      <a
        className="flex items-center no-underline font-medium leading-none text-lg text-[#081146]"
        href={`/issues/${prevNumber}/#content`}
      >
        <ArrowLeft />
        <span className="mx-2.5">View issue {prevNumber}</span>
      </a>
    )}

    <div className="flex-grow mx-auto shrink-0" />

    {nextNumber && lastIssueNumber !== nextNumber - 1 && (
      <a
        className="flex items-center no-underline font-medium leading-none text-lg text-[#081146]"
        href={`/issues/${nextNumber}/#content`}
      >
        <span className="mx-2.5">View issue {nextNumber}</span>
        <ArrowRight />
      </a>
    )}
  </div>
)
