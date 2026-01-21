import type { Kysely } from 'kysely'

/// <reference types="@cloudflare/workers-types" />
import { createSchema, createYoga } from 'graphql-yoga'

import { type AuthEnv, createAuth } from './auth'
import { createDb, type Database } from './db'
import { resolvers } from './resolvers'

export interface Env extends AuthEnv {
  E2E_TEST?: string
  LOCAL_DEV?: string
  MAILCHIMP_API_KEY?: string
  MAILCHIMP_SERVER_PREFIX?: string
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

const typeDefs = /* GraphQL */ `
  scalar DateTime

  type Author {
    avatarUrl: String
    createdAt: DateTime
    description: String
    id: String
    issues: [Issue!]
    name: String
    updatedAt: DateTime
  }

  type Issue {
    author: Author
    authorId: String
    comment: String
    date: DateTime
    description: String
    id: String
    number: Int
    previewImage: String
    published: Boolean
    specialPerk: String
    title: String
    topics: [Topic!]
    versionCount: Int
  }

  type Link {
    id: String
    position: Int
    text: String
    title: String
    topic: Topic
    topicId: String
    url: String
  }

  type LinkSubmission {
    createdAt: DateTime
    description: String
    email: String
    id: String
    name: String
    title: String
    updatedAt: DateTime
    url: String
  }

  type Topic {
    id: String
    issue: Issue
    issueId: String
    issue_comment: String
    links: [Link!]
    position: Int
    title: String
  }

  type Subscriber {
    email: String
    id: String
    name: String
  }

  type Me {
    id: String!
    name: String!
    email: String!
    image: String
    isCollaborator: Boolean!
    repositoryUrl: String!
  }

  type Query {
    me: Me
    allIssues: [Issue!]
    allTopics: [Topic!]
    allAuthors: [Author!]
    allLinks: [Link!]
    allSubscribers: [Subscriber!]
    allLinkSubmissions: [LinkSubmission!]
    issue(id: String!): Issue
  }

  type Mutation {
    createSubscriber(email: String!, name: String!): Subscriber
    createLink(url: String!): Link
    createIssue(
      title: String!
      number: Int!
      published: Boolean!
      date: DateTime
    ): Issue
    createTopic(title: String!, issue_comment: String!, issueId: String!): Topic
    createSubmissionLink(
      name: String!
      email: String!
      description: String!
      title: String!
      url: String!
    ): LinkSubmission
    updateLink(id: String!, title: String!, text: String, url: String): Link
    updateIssue(
      id: String!
      published: Boolean
      versionCount: Int
      previewImage: String
    ): Issue
    updateTopic(id: String!, position: Int): Topic
    updateTopicWhenIssueDeleted(id: String!): Topic
    addLinksToTopic(topicId: String!, linkId: String!): Topic
    deleteLink(id: String!): Link
    deleteIssue(id: String!): Issue
    publishEmailDraft(
      id: String!
      versionCount: Int
      isFoundation: Boolean
    ): Issue
  }
`

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
      url.hostname.endsWith('.graphqlweekly.com')
    )
  } catch {
    return false
  }
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

    if (preview && env.WORKERS_DEV_SUBDOMAIN) {
      const workerName =
        preview.service === 'api' ? 'graphqlweekly-api' : 'graphqlweekly-cms'
      const previewUrl = `https://${preview.subdomain}-${workerName}.${env.WORKERS_DEV_SUBDOMAIN}.workers.dev${url.pathname}${url.search}`
      const proxyRequest = new Request(previewUrl, {
        body: request.body,
        headers: request.headers,
        method: request.method,
      })
      return fetch(proxyRequest)
    }

    const origin = request.headers.get('Origin')
    const corsOrigin = origin && isAllowedOrigin(origin) ? origin : null

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

    // Better Auth handler
    if (url.pathname.startsWith('/auth')) {
      const auth = createAuth(env)
      const response = await auth.handler(request)
      if (corsOrigin) {
        const headers = new Headers(response.headers)
        headers.set('Access-Control-Allow-Origin', corsOrigin)
        headers.set('Access-Control-Allow-Credentials', 'true')
        return new Response(response.body, {
          headers,
          status: response.status,
          statusText: response.statusText,
        })
      }
      return response
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
            isCollaborator: !!(session.session as { isCollaborator?: boolean })
              .isCollaborator,
            name: session.user.name,
          }
        }
      } catch {
        // No session or invalid session
      }

      return yoga.fetch(request, { db, env, user })
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
  },
}
