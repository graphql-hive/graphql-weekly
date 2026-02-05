import type { D1Database } from '@cloudflare/workers-types'

import { betterAuth } from 'better-auth'
import { D1Dialect } from 'kysely-d1'

import { createDb } from '../db'

export interface AuthEnv {
  AUTH_BASE_URL?: string
  AUTH_COOKIE_DOMAIN?: string
  AUTH_COOKIE_PREFIX?: string
  AUTH_TRUSTED_ORIGINS?: string
  BETTER_AUTH_SECRET: string
  E2E_TEST?: string
  GITHUB_API_URL?: string // For E2E mocking, defaults to https://api.github.com
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  graphqlweekly: D1Database
  LOCAL_DEV?: string
}

export const GITHUB_REPO_OWNER = 'graphql-hive'
export const GITHUB_REPO_NAME = 'graphql-weekly'

const DEFAULT_GITHUB_API_URL = 'https://api.github.com'
const DEFAULT_BASE_URL = 'https://api.graphqlweekly.com'
const DEFAULT_TRUSTED_ORIGINS = [
  'https://graphqlweekly.com',
  'https://*.graphqlweekly.com',
  'http://localhost:*',
]

function parseTrustedOrigins(value?: string): string[] | null {
  if (!value) return null
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
  return origins.length > 0 ? origins : null
}

function buildAdvancedOptions(
  cookieDomain?: string,
  cookiePrefix?: string,
): {
  cookiePrefix?: string
  crossSubDomainCookies?: { domain: string; enabled: true }
} | null {
  if (!cookieDomain && !cookiePrefix) return null
  return {
    ...(cookiePrefix ? { cookiePrefix } : {}),
    ...(cookieDomain
      ? { crossSubDomainCookies: { domain: cookieDomain, enabled: true } }
      : {}),
  }
}

export async function getVerifiedEmails(
  accessToken: string,
  githubApiUrl = DEFAULT_GITHUB_API_URL,
): Promise<string[]> {
  const response = await fetch(`${githubApiUrl}/user/emails`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'graphql-weekly-api',
    },
  })

  if (!response.ok) return []

  const emails = (await response.json()) as {
    email: string
    verified: boolean
  }[]

  return emails.filter((e) => e.verified).map((e) => e.email)
}

export async function getUserOrgs(
  accessToken: string,
  githubApiUrl = DEFAULT_GITHUB_API_URL,
): Promise<string[]> {
  const response = await fetch(`${githubApiUrl}/user/orgs`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'graphql-weekly-api',
    },
  })

  if (!response.ok) return []

  const orgs = (await response.json()) as { login: string }[]
  return orgs.map((o) => o.login)
}

async function checkIsCollaborator(
  db: ReturnType<typeof createDb>,
  userId: string,
  githubApiUrl: string,
): Promise<boolean> {
  const account = await db
    .selectFrom('account')
    .select('accessToken')
    .where('userId', '=', userId)
    .where('providerId', '=', 'github')
    .executeTakeFirst()

  if (!account?.accessToken) return false

  // Check email allowlist
  const verifiedEmails = await getVerifiedEmails(
    account.accessToken,
    githubApiUrl,
  )
  if (verifiedEmails.length > 0) {
    const allowed = await db
      .selectFrom('AllowedEmail')
      .select('email')
      .where('email', 'in', verifiedEmails)
      .executeTakeFirst()
    if (allowed) return true
  }

  // Check org allowlist
  const userOrgs = await getUserOrgs(account.accessToken, githubApiUrl)
  if (userOrgs.length > 0) {
    const allowed = await db
      .selectFrom('AllowedOrg')
      .select('org')
      .where('org', 'in', userOrgs)
      .executeTakeFirst()
    if (allowed) return true
  }

  return false
}

export function createAuth(env: AuthEnv) {
  const isTestMode = !!(env.LOCAL_DEV || env.E2E_TEST)
  const githubApiUrl = env.GITHUB_API_URL || DEFAULT_GITHUB_API_URL
  const trustedOrigins =
    parseTrustedOrigins(env.AUTH_TRUSTED_ORIGINS) || DEFAULT_TRUSTED_ORIGINS
  const baseURL = isTestMode
    ? 'http://localhost:2012'
    : env.AUTH_BASE_URL || DEFAULT_BASE_URL
  const cookieDomain = isTestMode
    ? undefined
    : env.AUTH_COOKIE_DOMAIN || '.graphqlweekly.com'
  const advanced = isTestMode
    ? undefined
    : buildAdvancedOptions(cookieDomain, env.AUTH_COOKIE_PREFIX) || undefined
  const db = createDb(env.graphqlweekly)

  return betterAuth({
    basePath: '/auth',
    baseURL,
    database: {
      dialect: new D1Dialect({ database: env.graphqlweekly }),
      type: 'sqlite',
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const isCollaborator = await checkIsCollaborator(
              db,
              session.userId,
              githubApiUrl,
            )
            return {
              data: {
                ...session,
                isCollaborator,
              },
            }
          },
        },
      },
    },
    // Enable email/password auth for E2E tests
    advanced,
    emailAndPassword: isTestMode ? { enabled: true } : undefined,
    secret: env.BETTER_AUTH_SECRET,
    session: {
      additionalFields: {
        isCollaborator: {
          required: false,
          type: 'boolean',
        },
      },
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
    trustedOrigins,
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
