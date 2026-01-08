const fetchGraphQL = async ({ query }) => {
  return fetch('https://graphql-weekly.graphcdn.app', {
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }).then(res => res.json())
}

const getAllIssues = async () => {
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
          url
        }
      }
    }
  }`

  let firstIssueNumber = 0
  let lastIssue = null

  try {
    const { data } = await fetchGraphQL({ query })

    const allIssues = data.allIssues
      .filter(issue => issue.published && issue.date && issue.number)
      .sort((a, b) => Number(b.number) - Number(a.number))

    lastIssue = allIssues[0]
    firstIssueNumber = allIssues.at(-1).number

    // get all topics with links
    // {  [title]: [ { ...link } ] }
    let topicsList = {}
    for (const issue of allIssues) {
      for (const topic of issue.topics) {
        if (!topicsList[topic.title]) {
          topicsList[topic.title] = []
        }

        // Add it
        topicsList[topic.title].push({
          issueDate: issue.date,
          issueNumber: issue.number,
          links: topic.links,
        })
      }
    }

    // Tidy it up, it was a mess
    topicsList = unifySimilarTopics(topicsList)

    return {
      allIssues,
      firstIssueNumber,
      lastIssue,
      topicsList,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

// --------
// Helpers
// --------
function unifySimilarTopics(topicsList) {
  const Articles = 'Articles',
    Community_and_Events = 'Community & Events',
    Tools_and_Open_Source = 'Tools & Open Source',
    Tutorials = 'Tutorials',
    Videos = 'Videos'

  // prettier-ignore
  const conversionMap = {
    'Apollo': Tools_and_Open_Source,
    'Article': Articles,
    'Articles & Announcements': Articles,
    'Articles & Tutorials': Tutorials,
    'Articles & Videos': Articles,
    
    'Articles and Posts': Articles,
    'Community': Community_and_Events,
    'Community & News': Community_and_Events,
    'Community & Open Source': Tools_and_Open_Source,
    'Conference': Community_and_Events,
    'Course': Videos,
    
    'Courses': Videos,
    'Educational Content': Tutorials,
    'GraphQL Foundation': Community_and_Events,
    'Media': Videos,
    'Open Source':Tools_and_Open_Source,
    'Open Source & Tools': Tools_and_Open_Source,
    'Open Tools & Source':  Tools_and_Open_Source,
    
    'Podcast': Community_and_Events,
    'Podcasts':Community_and_Events,
    'Resources & Community': Community_and_Events,
    
    'Talks': Videos,
    'Tools': Tools_and_Open_Source,
    'Tools & Open-Source': Tools_and_Open_Source,
    'Tutorial': Tutorials,
    'Tutorials & Articles': Articles,
    'Video': Videos,
    'Videos & Talks': Videos,
  }

  const unifiedTopics = { ...topicsList }

  for (const currentTitle of Object.keys(topicsList)) {
    if (!conversionMap[currentTitle]) {
      continue
    }

    const similarTitle = conversionMap[currentTitle]
    unifiedTopics[similarTitle].push(...topicsList[currentTitle])

    if (currentTitle !== similarTitle) {
      delete unifiedTopics[currentTitle]
    }
  }

  return unifiedTopics
}

function getTopicUrlFriendly(topicTitle) {
  return topicTitle
    .split(' ')
    .join('-')
    .replaceAll(/[^a-zA-Z0-9-_]/g, '')
}

module.exports = { fetchGraphQL, getAllIssues, getTopicUrlFriendly }
