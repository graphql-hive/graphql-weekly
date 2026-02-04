import type { Kysely } from 'kysely'

/// <reference types="@cloudflare/workers-types" />
import { createSchema, createYoga } from 'graphql-yoga'

import { type AuthEnv, createAuth } from './auth'
import { createDb, type Database } from './db'
import { resolvers } from './resolvers'
import typeDefs from './schema.graphql'

export interface Env extends AuthEnv {
  E2E_TEST?: string
  LOCAL_DEV?: string
  MAILCHIMP_API_KEY?: string
  MAILCHIMP_SERVER_PREFIX?: string
  PREVIEW_API_WORKER_NAME?: string
  PREVIEW_CMS_WORKER_NAME?: string
  WORKERS_DEV_SUBDOMAIN?: string
}

export interface User {
  email: string
  id: string
  image?: string | null
  isCollaborator: boolean
  name: string
}

export interface GraphQLContext {
  db: Kysely<Database>
  env: Env
  user: User | null
}

const schema = createSchema<GraphQLContext>({ resolvers, typeDefs })

const yoga = createYoga<GraphQLContext>({
  graphqlEndpoint: '/graphql',
  schema,
})

function getPreviewSubdomain(
  hostname: string,
): { service: 'api' | 'cms'; subdomain: string } | null {
  const apiMatch = hostname.match(/^([a-z0-9-]+)-api\.graphqlweekly\.com$/)
  if (apiMatch) {
    return { service: 'api', subdomain: apiMatch[1] }
  }
  const cmsMatch = hostname.match(/^([a-z0-9-]+)-cms\.graphqlweekly\.com$/)
  if (cmsMatch) {
    return { service: 'cms', subdomain: cmsMatch[1] }
  }
  return null
}

function isAllowedOrigin(origin: string): boolean {
  if (origin.startsWith('http://localhost:')) return true
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:') return false
    return (
      url.hostname === 'graphqlweekly.com' ||
      url.hostname === 'cms.graphqlweekly.com' ||
      url.hostname.endsWith('.graphqlweekly.com') ||
      url.hostname.endsWith('.workers.dev')
    )
  } catch {
    return false
  }
}

function addCorsHeaders(
  response: Response,
  corsOrigin: string | null,
): Response {
  if (!corsOrigin) return response
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', corsOrigin)
  headers.set('Access-Control-Allow-Credentials', 'true')
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)
    const { hostname } = url
    const preview = getPreviewSubdomain(hostname)

    const origin = request.headers.get('Origin')
    const corsOrigin = origin && isAllowedOrigin(origin) ? origin : null

    if (preview && env.WORKERS_DEV_SUBDOMAIN) {
      // Handle CORS preflight for preview proxies
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsOrigin
            ? {
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type, Cookie',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Origin': corsOrigin,
              }
            : {},
        })
      }

      const workerName =
        preview.service === 'api'
          ? env.PREVIEW_API_WORKER_NAME || 'graphqlweekly-api'
          : env.PREVIEW_CMS_WORKER_NAME || 'graphqlweekly-cms'
      const previewUrl = `https://${preview.subdomain}-${workerName}.${env.WORKERS_DEV_SUBDOMAIN}.workers.dev${url.pathname}${url.search}`
      const proxyRequest = new Request(previewUrl, {
        body: request.body,
        headers: request.headers,
        method: request.method,
      })
      const response = await fetch(proxyRequest)
      return addCorsHeaders(response, corsOrigin)
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsOrigin
          ? {
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Headers': 'Content-Type, Cookie',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Origin': corsOrigin,
            }
          : {},
      })
    }

    // Wrap everything in try-catch to ensure CORS headers on error responses
    try {
      // Better Auth handler
      if (url.pathname.startsWith('/auth')) {
        const auth = createAuth(env)
        const response = await auth.handler(request)
        return addCorsHeaders(response, corsOrigin)
      }

      if (url.pathname === '/graphql' || url.pathname === '/graphql/') {
        const db = createDb(env.graphqlweekly)
        const auth = createAuth(env)

        let user: GraphQLContext['user'] = null
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          })
          if (session?.user) {
            user = {
              email: session.user.email,
              id: session.user.id,
              image: session.user.image,
              isCollaborator: !!(
                session.session as { isCollaborator?: boolean }
              ).isCollaborator,
              name: session.user.name,
            }
          }
        } catch {
          // No session or invalid session
        }

        const response = await yoga.fetch(request, { db, env, user })
        return addCorsHeaders(response, corsOrigin)
      }

      // Health check
      if (url.pathname === '/health') {
        return new Response('OK', { status: 200 })
      }

      // Redirect root to CMS (Better Auth defaults to '/' after OAuth)
      if (url.pathname === '/' || url.pathname === '') {
        const cmsUrl =
          env.LOCAL_DEV || env.E2E_TEST
            ? 'http://localhost:2016'
            : 'https://cms.graphqlweekly.com'
        return Response.redirect(cmsUrl, 302)
      }

      return new Response('Not Found', { status: 404 })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Worker error:', error)
      const errorResponse = Response.json(
        {
          errors: [{ message: 'Internal server error' }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      )
      return addCorsHeaders(errorResponse, corsOrigin)
    }
  },
}
