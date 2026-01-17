import { createAuthClient } from "better-auth/react";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  handle: string;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
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
  return _useSession() as ReturnType<typeof _useSession> & { data: Session | null };
}

export function logIn() {
  signIn.social({ provider: "github" });
}
