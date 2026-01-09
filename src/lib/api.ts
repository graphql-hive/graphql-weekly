import type { IssueType, TopicLinksType } from '../types'

const GRAPHQL_ENDPOINT = 'https://graphql-weekly.graphcdn.app'

export async function fetchGraphQL<T>({
  query,
}: {
  query: string
}): Promise<{ data: T }> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return response.json()
}

interface AllIssuesResponse {
  allIssues: IssueType[]
}

export interface AllIssuesData {
  lastIssue: IssueType
  firstIssueNumber: number
  allIssues: IssueType[]
  topicsList: Record<string, TopicLinksType[]>
}

export async function getAllIssues(): Promise<AllIssuesData> {
  const query = `{
    allIssues {
      id
      title
      published
      number
      date
      author {
        avatarUrl
        description
        name
      }
      topics {
        title
        links {
          url
          text
          position
          title
        }
      }
    }
  }`

  const { data } = await fetchGraphQL<AllIssuesResponse>({ query })

  const allIssues = data.allIssues
    .filter((issue) => issue.published && issue.date && issue.number)
    .sort((a, b) => Number(b.number) - Number(a.number))

  const lastIssue = allIssues[0]
  const firstIssueNumber = allIssues[allIssues.length - 1].number

  // get all topics with links: { [title]: [ { ...link } ] }
  let topicsList: Record<string, TopicLinksType[]> = {}
  allIssues.forEach((issue) => {
    issue.topics.forEach((topic) => {
      if (!topicsList[topic.title]) {
        topicsList[topic.title] = []
      }
      topicsList[topic.title].push({
        issueNumber: issue.number,
        issueDate: issue.date,
        links: topic.links,
      })
    })
  })

  topicsList = unifySimilarTopics(topicsList)

  return {
    lastIssue,
    firstIssueNumber,
    allIssues,
    topicsList,
  }
}

function unifySimilarTopics(
  topicsList: Record<string, TopicLinksType[]>,
): Record<string, TopicLinksType[]> {
  const Articles = 'Articles'
  const Tutorials = 'Tutorials'
  const Videos = 'Videos'
  const Community_and_Events = 'Community & Events'
  const Tools_and_Open_Source = 'Tools & Open Source'

  const conversionMap: Record<string, string> = {
    'Articles and Posts': Articles,
    Article: Articles,
    'Articles & Videos': Articles,
    'Tutorials & Articles': Articles,
    'Articles & Announcements': Articles,

    Talks: Videos,
    Video: Videos,
    Courses: Videos,
    Course: Videos,
    Media: Videos,
    'Videos & Talks': Videos,

    Podcasts: Community_and_Events,
    Podcast: Community_and_Events,
    Conference: Community_and_Events,
    'GraphQL Foundation': Community_and_Events,
    Community: Community_and_Events,
    'Community & News': Community_and_Events,
    'Resources & Community': Community_and_Events,

    'Educational Content': Tutorials,
    Tutorial: Tutorials,
    'Articles & Tutorials': Tutorials,

    'Open Source': Tools_and_Open_Source,
    Apollo: Tools_and_Open_Source,
    'Open Source & Tools': Tools_and_Open_Source,
    'Community & Open Source': Tools_and_Open_Source,
    'Tools & Open-Source': Tools_and_Open_Source,
    Tools: Tools_and_Open_Source,
    'Open Tools & Source': Tools_and_Open_Source,
  }

  const unifiedTopics = { ...topicsList }

  Object.keys(topicsList).forEach((currentTitle) => {
    if (!conversionMap[currentTitle]) {
      return
    }

    const similarTitle = conversionMap[currentTitle]
    if (!unifiedTopics[similarTitle]) {
      unifiedTopics[similarTitle] = []
    }
    unifiedTopics[similarTitle].push(...topicsList[currentTitle])

    if (currentTitle !== similarTitle) {
      delete unifiedTopics[currentTitle]
    }
  })

  return unifiedTopics
}

export function getTopicUrlFriendly(topicTitle: string): string {
  return topicTitle
    .split(' ')
    .join('-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
}

export function getTopicFromSlug(
  slug: string,
  topicsList: Record<string, TopicLinksType[]>,
): { title: string; links: TopicLinksType[] } | null {
  for (const [title, links] of Object.entries(topicsList)) {
    if (getTopicUrlFriendly(title) === slug) {
      return { title, links }
    }
  }
  return null
}
