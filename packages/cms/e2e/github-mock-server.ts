/**
 * Mock GitHub API server for E2E tests
 *
 * Provides mock responses for:
 * - GET /user/emails - returns verified emails
 * - GET /user/orgs - returns org memberships
 *
 * The mock returns data based on the Authorization header token:
 * - "collaborator-token" -> returns emails/orgs that grant access
 * - any other token -> returns empty arrays (no access)
 */

const MOCK_PORT = 2099;

// Tokens that should be treated as collaborators
const COLLABORATOR_TOKENS = new Set(["collaborator-token"]);

// Mock data for collaborators - these should match AllowedEmail/AllowedOrg in DB
const COLLABORATOR_EMAILS = [
  {
    email: "test@e2e.local",
    primary: true,
    verified: true,
    visibility: "public",
  },
];

const COLLABORATOR_ORGS = [{ id: 1, login: "graphql-hive" }];

function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

const server = Bun.serve({
  fetch(request: Request) {
    const url = new URL(request.url);
    const token = getTokenFromHeader(request.headers.get("Authorization"));
    const isCollaborator = token && COLLABORATOR_TOKENS.has(token);

    // GET /user/emails
    if (url.pathname === "/user/emails" && request.method === "GET") {
      const emails = isCollaborator ? COLLABORATOR_EMAILS : [];
      return Response.json(emails);
    }

    // GET /user/orgs
    if (url.pathname === "/user/orgs" && request.method === "GET") {
      const orgs = isCollaborator ? COLLABORATOR_ORGS : [];
      return Response.json(orgs);
    }

    // Unknown endpoint
    return new Response("Not Found", { status: 404 });
  },
  port: MOCK_PORT,
});

// eslint-disable-next-line no-console
console.log(`Mock GitHub API server running on http://localhost:${MOCK_PORT}`);

export { MOCK_PORT, server };
