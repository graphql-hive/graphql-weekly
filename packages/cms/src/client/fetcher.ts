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

// React Query handles retries (3 attempts with exponential backoff by default)
export function fetcher<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  _headers?: RequestInit["headers"],
): () => Promise<TData> {
  // Extract operation name for debugging
  const opMatch = query.match(/(?:query|mutation)\s+(\w+)/);
  const opName = opMatch?.[1] ?? "unknown";

  return async () => {
    // eslint-disable-next-line no-console
    console.log(`[fetcher] ${opName} request at`, new Date().toISOString());
    try {
      return await graphqlClient.request<TData>(query, variables);
    } catch (error) {
      throw normalizePossiblyUnauthedGraphQLError(error);
    }
  };
}

const serverEndpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql";

const serverClient = new GraphQLClient(serverEndpoint);

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 200,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;
      const anyErr = error as { response?: { status?: number } };
      const status = anyErr?.response?.status;
      // Only retry on 5xx
      if (status === undefined || status < 500 || status >= 600) throw error;
      await new Promise((r) => setTimeout(r, baseDelay * 2 ** attempt));
    }
  }
  throw lastError;
}

export async function serverFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  try {
    return await withRetry(() => serverClient.request<TData>(query, variables));
  } catch (error) {
    throw normalizePossiblyUnauthedGraphQLError(error);
  }
}
