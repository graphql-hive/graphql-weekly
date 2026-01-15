import { betterAuth } from 'better-auth'
import { D1Dialect } from 'kysely-d1'

export interface AuthEnv {
  BETTER_AUTH_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  graphqlweekly: D1Database
  LOCAL_DEV?: string
}

export const GITHUB_REPO_OWNER = 'graphql-hive'
export const GITHUB_REPO_NAME = 'graphql-weekly'

export async function checkGitHubCollaborator(
  accessToken: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'graphql-weekly-cms',
      },
    },
  )
  if (!response.ok) return false
  const data = (await response.json()) as {
    permissions?: {
      admin?: boolean
      maintain?: boolean
      push?: boolean
      triage?: boolean
    }
  }
  const p = data.permissions
  return p?.triage || p?.push || p?.maintain || p?.admin || false
}

export function createAuth(env: AuthEnv) {
  return betterAuth({
    basePath: '/auth',
    baseURL: env.LOCAL_DEV
      ? 'http://localhost:2012'
      : 'https://api.graphqlweekly.com',
    database: {
      dialect: new D1Dialect({ database: env.graphqlweekly }),
      type: 'sqlite',
    },
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
        scope: ['read:user', 'repo'],
      },
    },
    trustedOrigins: [
      'http://localhost:2016', // CMS dev
      'http://localhost:2012', // API dev
      'https://cms.graphqlweekly.com', // CMS prod
      'https://api.graphqlweekly.com', // API prod
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
