import { GraphQLClient } from "graphql-request";

const endpoint = "https://graphqlweekly-api.netlify.app/.netlify/functions/graphql";
const token = "JWT_TOKEN_REDACTED";

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: token,
  },
});

export function fetcher<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  _headers?: RequestInit["headers"]
): () => Promise<TData> {
  return async () => graphqlClient.request<TData>(query, variables);
}

