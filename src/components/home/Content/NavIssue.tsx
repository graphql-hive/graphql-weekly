import * as React from 'react'
import ArrowLeft from '../../vectors/ArrowLeft'
import ArrowRight from '../../vectors/ArrowRight'
import { Space } from '../../shared/Space'

export const NavIssue = ({
  prevNumber,
  nextNumber,
  firstIssueNumber,
  lastIssueNumber,
}: {
  prevNumber: number
  nextNumber: number
  firstIssueNumber?: number
  lastIssueNumber?: number
}) => (
  <div className="w-full flex justify-between px-[41px] pt-8 pb-[62px]">
    {prevNumber && firstIssueNumber !== prevNumber + 1 && (
      <a
        href={`/issues/${prevNumber}/#content`}
        className="flex items-center no-underline font-medium leading-none text-lg text-[#081146]"
      >
        <ArrowLeft />
        <span className="mx-2.5">View issue {prevNumber}</span>
      </a>
    )}

    <Space fillRow />

    {nextNumber && lastIssueNumber !== nextNumber - 1 && (
      <a
        href={`/issues/${nextNumber}/#content`}
        className="flex items-center no-underline font-medium leading-none text-lg text-[#081146]"
      >
        <span className="mx-2.5">View issue {nextNumber}</span>
        <ArrowRight />
      </a>
    )}
  </div>
)
