import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export interface AuthEnv {
  graphqlweekly: D1Database
  BETTER_AUTH_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  BETTER_AUTH_URL?: string
}

export function createAuth(env: AuthEnv) {
  const db = drizzle(env.graphqlweekly, { schema })

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:2012',
    basePath: '/auth',
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
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
