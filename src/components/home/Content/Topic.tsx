import type { TopicLinksType } from '../../../types'

import { TopicArticle } from '../../shared/Topics/TopicArticle'
// Local
import { TopicBox } from '../../shared/Topics/TopicBox'
import { getTopicColor } from '../topicColors'
import { ContentWrapper } from './style'

type Props = {
  title: string
  topicLinks: TopicLinksType[]
}

export const Topic = ({ title, topicLinks }: Props) => {
  return (
    <ContentWrapper>
      {topicLinks.slice(0, 11).map((topicLinkObject, i) => {
        return (
          <TopicBox
            articles={topicLinkObject.links.map((link) => (
              <TopicArticle
                text={link.text}
                title={link.title}
                topicColor={getTopicColor(title)}
                url={link.url}
              />
            ))}
            issueDate={`• ${formatDate(topicLinkObject.issueDate)}`}
            issueNumber={topicLinkObject.issueNumber}
            key={topicLinkObject.issueNumber}
            topicColor={getTopicColor(title)}
            topicTitle={title}
          />
        )
      })}
    </ContentWrapper>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
