import { createAuthClient } from "better-auth/react";

// Auth always uses production API (for OAuth callbacks to work)
// Local dev uses local API
const baseURL = import.meta.env.DEV
  ? "http://localhost:2012"
  : "https://api.graphqlweekly.com";

export const authClient = createAuthClient({
  basePath: "/auth",
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;
