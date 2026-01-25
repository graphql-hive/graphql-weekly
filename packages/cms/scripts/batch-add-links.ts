#!/usr/bin/env bun
/* eslint-disable no-console */

import { gql, GraphQLClient } from "graphql-request";
import { readFileSync } from "node:fs";

const endpoint =
  process.env.API_URL || "https://api.graphqlweekly.com/graphql";
const cookie = process.env.SESSION_COOKIE;

if (!cookie) {
  console.error(
    "SESSION_COOKIE not set. Get it from browser DevTools (Application > Cookies > better-auth.session_token)",
  );
  process.exit(1);
}

const decodedCookie = decodeURIComponent(cookie);
// Production uses __Secure- prefix, local dev doesn't
const cookieName = endpoint.includes("localhost")
  ? "better-auth.session_token"
  : "__Secure-better-auth.session_token";
const client = new GraphQLClient(endpoint, {
  headers: { Cookie: `${cookieName}=${decodedCookie}` },
});

interface Issue {
  id: string;
  number: number;
  title: string;
  topics?: { id: string; title: string }[];
}

interface Link {
  description: string;
  tag: string;
  title: string;
  url: string;
}

const ALL_ISSUES = gql`
  query AllIssues {
    allIssues {
      id
      number
      title
    }
  }
`;

const ISSUE_WITH_TOPICS = gql`
  query Issue($id: String!) {
    issue(id: $id) {
      id
      title
      topics {
        id
        title
      }
    }
  }
`;

const CREATE_LINK = gql`
  mutation CreateLink($url: String!) {
    createLink(url: $url) {
      id
    }
  }
`;

const UPDATE_LINK = gql`
  mutation UpdateLink(
    $id: String!
    $title: String!
    $text: String!
    $url: String!
  ) {
    updateLink(id: $id, title: $title, text: $text, url: $url) {
      id
    }
  }
`;

const CREATE_TOPIC = gql`
  mutation CreateTopic(
    $issueId: String!
    $title: String!
    $issue_comment: String!
  ) {
    createTopic(
      issueId: $issueId
      title: $title
      issue_comment: $issue_comment
    ) {
      id
    }
  }
`;

const ADD_LINK_TO_TOPIC = gql`
  mutation AddLinksToTopic($topicId: String!, $linkId: String!) {
    addLinksToTopic(topicId: $topicId, linkId: $linkId) {
      id
    }
  }
`;

function parseTSV(filePath: string): Link[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.trim().split("\n");
  const [_header, ...rows] = lines;

  return rows.map((row) => {
    const [url, title, description, tag] = row.split("\t");
    if (!url || !title || !description || !tag) {
      throw new Error(`Invalid row: ${row}`);
    }
    return { description, tag, title, url };
  });
}

async function findIssueByNumber(issueNumber: number): Promise<Issue | null> {
  const data = await client.request<{ allIssues: Issue[] }>(ALL_ISSUES);
  return data.allIssues.find((issue) => issue.number === issueNumber) ?? null;
}

async function getIssueWithTopics(issueId: string): Promise<Issue | null> {
  const data = await client.request<{ issue: Issue }>(ISSUE_WITH_TOPICS, {
    id: issueId,
  });
  return data.issue;
}

async function createLink(url: string): Promise<string> {
  const data = await client.request<{ createLink: { id: string } }>(
    CREATE_LINK,
    { url },
  );
  return data.createLink.id;
}

async function updateLink(
  id: string,
  title: string,
  text: string,
  url: string,
): Promise<void> {
  await client.request(UPDATE_LINK, { id, text, title, url });
}

async function createTopic(issueId: string, title: string): Promise<string> {
  const data = await client.request<{ createTopic: { id: string } }>(
    CREATE_TOPIC,
    {
      issue_comment: "",
      issueId,
      title,
    },
  );
  return data.createTopic.id;
}

async function addLinkToTopic(topicId: string, linkId: string): Promise<void> {
  await client.request(ADD_LINK_TO_TOPIC, { linkId, topicId });
}

async function main() {
  const issueNumber = Number.parseInt(process.argv[2]!, 10);
  const tsvPath = process.argv[3]!;

  if (!issueNumber || Number.isNaN(issueNumber) || !tsvPath) {
    console.error("Usage: bun run batch-add-links <issue-number> <tsv-path>");
    console.error("Example: bun run batch-add-links 399 links-to-add.tsv");
    process.exit(1);
  }

  console.log(`Looking for issue #${issueNumber}...`);
  const issue = await findIssueByNumber(issueNumber);
  if (!issue) {
    console.error(`Issue #${issueNumber} not found`);
    process.exit(1);
  }
  console.log(`Found issue: ${issue.title} (${issue.id})`);

  const issueWithTopics = await getIssueWithTopics(issue.id);
  const existingTopics = new Map(
    issueWithTopics?.topics?.map((t) => [t.title.toLowerCase(), t.id]),
  );
  console.log(
    `Existing topics: ${[...existingTopics.keys()].join(", ") || "(none)"}`,
  );

  const links = parseTSV(tsvPath);
  console.log(`Found ${links.length} links to add`);

  for (const link of links) {
    console.log(`\nProcessing: ${link.title}`);

    // Create link
    const linkId = await createLink(link.url);
    console.log(`  Created link: ${linkId}`);

    // Update link with title and description
    await updateLink(linkId, link.title, link.description, link.url);
    console.log(`  Updated with title/description`);

    // Find or create topic
    let topicId = existingTopics.get(link.tag.toLowerCase());
    if (!topicId) {
      console.log(`  Creating topic: ${link.tag}`);
      topicId = await createTopic(issue.id, link.tag);
      existingTopics.set(link.tag.toLowerCase(), topicId);
    }

    // Add link to topic
    await addLinkToTopic(topicId, linkId);
    console.log(`  Added to topic: ${link.tag}`);
  }

  console.log("\nDone!");
}

await main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
