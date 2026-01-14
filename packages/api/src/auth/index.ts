import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export interface AuthEnv {
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL?: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  graphqlweekly: D1Database
}

export const GITHUB_REPO_OWNER = 'graphql-hive'
export const GITHUB_REPO_NAME = 'graphql-weekly'

export async function checkGitHubCollaborator(accessToken: string): Promise<boolean> {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'graphql-weekly-cms',
    },
  })
  if (!userResponse.ok) {
    return false
  }
  const userData = (await userResponse.json()) as { login: string }

  const collabResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/collaborators/${userData.login}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'graphql-weekly-cms',
      },
    },
  )

  return collabResponse.status === 204
}

export function createAuth(env: AuthEnv) {
  const db = drizzle(env.graphqlweekly, { schema })

  return betterAuth({
    basePath: '/auth',
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:2012',
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
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
      'https://cms.graphqlweekly.com', // CMS prod (TODO: update if different)
      'https://api.graphqlweekly.com', // API prod
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
