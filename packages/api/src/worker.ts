import type { Kysely } from 'kysely'

/// <reference types="@cloudflare/workers-types" />
import { createSchema, createYoga } from 'graphql-yoga'

import { createDb, type Database } from './db'
import { resolvers } from './resolvers'

export interface Env {
  graphqlweekly: D1Database
  JWT_SECRET?: string
  LOCAL_DEV?: string
  MAILCHIMP_API_KEY?: string
}

export interface GraphQLContext {
  db: Kysely<Database>
  env: Env
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

  type Query {
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

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/graphql' || url.pathname === '/graphql/') {
      const db = createDb(env.graphqlweekly)
      return yoga.fetch(request, { db, env })
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 })
    }

    // Redirect root to GraphiQL in dev
    if (url.pathname === '/' || url.pathname === '') {
      return Response.redirect(new URL('/graphql', url.origin).href, 302)
    }

    return new Response('Not Found', { status: 404 })
  },
}
