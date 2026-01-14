import { GraphQLClient } from "graphql-request";

// In dev, use localhost. In production, use PUBLIC_API_URL or api.graphqlweekly.com
const endpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : (import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql");

export const graphqlClient = new GraphQLClient(endpoint, {
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
const serverEndpoint = import.meta.env.DEV
  ? "http://localhost:2012/graphql"
  : (import.meta.env.PUBLIC_API_URL || "https://api.graphqlweekly.com/graphql");

const serverClient = new GraphQLClient(serverEndpoint);

export async function serverFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  return serverClient.request<TData>(query, variables);
}
