import { existsSync, readFileSync } from "node:fs";

const API_URL = "http://localhost:2012/graphql";
const AUTH_FILE = "e2e/.auth/user.json";

function getAuthCookies(): string {
  if (!existsSync(AUTH_FILE)) return "";
  try {
    const state = JSON.parse(readFileSync(AUTH_FILE, "utf-8"));
    return (state.cookies || [])
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return "";
  }
}

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const cookies = getAuthCookies();
  const res = await fetch(API_URL, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
      ...(cookies ? { Cookie: cookies } : {}),
    },
    method: "POST",
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

interface Link {
  id: string;
  url: string;
}

interface Issue {
  id: string;
  number: number;
  title: string;
}

export async function cleanupTestLinks(): Promise<number> {
  const { allLinks } = await gql<{ allLinks: Link[] }>(`
    query { allLinks { id url } }
  `);

  const testLinks = allLinks.filter(
    (l) =>
      l.url?.includes("example.com") ||
      l.url?.includes("graphql.org/learn") ||
      l.url?.includes("test-") ||
      l.url?.includes("-test-"),
  );

  for (const link of testLinks) {
    await gql(`mutation($id: String!) { deleteLink(id: $id) { id } }`, {
      id: link.id,
    });
  }

  return testLinks.length;
}

export async function cleanupTestIssues(): Promise<number> {
  const { allIssues } = await gql<{ allIssues: Issue[] }>(`
    query { allIssues { id number title } }
  `);

  // Test issues have high numbers (timestamp-based) or empty titles
  const testIssues = allIssues.filter(
    (i) => i.number > 1000 || i.title === null || i.title === "",
  );

  for (const issue of testIssues) {
    await gql(`mutation($id: String!) { deleteIssue(id: $id) { id } }`, {
      id: issue.id,
    });
  }

  return testIssues.length;
}

export async function cleanupAll(): Promise<{ issues: number; links: number }> {
  const links = await cleanupTestLinks();
  const issues = await cleanupTestIssues();
  return { issues, links };
}
