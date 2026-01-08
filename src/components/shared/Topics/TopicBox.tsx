import type React from 'react'

import { cn } from '../../../lib/cn'
import { HLine } from '../Input/HLine'
import { Link } from '../Link'

interface TopicBoxProps {
  articles: React.ReactNode[]
  author?: {
    avatar: string
    bio: string
    name: string
  }
  isIssueCard?: boolean
  issueDate?: string
  issueNumber?: number
  topicColor?: string
  topicTitle?: string
}

export function TopicBox({
  articles,
  author,
  isIssueCard,
  issueDate,
  issueNumber,
  topicColor,
  topicTitle,
}: TopicBoxProps) {
  return (
    <>
      {issueNumber && (
        <div className="text-center">
          <Link
            className="inline-flex relative h-8 mx-auto px-[17px] bg-[#6560e2] shadow-[0px_4px_10px_rgba(23,43,58,0.25)] rounded-[32px] font-medium leading-8 text-base text-center uppercase text-white"
            to={`/issues/${issueNumber}/#content`}
          >
            Issue {issueNumber}
            {issueDate && (
              <span className="opacity-66 ml-1 before:content-[' ']">
                {issueDate}
              </span>
            )}
          </Link>
        </div>
      )}

      <div
        className={cn(
          'min-h-[100px] mb-4 shadow-[0px_4px_16px_rgba(8,17,70,0.05)] rounded-lg p-6 md:p-16',
          isIssueCard ? 'bg-[#f6f6f7]' : 'bg-white',
          issueNumber && 'mt-[-15px]',
          topicColor && 'pl-5 md:pl-14 border-l-8 [&_p_a]:underline',
        )}
        style={topicColor ? { borderLeftColor: topicColor } : undefined}
      >
        {topicTitle && (
          <h2
            className="mb-6 md:mb-8 font-medium leading-none text-lg uppercase"
            style={{
              color: topicColor,
              marginTop: issueNumber ? '16px' : '0',
            }}
          >
            {topicTitle}
          </h2>
        )}
        <div>
          {articles.map((article, i) => (
            <div key={i}>
              {article}
              {i < articles.length - 1 && <HLine />}
            </div>
          ))}
        </div>
        {author && (
          <div className="w-full flex mt-8">
            <div
              className="w-10 h-10 rounded-full bg-cover flex-shrink-0"
              style={{ backgroundImage: `url(${author.avatar})` }}
            />
            <div className="flex-grow ml-4">
              <h3 className="m-0 font-normal font-medium leading-none text-base text-[#081146]">
                {author.name}
              </h3>
              <h2 className="mt-2 mb-0 font-normal leading-none text-base text-[#4d5379]">
                {author.bio}
              </h2>
            </div>
          </div>
        )}
      </div>
      {topicColor && (
        <style>{`
          [style*="border-left-color: ${topicColor}"] p a {
            color: ${topicColor};
          }
        `}</style>
      )}
    </>
  )
}
