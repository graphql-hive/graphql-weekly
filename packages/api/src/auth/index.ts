import { betterAuth } from 'better-auth'
import { D1Dialect } from 'kysely-d1'

export interface AuthEnv {
  BETTER_AUTH_SECRET: string
  E2E_TEST?: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  graphqlweekly: D1Database
  LOCAL_DEV?: string
}

export const GITHUB_REPO_OWNER = 'graphql-hive'
export const GITHUB_REPO_NAME = 'graphql-weekly'

// Test token for E2E tests
const TEST_COLLABORATOR_TOKEN = 'test-access-token'

export function isTestCollaboratorToken(accessToken: string): boolean {
  return accessToken === TEST_COLLABORATOR_TOKEN
}

export async function getVerifiedEmails(accessToken: string): Promise<string[]> {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'graphql-weekly-api',
    },
  })

  if (!response.ok) {
    console.log('[getVerifiedEmails] GitHub API error:', response.status)
    return []
  }

  const emails = (await response.json()) as {
    email: string
    verified: boolean
  }[]

  const verified = emails.filter((e) => e.verified).map((e) => e.email)
  console.log('[getVerifiedEmails] found:', verified.length, 'verified emails')
  return verified
}

export async function getUserOrgs(accessToken: string): Promise<string[]> {
  const response = await fetch('https://api.github.com/user/orgs', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'graphql-weekly-api',
    },
  })

  if (!response.ok) {
    console.log('[getUserOrgs] GitHub API error:', response.status)
    return []
  }

  const orgs = (await response.json()) as {login: string}[]
  console.log('[getUserOrgs] user orgs:', orgs.map((o) => o.login))
  return orgs.map((o) => o.login)
}

export function createAuth(env: AuthEnv) {
  const isTestMode = env.LOCAL_DEV || env.E2E_TEST
  return betterAuth({
    basePath: '/auth',
    baseURL: isTestMode
      ? 'http://localhost:2012'
      : 'https://api.graphqlweekly.com',
    database: {
      dialect: new D1Dialect({ database: env.graphqlweekly }),
      type: 'sqlite',
    },
    // Enable email/password auth for E2E tests
    advanced: isTestMode
      ? undefined
      : {
          crossSubDomainCookies: {
            domain: '.graphqlweekly.com',
            enabled: true,
          },
        },
    emailAndPassword: isTestMode ? { enabled: true } : undefined,
    secret: env.BETTER_AUTH_SECRET,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        mapProfileToUser: (profile) => ({
          handle: profile.login,
        }),
        scope: ['read:user', 'user:email', 'read:org'],
      },
    },
    trustedOrigins: [
      'https://graphqlweekly.com',
      'https://*.graphqlweekly.com',
      'http://localhost:*',
    ],
    user: {
      additionalFields: {
        handle: {
          required: true,
          type: 'string',
        },
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
