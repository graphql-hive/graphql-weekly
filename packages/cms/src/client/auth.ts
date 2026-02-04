import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

type ServerAuth = ReturnType<
  typeof import("@gqlweekly/api/src/auth").createAuth
>;

const baseURL = import.meta.env.DEV
  ? "http://localhost:2012"
  : import.meta.env.PUBLIC_AUTH_URL || "https://api.graphqlweekly.com";

const authClient = createAuthClient({
  basePath: "/auth",
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [inferAdditionalFields<ServerAuth>()],
});

export const { signIn, signOut, useSession } = authClient;

export function logIn() {
  signIn.social({
    callbackURL: globalThis.location.origin,
    provider: "github",
  });
}

export type Session = typeof authClient.$Infer.Session.session;
export type User = typeof authClient.$Infer.Session.user;
