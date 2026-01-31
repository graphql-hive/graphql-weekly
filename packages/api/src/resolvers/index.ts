import { GraphQLError } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'

import type { LinkRow, TopicRow } from '../db/types'
import type { NewsletterTopic } from '../email'
import type { Resolvers } from '../generated/graphql'
import type { GraphQLContext, User } from '../worker'

import { GITHUB_REPO_NAME, GITHUB_REPO_OWNER } from '../auth'
import { createEmailCampaign } from '../services/mailchimp'

// Extended types with prefetched data for N+1 optimization
type TopicWithLinks = TopicRow & { _prefetchedLinks?: LinkRow[] }
type IssueWithTopics = { _prefetchedTopics?: TopicWithLinks[] }
type LinkWithTopic = LinkRow & { _prefetchedTopic?: TopicRow | null }

function generateId(): string {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 25)
}

type AuthenticatedContext = GraphQLContext & { user: User }
type CollaboratorContext = GraphQLContext & {
  user: User & { isCollaborator: true }
}

function requireAuth(ctx: GraphQLContext): asserts ctx is AuthenticatedContext {
  if (!ctx.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    })
  }
}

function requireCollaborator(
  ctx: GraphQLContext,
): asserts ctx is CollaboratorContext {
  requireAuth(ctx)
  if (!ctx.user.isCollaborator) {
    throw new GraphQLError(
      `Access denied: you must be a collaborator on ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      { extensions: { code: 'FORBIDDEN', http: { status: 403 } } },
    )
  }
}

async function fetchUrlMetadata(
  url: string,
): Promise<{ description?: string; title?: string }> {
  const metadata: { description?: string; title?: string } = {}
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'GraphQL-Weekly-Bot/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (
      !response.ok ||
      !response.headers.get('content-type')?.includes('text/html')
    ) {
      return metadata
    }
    // Limit body to 1 MB to guard against oversized responses.
    // Content-Length alone is insufficient (chunked encoding, spoofing).
    const MAX_BODY_BYTES = 1024 * 1024
    let bytesRead = 0
    const reader = response.body!.getReader()
    const limitedBody = new ReadableStream({
      cancel() {
        reader.cancel()
      },
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        bytesRead += value.byteLength
        if (bytesRead > MAX_BODY_BYTES) {
          controller.close()
          reader.cancel()
          return
        }
        controller.enqueue(value)
      },
    })
    const limitedResponse = new Response(limitedBody, response)
    let titleText = ''
    await new HTMLRewriter()
      .on('title', {
        text(text) {
          titleText += text.text
        },
      })
      .on('meta[name="description"]', {
        element(el) {
          metadata.description ||= el.getAttribute('content') || undefined
        },
      })
      .on('meta[property="og:description"]', {
        element(el) {
          metadata.description ||= el.getAttribute('content') || undefined
        },
      })
      .transform(limitedResponse)
      .text()
    if (titleText.trim()) metadata.title = titleText.trim()
  } catch {
    // Metadata fetch is best-effort
  }
  return metadata
}

export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,

  Mutation: {
    addLinksToTopic: async (_parent, { linkId, topicId }, ctx) => {
      requireCollaborator(ctx)
      await ctx.db
        .updateTable('Link')
        .set({
          topicId,
          updatedAt: new Date().toISOString(),
          updatedBy: ctx.user.id,
        })
        .where('id', '=', linkId)
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', topicId)
        .executeTakeFirst()
      return topic ?? null
    },
    createIssue: async (_parent, { date, number, published, title }, ctx) => {
      requireCollaborator(ctx)
      const id = generateId()
      const dateStr = date ? date.toISOString() : new Date().toISOString()
      const now = new Date().toISOString()
      try {
        await ctx.db
          .insertInto('Issue')
          .values({
            createdAt: now,
            createdBy: ctx.user.id,
            date: dateStr,
            id,
            number,
            published: published ? 1 : 0,
            title,
            updatedAt: now,
            updatedBy: ctx.user.id,
            versionCount: 0,
          })
          .execute()
        const issue = await ctx.db
          .selectFrom('Issue')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst()
        return issue ?? null
      } catch (error) {
        // Handle UNIQUE constraint on number - return existing issue (idempotent)
        if (
          error instanceof Error &&
          error.message.includes('UNIQUE constraint')
        ) {
          const existing = await ctx.db
            .selectFrom('Issue')
            .selectAll()
            .where('number', '=', number)
            .executeTakeFirst()
          if (existing) return existing
        }
        throw error
      }
    },
    createLink: async (_parent, { url }, ctx) => {
      requireCollaborator(ctx)
      const id = generateId()
      const now = new Date().toISOString()
      const metadata = await fetchUrlMetadata(url)
      await ctx.db
        .insertInto('Link')
        .values({
          createdAt: now,
          createdBy: ctx.user.id,
          id,
          text: metadata.description ?? null,
          title: metadata.title ?? null,
          updatedAt: now,
          updatedBy: ctx.user.id,
          url,
        })
        .execute()
      const link = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return link ?? null
    },
    createSubmissionLink: async (
      _parent,
      { description, email, name, title, url },
      ctx,
    ) => {
      const id = generateId()
      const now = new Date().toISOString()
      await ctx.db
        .insertInto('LinkSubmission')
        .values({
          createdAt: now,
          description,
          email,
          id,
          name,
          title,
          updatedAt: now,
          url,
        })
        .execute()
      const submission = await ctx.db
        .selectFrom('LinkSubmission')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return submission ?? null
    },
    createSubscriber: async (_parent, { email, name }, ctx) => {
      const id = generateId()
      await ctx.db
        .insertInto('Subscriber')
        .values({ email, id, name })
        .execute()
      return { email, id, name }
    },
    createTopic: async (_parent, { issue_comment, issueId, title }, ctx) => {
      requireCollaborator(ctx)
      const id = generateId()
      const now = new Date().toISOString()
      await ctx.db
        .insertInto('Topic')
        .values({
          createdAt: now,
          createdBy: ctx.user.id,
          id,
          issue_comment,
          issueId,
          title,
          updatedAt: now,
          updatedBy: ctx.user.id,
        })
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return topic ?? null
    },
    deleteIssue: async (_parent, { id }, ctx) => {
      requireCollaborator(ctx)
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      if (issue) {
        await ctx.db.deleteFrom('Issue').where('id', '=', id).execute()
      }
      return issue ?? null
    },
    deleteLink: async (_parent, { id }, ctx) => {
      requireCollaborator(ctx)
      const link = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      if (link) {
        await ctx.db.deleteFrom('Link').where('id', '=', id).execute()
      }
      return link ?? null
    },
    publishEmailDraft: async (
      _parent,
      { id, isFoundation, versionCount },
      ctx,
    ) => {
      requireCollaborator(ctx)
      if (versionCount !== null && versionCount !== undefined) {
        await ctx.db
          .updateTable('Issue')
          .set({ versionCount })
          .where('id', '=', id)
          .execute()
      }

      // Fetch issue with topics and links
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()

      if (!issue) return null

      // Fetch topics for this issue
      const topics = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('issueId', '=', id)
        .orderBy('position', 'asc')
        .execute()

      // Fetch links for each topic
      const topicsWithLinks: NewsletterTopic[] = await Promise.all(
        topics.map(async (topic) => {
          const links = await ctx.db
            .selectFrom('Link')
            .selectAll()
            .where('topicId', '=', topic.id)
            .orderBy('position', 'asc')
            .execute()
          return {
            links: links.map((link) => ({
              text: link.text ?? '',
              title: link.title ?? '',
              url: link.url,
            })),
            title: topic.title,
          }
        }),
      )

      // Create Mailchimp campaign if API key is configured
      if (ctx.env.MAILCHIMP_API_KEY && issue.published) {
        try {
          const issueDate = issue.date
            ? new Date(issue.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : undefined
          await createEmailCampaign(
            {
              apiKey: ctx.env.MAILCHIMP_API_KEY,
              serverPrefix: ctx.env.MAILCHIMP_SERVER_PREFIX,
            },
            issue.number,
            issueDate,
            topicsWithLinks,
            issue.versionCount,
            isFoundation ?? false,
          )
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to create Mailchimp campaign:', error)
          throw new Error('Failed to create Mailchimp campaign')
        }
      } else if (issue.published) {
        if (ctx.env.LOCAL_DEV || ctx.env.E2E_TEST) {
          const [{ render }, { Newsletter }] = await Promise.all([
            import('@react-email/components'),
            import('../email'),
          ])
          const devIssueDate = issue.date
            ? new Date(issue.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : undefined
          const emailHtml = await render(
            Newsletter({
              isFoundationEdition: isFoundation ?? false,
              issueDate: devIssueDate,
              issueNumber: issue.number,
              topics: topicsWithLinks,
            }),
          )
          /* eslint-disable no-console */
          console.log('=== DEV EMAIL PREVIEW ===')
          console.log(emailHtml)
          console.log('=== END EMAIL PREVIEW ===')
          /* eslint-enable no-console */
        } else {
          throw new Error('MAILCHIMP_API_KEY is required in production')
        }
      }

      return issue
    },
    updateIssue: async (
      _parent,
      { id, previewImage, published, versionCount },
      ctx,
    ) => {
      requireCollaborator(ctx)
      const updates: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
        updatedBy: ctx.user.id,
      }
      if (published !== null && published !== undefined)
        updates.published = published ? 1 : 0
      if (versionCount !== null && versionCount !== undefined)
        updates.versionCount = versionCount
      if (previewImage !== null && previewImage !== undefined)
        updates.previewImage = previewImage

      await ctx.db
        .updateTable('Issue')
        .set(updates)
        .where('id', '=', id)
        .execute()
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return issue ?? null
    },
    updateLink: async (_parent, { id, text, title, url }, ctx) => {
      requireCollaborator(ctx)
      await ctx.db
        .updateTable('Link')
        .set({
          title,
          updatedAt: new Date().toISOString(),
          updatedBy: ctx.user.id,
          ...(text !== null && text !== undefined ? { text } : {}),
          ...(url !== null && url !== undefined ? { url } : {}),
        })
        .where('id', '=', id)
        .execute()
      const link = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return link ?? null
    },
    updateTopic: async (_parent, { id, position }, ctx) => {
      requireCollaborator(ctx)
      const updates: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
        updatedBy: ctx.user.id,
      }
      if (position !== null && position !== undefined) {
        updates.position = position
      }
      await ctx.db
        .updateTable('Topic')
        .set(updates)
        .where('id', '=', id)
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return topic ?? null
    },
    updateTopicWhenIssueDeleted: async (_parent, { id }, ctx) => {
      requireCollaborator(ctx)
      await ctx.db
        .updateTable('Topic')
        .set({ issueId: null })
        .where('id', '=', id)
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return topic ?? null
    },
  },

  Query: {
    allAuthors: async (_parent, { limit, skip }, ctx) => {
      let query = ctx.db.selectFrom('Author').selectAll()
      if (skip != null) query = query.offset(skip)
      query = query.limit(limit ?? 1000)
      return query.execute()
    },
    allIssues: async (_parent, { limit, skip }, ctx) => {
      // Fetch issues with pagination, prefetch all topics/links to avoid N+1
      let issueQuery = ctx.db.selectFrom('Issue').selectAll()
      if (skip != null) issueQuery = issueQuery.offset(skip)
      issueQuery = issueQuery.limit(limit ?? 1000)

      const [issues, allTopics, allLinks] = await Promise.all([
        issueQuery.execute(),
        ctx.db
          .selectFrom('Topic')
          .selectAll()
          .orderBy('position', 'asc')
          .execute(),
        ctx.db
          .selectFrom('Link')
          .selectAll()
          .orderBy('position', 'asc')
          .execute(),
      ])

      // Group links by topicId
      const linksByTopic = new Map<string, typeof allLinks>()
      for (const link of allLinks) {
        if (!link.topicId) continue
        const existing = linksByTopic.get(link.topicId) ?? []
        existing.push(link)
        linksByTopic.set(link.topicId, existing)
      }

      // Group topics by issueId, with prefetched links
      const topicsByIssue = new Map<
        string,
        ((typeof allTopics)[0] & { _prefetchedLinks: typeof allLinks })[]
      >()
      for (const topic of allTopics) {
        if (!topic.issueId) continue
        const existing = topicsByIssue.get(topic.issueId) ?? []
        existing.push({
          ...topic,
          _prefetchedLinks: linksByTopic.get(topic.id) ?? [],
        })
        topicsByIssue.set(topic.issueId, existing)
      }

      // Attach prefetched topics to issues
      return issues.map((issue) => ({
        ...issue,
        _prefetchedTopics: topicsByIssue.get(issue.id) ?? [],
      }))
    },
    allLinks: async (_parent, { limit, skip }, ctx) => {
      requireCollaborator(ctx)
      let linkQuery = ctx.db.selectFrom('Link').selectAll()
      if (skip != null) linkQuery = linkQuery.offset(skip)
      linkQuery = linkQuery.limit(limit ?? 1000)

      const [links, topics] = await Promise.all([
        linkQuery.execute(),
        ctx.db.selectFrom('Topic').selectAll().execute(),
      ])
      const topicsById = new Map(topics.map((t) => [t.id, t]))
      return links.map((link) => ({
        ...link,
        _prefetchedTopic: link.topicId
          ? (topicsById.get(link.topicId) ?? null)
          : null,
      }))
    },
    allSubscribers: async (_parent, { limit, skip }, ctx) => {
      requireCollaborator(ctx)
      let query = ctx.db.selectFrom('Subscriber').selectAll()
      if (skip != null) query = query.offset(skip)
      query = query.limit(limit ?? 1000)
      return query.execute()
    },
    allTopics: async (_parent, { limit, orderBy, skip }, ctx) => {
      if (orderBy === 'ISSUE_COUNT') {
        // Single query: get representative topic IDs + counts, then
        // join back to fetch full rows, all ordered by popularity.
        let titleQuery = ctx.db
          .selectFrom('Topic')
          .select(['title'])
          .select((eb) => eb.fn.min('id').as('representative_id'))
          .select((eb) => eb.fn.countAll().as('issue_count'))
          .where('issueId', 'is not', null)
          .where('title', 'is not', null)
          .groupBy('title')
          .orderBy('issue_count', 'desc')
        if (skip != null) titleQuery = titleQuery.offset(skip)
        titleQuery = titleQuery.limit(limit ?? 1000)

        const ranked = await titleQuery.execute()
        const ids = ranked
          .map((r) => r.representative_id as string)
          .filter(Boolean)
        if (ids.length === 0) return []

        const topics = await ctx.db
          .selectFrom('Topic')
          .selectAll()
          .where('id', 'in', ids)
          .execute()

        // Restore count-based ordering
        const byId = new Map(topics.map((t) => [t.id, t]))
        return ids.map((id) => byId.get(id)!).filter(Boolean)
      }

      let query = ctx.db.selectFrom('Topic').selectAll()
      if (skip != null) query = query.offset(skip)
      query = query.limit(limit ?? 1000)
      return query.execute()
    },
    issue: async (_parent, { id }, ctx) => {
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return issue ?? null
    },
    linkSubmissions: async (_parent, { limit, skip }, ctx) => {
      requireCollaborator(ctx)
      const effectiveLimit = Math.min(limit ?? 100, 100)
      const effectiveSkip = skip ?? 0

      const [items, countResult] = await Promise.all([
        ctx.db
          .selectFrom('LinkSubmission')
          .selectAll()
          .orderBy('createdAt', 'desc')
          .offset(effectiveSkip)
          .limit(effectiveLimit)
          .execute(),
        ctx.db
          .selectFrom('LinkSubmission')
          .select((eb) => eb.fn.countAll().as('count'))
          .executeTakeFirstOrThrow(),
      ])

      return {
        items,
        totalCount: Number(countResult.count),
      }
    },
    me: (_parent, _args, ctx) => {
      if (!ctx.user) return null
      return {
        email: ctx.user.email,
        id: ctx.user.id,
        image: ctx.user.image,
        isCollaborator: ctx.user.isCollaborator,
        name: ctx.user.name,
        repositoryUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
      }
    },
    unassignedLinks: async (_parent, _args, ctx) => {
      requireCollaborator(ctx)
      return ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('topicId', 'is', null)
        .execute()
    },
  },

  // Type resolvers for relationships
  Author: {
    createdAt: (parent) => new Date(parent.createdAt),
    issues: async (parent, _args, ctx) => {
      const issues = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('authorId', '=', parent.id)
        .execute()
      return issues
    },
    updatedAt: (parent) => new Date(parent.updatedAt),
  },

  Issue: {
    author: async (parent, _args, ctx) => {
      if (!parent.authorId) return null
      const author = await ctx.db
        .selectFrom('Author')
        .selectAll()
        .where('id', '=', parent.authorId)
        .executeTakeFirst()
      return author ?? null
    },
    date: (parent) => new Date(parent.date),
    published: (parent) => !!parent.published,
    topics: async (parent, _args, ctx): Promise<TopicRow[]> => {
      // Use prefetched topics if available (from Query.allIssues)
      const prefetched = (parent as IssueWithTopics)._prefetchedTopics
      if (prefetched) return prefetched

      // Fallback: batch fetch topics with their links in one query to avoid N+1
      const topics = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('issueId', '=', parent.id)
        .orderBy('position', 'asc')
        .execute()

      if (topics.length === 0) return topics

      // Prefetch all links for these topics in one query
      const topicIds = topics.map((t) => t.id)
      const allLinks = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('topicId', 'in', topicIds)
        .orderBy('position', 'asc')
        .execute()

      // Group links by topicId and attach to topics
      const linksByTopic = new Map<string, LinkRow[]>()
      for (const link of allLinks) {
        if (!link.topicId) continue
        const existing = linksByTopic.get(link.topicId) ?? []
        existing.push(link)
        linksByTopic.set(link.topicId, existing)
      }

      // Attach prefetched links to avoid N+1 in Topic.links resolver
      return topics.map((topic) => ({
        ...topic,
        _prefetchedLinks: linksByTopic.get(topic.id) ?? [],
      }))
    },
  },

  Link: {
    topic: async (parent, _args, ctx): Promise<TopicRow | null> => {
      // Use prefetched topic if available (from Query.allLinks)
      const prefetched = (parent as LinkWithTopic)._prefetchedTopic
      if (prefetched !== undefined) return prefetched

      if (!parent.topicId) return null
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', parent.topicId)
        .executeTakeFirst()
      return topic ?? null
    },
  },

  LinkSubmission: {
    createdAt: (parent) => new Date(parent.createdAt),
    updatedAt: (parent) => new Date(parent.updatedAt),
  },

  Topic: {
    issue: async (parent, _args, ctx) => {
      if (!parent.issueId) return null
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', parent.issueId)
        .executeTakeFirst()
      return issue ?? null
    },
    links: async (parent, _args, ctx): Promise<LinkRow[]> => {
      // Use prefetched links if available (from Issue.topics resolver)
      const prefetched = (parent as TopicWithLinks)._prefetchedLinks
      if (prefetched) return prefetched

      // Fallback to individual query if not prefetched
      return ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('topicId', '=', parent.id)
        .execute()
    },
  },
}
