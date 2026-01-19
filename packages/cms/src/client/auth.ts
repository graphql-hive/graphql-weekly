import { createAuthClient } from "better-auth/react";

export interface User {
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  handle: string;
  id: string;
  image?: string | null;
  name: string;
  updatedAt: Date;
}

export interface Session {
  session: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    ipAddress?: string | null;
    token: string;
    updatedAt: Date;
    userAgent?: string | null;
    userId: string;
  };
  user: User;
}

const baseURL = import.meta.env.DEV
  ? "http://localhost:2012"
  : "https://api.graphqlweekly.com";

const authClient = createAuthClient({
  basePath: "/auth",
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut } = authClient;

const _useSession = authClient.useSession;
export function useSession() {
  return _useSession() as ReturnType<typeof _useSession> & {
    data: Session | null;
  };
}

export function logIn() {
  signIn.social({
    callbackURL: globalThis.location.origin,
    provider: "github",
  });
}
