import { expect, test } from "@playwright/test";

import { API_URL, CMS_URL } from "../urls.ts";

test.describe("Link Position Ordering", () => {
  test.use({ storageState: "src/.auth/user.json" });

  /**
   * Tests that updateLink with position persists and that the issue query
   * returns links in position order. This covers the fix where email draft
   * and CMS would show different link orders because positions weren't saved.
   */
  test("link positions persist and determine order in issue query", async ({
    playwright,
  }) => {
    const request = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Origin: CMS_URL },
      storageState: "src/.auth/user.json",
    });

    const timestamp = Date.now();

    // 1. Create a test issue
    const createIssueRes = await request.post(`${API_URL}/graphql`, {
      data: {
        query: `mutation($title: String!, $number: Int!, $date: DateTime!, $published: Boolean!) {
          createIssue(title: $title, number: $number, date: $date, published: $published) { id }
        }`,
        variables: {
          date: new Date().toISOString(),
          number: 80_000 + Math.floor(Math.random() * 10_000),
          published: false,
          title: `Position Test ${timestamp}`,
        },
      },
    });
    const issueData = (await createIssueRes.json()) as {
      data: { createIssue: { id: string } };
    };
    const issueId = issueData.data.createIssue.id;
    expect(issueId).toBeTruthy();

    // 2. Create a topic
    const createTopicRes = await request.post(`${API_URL}/graphql`, {
      data: {
        query: `mutation($title: String!, $issue_comment: String!, $issueId: String!) {
          createTopic(title: $title, issue_comment: $issue_comment, issueId: $issueId) { id }
        }`,
        variables: {
          issue_comment: "",
          issueId,
          title: `Topic ${timestamp}`,
        },
      },
    });
    const topicData = (await createTopicRes.json()) as {
      data: { createTopic: { id: string } };
    };
    const topicId = topicData.data.createTopic.id;
    expect(topicId).toBeTruthy();

    // 3. Create three links and assign them to the topic
    const linkTitles = ["Link Alpha", "Link Beta", "Link Gamma"];
    const linkIds: string[] = [];

    for (const title of linkTitles) {
      const createLinkRes = await request.post(`${API_URL}/graphql`, {
        data: {
          query: `mutation($url: String!) { createLink(url: $url) { id } }`,
          variables: { url: `https://example.com/${title.toLowerCase().replace(" ", "-")}-${timestamp}` },
        },
      });
      const linkData = (await createLinkRes.json()) as {
        data: { createLink: { id: string } };
      };
      const linkId = linkData.data.createLink.id;
      expect(linkId).toBeTruthy();
      linkIds.push(linkId);

      // Update title
      await request.post(`${API_URL}/graphql`, {
        data: {
          query: `mutation($id: String!, $title: String!) {
            updateLink(id: $id, title: $title) { id }
          }`,
          variables: { id: linkId, title },
        },
      });

      // Assign to topic
      await request.post(`${API_URL}/graphql`, {
        data: {
          query: `mutation($topicId: String!, $linkId: String!) {
            addLinksToTopic(topicId: $topicId, linkId: $linkId) { id }
          }`,
          variables: { linkId, topicId },
        },
      });
    }

    // 4. Set positions in REVERSE order: Gamma=0, Beta=1, Alpha=2
    const desiredOrder = [
      { id: linkIds[2], position: 0 }, // Gamma first
      { id: linkIds[1], position: 1 }, // Beta second
      { id: linkIds[0], position: 2 }, // Alpha last
    ];

    for (const { id, position } of desiredOrder) {
      const updateRes = await request.post(`${API_URL}/graphql`, {
        data: {
          query: `mutation($id: String!, $title: String!, $position: Int) {
            updateLink(id: $id, title: $title, position: $position) { id position }
          }`,
          variables: { id, position, title: linkTitles[linkIds.indexOf(id)!] },
        },
      });
      const updateData = (await updateRes.json()) as {
        data: { updateLink: { id: string; position: number } };
      };
      expect(updateData.data.updateLink.position).toBe(position);
    }

    // 5. Query the issue and verify link order matches positions
    const issueQueryRes = await request.post(`${API_URL}/graphql`, {
      data: {
        query: `query($id: String!) {
          issue(by: { id: $id }) {
            topics {
              links { id title position }
            }
          }
        }`,
        variables: { id: issueId },
      },
    });
    const issueQueryData = (await issueQueryRes.json()) as {
      data: {
        issue: {
          topics: { links: { id: string; position: number; title: string }[] }[];
        };
      };
    };

    const {links} = (issueQueryData.data.issue.topics[0]!);
    expect(links).toHaveLength(3);
    expect(links[0]!.title).toBe("Link Gamma");
    expect(links[1]!.title).toBe("Link Beta");
    expect(links[2]!.title).toBe("Link Alpha");

    // Verify positions are correct
    expect(links[0]!.position).toBe(0);
    expect(links[1]!.position).toBe(1);
    expect(links[2]!.position).toBe(2);

  });
});
