import { GraphQLClient } from "graphql-request";

export class CmsAuthError extends Error {
  name = "CmsAuthError";

  constructor(message = "Not authenticated") {
    super(message);
  }
}

// In dev, use localhost. In production, use PUBLIC_API_URL or api.graphqlweekly.com
const endpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql";

export const graphqlClient = new GraphQLClient(endpoint, {
  credentials: "include",
});

function normalizePossiblyUnauthedGraphQLError(err: unknown): unknown {
  const anyErr = err as { response?: { status?: number } };
  if (anyErr?.response?.status === 401) {
    return new CmsAuthError();
  }

  return err;
}

/**
 * Check if error is a transient server error that should be retried.
 * Includes: worker startup, connection resets, and SQLite lock contention.
 */
function isTransientError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("is not valid JSON") ||
    message.includes("Your worker") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("SQLITE_BUSY") ||
    message.includes("database is locked")
  );
}

/**
 * Delay helper for retries
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function fetcher<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  _headers?: RequestInit["headers"],
): () => Promise<TData> {
  return async () => {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await graphqlClient.request<TData>(query, variables);
      } catch (error) {
        lastError = error;
        // Only retry on transient errors
        if (isTransientError(error) && attempt < maxRetries) {
          await delay(500 * attempt); // Exponential backoff: 500ms, 1000ms, 1500ms
          continue;
        }
        throw normalizePossiblyUnauthedGraphQLError(error);
      }
    }

    throw normalizePossiblyUnauthedGraphQLError(lastError);
  };
}

// Server-side fetcher for Astro SSR
const serverEndpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql";

const serverClient = new GraphQLClient(serverEndpoint);

export async function serverFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  try {
    return await serverClient.request<TData>(query, variables);
  } catch (error) {
    throw normalizePossiblyUnauthedGraphQLError(error);
  }
}
