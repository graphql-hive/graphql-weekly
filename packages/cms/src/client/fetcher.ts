import { GraphQLClient } from "graphql-request";

// In dev, use absolute URL since CMS and API run on different ports
// In production, use PUBLIC_API_URL if set (for PR previews), otherwise relative /graphql (routes handle it)
const endpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "/graphql";

export const graphqlClient = new GraphQLClient(endpoint, {
  // Auth handled by Cloudflare Access (JWT in cookie)
  credentials: "include",
});

export function fetcher<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  _headers?: RequestInit["headers"],
): () => Promise<TData> {
  return async () => graphqlClient.request<TData>(query, variables);
}

// Server-side fetcher for Astro SSR
// Uses absolute URL since relative URLs don't work in SSR context
const serverEndpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : import.meta.env.PUBLIC_API_URL || "/graphql";

const serverClient = new GraphQLClient(serverEndpoint);

export async function serverFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  return serverClient.request<TData>(query, variables);
}
