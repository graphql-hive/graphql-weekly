import type { IssueType, TopicLinksType } from "../types";

const GRAPHQL_ENDPOINT = import.meta.env.DEV
  ? "http://localhost:2012"
  : "https://graphql-weekly.graphcdn.app";

export async function fetchGraphQL<T>({
  query,
}: {
  query: string;
}): Promise<{ data: T }> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  return response.json();
}

interface AllIssuesResponse {
  allIssues: IssueType[];
}

export interface AllIssuesData {
  allIssues: IssueType[];
  firstIssueNumber: number;
  lastIssue: IssueType;
  topicsList: Record<string, TopicLinksType[]>;
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
  }`;

  const { data } = await fetchGraphQL<AllIssuesResponse>({ query });

  const allIssues = data.allIssues
    .filter((issue) => issue.published && issue.date && issue.number)
    .sort((a, b) => Number(b.number) - Number(a.number));

  const lastIssue = allIssues[0];
  const firstIssueNumber = allIssues.at(-1)!.number;

  // get all topics with links: { [title]: [ { ...link } ] }
  let topicsList: Record<string, TopicLinksType[]> = {};
  for (const issue of allIssues) {
    for (const topic of issue.topics) {
      if (!topic.title || topic.title.trim() === "") {
        continue;
      }

      topicsList[topic.title] ||= [];
      topicsList[topic.title].push({
        issueDate: issue.date,
        issueNumber: issue.number,
        links: topic.links,
      });
    }
  }

  topicsList = unifySimilarTopics(topicsList);
  topicsList = sortTopicsByArticleCount(topicsList);

  return {
    allIssues,
    firstIssueNumber,
    lastIssue,
    topicsList,
  };
}

function normalizeTopicTitle(title: string): string {
  return title.toLowerCase().replaceAll(" and ", " & ");
}

function unifySimilarTopics(
  topicsList: Record<string, TopicLinksType[]>,
): Record<string, TopicLinksType[]> {
  const Articles = "Articles";
  const Tutorials = "Tutorials";
  const Videos = "Videos";
  const Community_and_Events = "Community & Events";
  const Tools_and_Open_Source = "Tools & Open Source";

  const conversionMap: Record<string, string> = {
    Apollo: Tools_and_Open_Source,
    Article: Articles,
    "Articles & Announcements": Articles,
    "Articles & Tutorials": Tutorials,
    "Articles & Videos": Articles,

    "Articles and Posts": Articles,
    Community: Community_and_Events,
    "Community & News": Community_and_Events,
    "Community & Open Source": Tools_and_Open_Source,
    Conference: Community_and_Events,
    Course: Videos,

    Courses: Videos,
    "Educational Content": Tutorials,
    "GraphQL Foundation": Community_and_Events,
    Media: Videos,
    "Open Source": Tools_and_Open_Source,
    "Open Source & Tools": Tools_and_Open_Source,
    "Open Tools & Source": Tools_and_Open_Source,

    Podcast: Community_and_Events,
    Podcasts: Community_and_Events,
    "Resources & Community": Community_and_Events,

    Talks: Videos,
    Tools: Tools_and_Open_Source,
    "Tools & Open-Source": Tools_and_Open_Source,
    "Tools and Open Source": Tools_and_Open_Source,
    Tutorial: Tutorials,
    "Tutorials & Articles": Articles,
    Video: Videos,
    "Videos & Talks": Videos,
  };

  const normalizedToCanonical = new Map<string, string>();
  const canonicalTopics: Record<string, TopicLinksType[]> = {};

  for (const [title, links] of Object.entries(topicsList)) {
    const mappedTitle = conversionMap[title] || title;
    const normalized = normalizeTopicTitle(mappedTitle);

    if (!normalizedToCanonical.has(normalized)) {
      normalizedToCanonical.set(normalized, mappedTitle);
      canonicalTopics[mappedTitle] = [];
    }

    const canonical = normalizedToCanonical.get(normalized)!;
    canonicalTopics[canonical].push(...links);
  }

  return canonicalTopics;
}

function sortTopicsByArticleCount(
  topicsList: Record<string, TopicLinksType[]>,
): Record<string, TopicLinksType[]> {
  return Object.fromEntries(
    Object.entries(topicsList)
      .filter(([, links]) => links.length > 0)
      .sort((a, b) => b[1].length - a[1].length),
  );
}

export function getTopicUrlFriendly(topicTitle: string): string {
  return topicTitle
    .split(" ")
    .join("-")
    .replaceAll(/[^a-zA-Z0-9-_]/g, "");
}

export function getTopicFromSlug(
  slug: string,
  topicsList: Record<string, TopicLinksType[]>,
): { links: TopicLinksType[]; title: string } | null {
  for (const [title, links] of Object.entries(topicsList)) {
    if (getTopicUrlFriendly(title) === slug) {
      return { links, title };
    }
  }
  return null;
}
