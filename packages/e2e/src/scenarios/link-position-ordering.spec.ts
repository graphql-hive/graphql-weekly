import { type APIRequestContext, expect, test } from "@playwright/test";

import { API_URL, CMS_URL } from "../urls.ts";

/** Helper to post a GraphQL request and return parsed data */
async function gql<T>(
  request: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await request.post(`${API_URL}/graphql`, {
    data: { query, variables },
  });
  const json = (await res.json()) as {
    data: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  return json.data;
}

test.describe("Link Position Ordering", () => {
  test.use({ storageState: "src/.auth/user.json" });

  let issueId: string;
  let linkIds: string[];
  let topicId: string;
  let requestContext: APIRequestContext;
  const timestamp = Date.now();

  test.beforeAll(async ({ playwright }) => {
    requestContext = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Origin: CMS_URL },
      storageState: "src/.auth/user.json",
    });

    // Create test issue
    const { createIssue } = await gql<{ createIssue: { id: string } }>(
      requestContext,
      `mutation($title: String!, $number: Int!, $date: DateTime!, $published: Boolean!) {
        createIssue(title: $title, number: $number, date: $date, published: $published) { id }
      }`,
      {
        date: new Date().toISOString(),
        number: 80_000 + Math.floor(Math.random() * 10_000),
        published: false,
        title: `Position Test ${timestamp}`,
      },
    );
    issueId = createIssue.id;

    // Create topic
    const { createTopic } = await gql<{ createTopic: { id: string } }>(
      requestContext,
      `mutation($title: String!, $issue_comment: String!, $issueId: String!) {
        createTopic(title: $title, issue_comment: $issue_comment, issueId: $issueId) { id }
      }`,
      { issue_comment: "", issueId, title: `Topic ${timestamp}` },
    );
    topicId = createTopic.id;

    // Create three links, set titles, assign to topic
    const linkTitles = ["Link Alpha", "Link Beta", "Link Gamma"];
    linkIds = [];

    for (const title of linkTitles) {
      const { createLink } = await gql<{ createLink: { id: string } }>(
        requestContext,
        `mutation($url: String!) { createLink(url: $url) { id } }`,
        {
          url: `https://example.com/${title.toLowerCase().replace(" ", "-")}-${timestamp}`,
        },
      );
      linkIds.push(createLink.id);

      await gql(
        requestContext,
        `mutation($id: String!, $title: String!) { updateLink(id: $id, title: $title) { id } }`,
        { id: createLink.id, title },
      );

      await gql(
        requestContext,
        `mutation($topicId: String!, $linkId: String!) { addLinksToTopic(topicId: $topicId, linkId: $linkId) { id } }`,
        { linkId: createLink.id, topicId },
      );
    }
  });

  test.afterAll(async () => {
    if (!requestContext || !issueId) return;
    if (linkIds) {
      for (const id of linkIds) {
        await gql(
          requestContext,
          `mutation($id: String!) { deleteLink(id: $id) { id } }`,
          { id },
        ).catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function -- cleanup
      }
    }
    await gql(
      requestContext,
      `mutation($id: String!) { deleteIssue(id: $id) { id } }`,
      { id: issueId },
    ).catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function -- cleanup
  });

  test("updateIssue with updateLinks persists positions", async () => {
    // Set positions in reverse: Gamma=0, Beta=1, Alpha=2
    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [
          { id: linkIds[2], position: 0 },
          { id: linkIds[1], position: 1 },
          { id: linkIds[0], position: 2 },
        ],
      },
    );

    // Query and verify order
    const { issue } = await gql<{
      issue: {
        topics: { links: { id: string; position: number; title: string }[] }[];
      };
    }>(
      requestContext,
      `query($id: String!) {
        issue(by: { id: $id }) { topics { links { id title position } } }
      }`,
      { id: issueId },
    );

    const { links } = issue.topics[0]!;
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.title)).toEqual([
      "Link Gamma",
      "Link Beta",
      "Link Alpha",
    ]);
    expect(links.map((l) => l.position)).toEqual([0, 1, 2]);
  });

  test("updateIssue with updateLinks updates content and position together", async () => {
    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [
          { id: linkIds[2], position: 0, title: "Gamma Updated" },
          { id: linkIds[1], position: 1, text: "Beta description" },
        ],
      },
    );

    const { issue } = await gql<{
      issue: {
        topics: {
          links: {
            id: string;
            position: number;
            text: string | null;
            title: string;
          }[];
        }[];
      };
    }>(
      requestContext,
      `query($id: String!) {
        issue(by: { id: $id }) { topics { links { id title text position } } }
      }`,
      { id: issueId },
    );

    const { links } = issue.topics[0]!;
    const gamma = links.find((l) => l.id === linkIds[2])!;
    const beta = links.find((l) => l.id === linkIds[1])!;
    expect(gamma.title).toBe("Gamma Updated");
    expect(gamma.position).toBe(0);
    expect(beta.text).toBe("Beta description");
    expect(beta.position).toBe(1);
  });

  test("updateIssue with deleteLinks removes links", async () => {
    // Create an extra link to delete
    const { createLink } = await gql<{ createLink: { id: string } }>(
      requestContext,
      `mutation($url: String!) { createLink(url: $url) { id } }`,
      { url: `https://example.com/to-delete-${timestamp}` },
    );
    const deleteLinkId = createLink.id;

    await gql(
      requestContext,
      `mutation($topicId: String!, $linkId: String!) { addLinksToTopic(topicId: $topicId, linkId: $linkId) { id } }`,
      { linkId: deleteLinkId, topicId },
    );

    // Delete via updateIssue
    await gql(
      requestContext,
      `mutation($id: String!, $deleteLinks: [String!]) {
        updateIssue(id: $id, deleteLinks: $deleteLinks) { id }
      }`,
      { deleteLinks: [deleteLinkId], id: issueId },
    );

    // Verify deleted
    const { issue } = await gql<{
      issue: { topics: { links: { id: string }[] }[] };
    }>(
      requestContext,
      `query($id: String!) {
        issue(by: { id: $id }) { topics { links { id } } }
      }`,
      { id: issueId },
    );

    const allLinkIds = issue.topics[0]!.links.map((l) => l.id);
    expect(allLinkIds).not.toContain(deleteLinkId);
  });

  test("updateIssue with updateLinks moves link between topics via topicId", async () => {
    // Create a second topic
    const { createTopic: topic2 } = await gql<{
      createTopic: { id: string };
    }>(
      requestContext,
      `mutation($title: String!, $issue_comment: String!, $issueId: String!) {
        createTopic(title: $title, issue_comment: $issue_comment, issueId: $issueId) { id }
      }`,
      { issue_comment: "", issueId, title: `Topic 2 ${timestamp}` },
    );

    // Move Beta to topic2 via updateIssue
    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [{ id: linkIds[1], topicId: topic2.id }],
      },
    );

    // Verify Beta is now in topic2
    const { issue } = await gql<{
      issue: {
        topics: { id: string; links: { id: string; title: string }[] }[];
      };
    }>(
      requestContext,
      `query($id: String!) {
        issue(by: { id: $id }) { topics { id links { id title } } }
      }`,
      { id: issueId },
    );

    const topic2Data = issue.topics.find((t) => t.id === topic2.id);
    expect(topic2Data?.links.some((l) => l.id === linkIds[1])).toBe(true);

    // Move it back for other tests
    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [{ id: linkIds[1], topicId }],
      },
    );
  });

  test("updateIssue with updateLinks unassigns link via topicId: null", async () => {
    const { unassignedLinks: before } = await gql<{
      unassignedLinks: { id: string }[];
    }>(requestContext, `query { unassignedLinks { id } }`);

    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [{ id: linkIds[1], topicId: null }],
      },
    );

    const { unassignedLinks: after } = await gql<{
      unassignedLinks: { id: string }[];
    }>(requestContext, `query { unassignedLinks { id } }`);

    expect(after.some((l) => l.id === linkIds[1])).toBe(true);
    expect(after.length).toBe(before.length + 1);

    await gql(
      requestContext,
      `mutation($id: String!, $updateLinks: [UpdateLinkInput!]) {
        updateIssue(id: $id, updateLinks: $updateLinks) { id }
      }`,
      {
        id: issueId,
        updateLinks: [{ id: linkIds[1], topicId }],
      },
    );
  });
});
