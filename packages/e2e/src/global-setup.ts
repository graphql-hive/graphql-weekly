/* eslint-disable no-console */
import { test as setup } from "@playwright/test";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { API_URL, CMS_URL } from "./urls";

const API_DIR = resolve(import.meta.dirname, "../../api");
const AUTH_DIR = resolve(import.meta.dirname, ".auth");

const TEST_USER = {
  email: "test@e2e.local",
  handle: "e2e-test-user",
  name: "E2E Test User",
  password: "test-password-123",
};

const NON_COLLABORATOR_USER = {
  email: "non-collaborator@e2e.local",
  handle: "non-collaborator",
  name: "Non-Collaborator User",
  password: "test-password-456",
};

// Seed data (issue #999, AllowedEmail) created by globalSetup BEFORE webServers start

setup("create authenticated session", async ({ playwright }) => {
  // Use fresh request context with Origin header for Better Auth
  const request = await playwright.request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Origin: CMS_URL },
  });

  // Clean up any existing test account (will be re-created after user creation)
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "DELETE FROM account WHERE id = 'test-account-id'"`,
    { stdio: "inherit" },
  );

  // Try to sign up (might fail if user exists, that's ok)
  const signUpResponse = await request.post(`${API_URL}/auth/sign-up/email`, {
    data: {
      email: TEST_USER.email,
      handle: TEST_USER.handle,
      name: TEST_USER.name,
      password: TEST_USER.password,
    },
  });

  if (signUpResponse.ok()) {
    console.log("✅ Created test user");
  } else {
    console.log("ℹ️ User might already exist, trying to sign in...");
  }

  // Sign in to get user ID
  let signInResponse = await request.post(`${API_URL}/auth/sign-in/email`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });

  if (!signInResponse.ok()) {
    const text = await signInResponse.text();
    throw new Error(`Failed to sign in: ${signInResponse.status()} ${text}`);
  }

  // Get the user ID from the session
  const meResponse = await request.post(`${API_URL}/graphql`, {
    data: { query: "{ me { id } }" },
  });

  const meData = (await meResponse.json()) as {
    data?: { me?: { id: string } };
  };
  const userId = meData.data?.me?.id;

  if (!userId) {
    throw new Error("Could not get user ID");
  }

  // Link GitHub account with collaborator-token BEFORE the final sign-in
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR REPLACE INTO account (id, userId, accountId, providerId, accessToken, createdAt, updatedAt) VALUES ('test-account-id', '${userId}', '12345', 'github', 'collaborator-token', datetime('now'), datetime('now'))"`,
    { stdio: "inherit" },
  );
  console.log("✅ Linked GitHub account for collaborator check");

  // Sign out to clear the session (cookie cache has stale isCollaborator)
  await request.post(`${API_URL}/auth/sign-out`);

  // Sign in AGAIN - this creates a new session with isCollaborator=true
  // because checkIsCollaborator will find the account with collaborator-token
  signInResponse = await request.post(`${API_URL}/auth/sign-in/email`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });

  if (!signInResponse.ok()) {
    const text = await signInResponse.text();
    throw new Error(
      `Failed to sign in after linking account: ${signInResponse.status()} ${text}`,
    );
  }

  // Save the storage state with the new session (has isCollaborator=true)
  await request.storageState({ path: `${AUTH_DIR}/user.json` });
  console.log("✅ Auth state saved with collaborator session");
});

setup("create non-collaborator session", async ({ playwright }) => {
  // Need a fresh request context to avoid cookie conflicts
  const requestContext = await playwright.request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Origin: CMS_URL },
  });

  // Clean up any existing non-collaborator account
  execSync(
    `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "DELETE FROM account WHERE id = 'non-collaborator-account-id'"`,
    { stdio: "inherit" },
  );

  // Try to sign up
  const signUpResponse = await requestContext.post(
    `${API_URL}/auth/sign-up/email`,
    {
      data: {
        email: NON_COLLABORATOR_USER.email,
        handle: NON_COLLABORATOR_USER.handle,
        name: NON_COLLABORATOR_USER.name,
        password: NON_COLLABORATOR_USER.password,
      },
    },
  );

  if (signUpResponse.ok()) {
    console.log("✅ Created non-collaborator user");
  }

  // Sign in
  const signInResponse = await requestContext.post(
    `${API_URL}/auth/sign-in/email`,
    {
      data: {
        email: NON_COLLABORATOR_USER.email,
        password: NON_COLLABORATOR_USER.password,
      },
    },
  );

  if (!signInResponse.ok()) {
    const text = await signInResponse.text();
    throw new Error(
      `Failed to sign in non-collaborator: ${signInResponse.status()} ${text}`,
    );
  }

  // Save to separate auth file
  await requestContext.storageState({
    path: `${AUTH_DIR}/non-collaborator.json`,
  });
  console.log("✅ Non-collaborator auth state saved");

  // Get user ID and link a non-collaborator account
  const meResponse = await requestContext.post(`${API_URL}/graphql`, {
    data: { query: "{ me { id } }" },
  });

  const meData = (await meResponse.json()) as {
    data?: { me?: { id: string } };
  };
  const userId = meData.data?.me?.id;

  if (userId) {
    // Link account with non-collaborator token
    execSync(
      `cd ${API_DIR} && bunx wrangler d1 execute graphqlweekly --local --command "INSERT OR REPLACE INTO account (id, userId, accountId, providerId, accessToken, createdAt, updatedAt) VALUES ('non-collaborator-account-id', '${userId}', '99999', 'github', 'non-collaborator-token', datetime('now'), datetime('now'))"`,
      { stdio: "inherit" },
    );
    console.log("✅ Linked non-collaborator GitHub account");
  }
});
