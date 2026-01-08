import { type IssueType } from '../../../types'
import { TopicArticle } from '../../shared/Topics/TopicArticle'
import { TopicBox } from '../../shared/Topics/TopicBox'
import { getTopicColor } from '../topicColors'
import { NavIssue } from './NavIssue'
import { ContentWrapper } from './style'

type Props = {
  firstIssueNumber: number
  issue: IssueType
  lastIssueNumber: number
}

export const Issue = ({ firstIssueNumber, issue, lastIssueNumber }: Props) => {
  const date = new Date(issue.date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const blueIssueTagProps = {
    issueDate: `• ${date}`,
    issueNumber: issue.number,
  }

  // Don't show the header card if no author or description is provided
  const hasIssueHeaderCard = issue.description || issue.author

  return (
    <ContentWrapper>
      {hasIssueHeaderCard && (
        <TopicBox
          {...blueIssueTagProps}
          articles={[
            <TopicArticle
              specialPerk={issue.specialPerk}
              text={issue.description || ''}
              title={issue.title}
              url={`/issues/${issue.number}`}
            />,
          ]}
          author={
            issue.author && {
              avatar: issue.author.avatarUrl,
              bio: issue.author.description,
              name: issue.author.name,
            }
          }
          isIssueCard={true}
        />
      )}

      {issue.topics.map((topic, i) => {
        return (
          <TopicBox
            articles={topic.links
              .sort((a, b) => b.position - a.position)
              .map((link) => (
                <TopicArticle
                  text={link.text}
                  title={link.title}
                  topicColor={getTopicColor(topic.title)}
                  url={link.url}
                />
              ))}
            key={topic.title}
            topicColor={getTopicColor(topic.title)}
            topicTitle={topic.title}
            // Show the blue tag on the first topic card if no header card is there
            {...(i === 0 && !hasIssueHeaderCard ? blueIssueTagProps : {})}
          />
        )
      })}

      <NavIssue
        firstIssueNumber={firstIssueNumber}
        lastIssueNumber={lastIssueNumber}
        nextNumber={issue.number + 1}
        prevNumber={issue.number - 1}
      />
    </ContentWrapper>
  )
}
