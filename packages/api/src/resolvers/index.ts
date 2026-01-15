import { GraphQLError } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'

import type { NewsletterTopic } from '../email'
import type { Resolvers } from '../generated/graphql'
import type { GraphQLContext, User } from '../worker'

import { GITHUB_REPO_NAME, GITHUB_REPO_OWNER } from '../auth'
import { createEmailCampaign } from '../services/mailchimp'

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
    },
    createLink: async (_parent, { url }, ctx) => {
      requireCollaborator(ctx)
      const id = generateId()
      const now = new Date().toISOString()
      await ctx.db
        .insertInto('Link')
        .values({
          createdAt: now,
          createdBy: ctx.user.id,
          id,
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
          await createEmailCampaign(
            {
              apiKey: ctx.env.MAILCHIMP_API_KEY,
              serverPrefix: ctx.env.MAILCHIMP_SERVER_PREFIX,
            },
            issue.title,
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
        if (ctx.env.LOCAL_DEV) {
          const [{ render }, { Newsletter }] = await Promise.all([
            import('@react-email/components'),
            import('../email'),
          ])
          const emailHtml = await render(
            Newsletter({
              isFoundationEdition: isFoundation ?? false,
              issueTitle: issue.title,
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
    allAuthors: async (_parent, _args, ctx) => {
      const authors = await ctx.db.selectFrom('Author').selectAll().execute()
      return authors
    },
    allIssues: async (_parent, _args, ctx) => {
      const issues = await ctx.db.selectFrom('Issue').selectAll().execute()
      return issues
    },
    allLinks: async (_parent, _args, ctx) => {
      requireCollaborator(ctx)
      const links = await ctx.db.selectFrom('Link').selectAll().execute()
      return links
    },
    allLinkSubmissions: async (_parent, _args, ctx) => {
      requireCollaborator(ctx)
      const submissions = await ctx.db
        .selectFrom('LinkSubmission')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .execute()
      return submissions
    },
    allSubscribers: async (_parent, _args, ctx) => {
      requireCollaborator(ctx)
      const subscribers = await ctx.db
        .selectFrom('Subscriber')
        .selectAll()
        .execute()
      return subscribers
    },
    allTopics: async (_parent, _args, ctx) => {
      const topics = await ctx.db.selectFrom('Topic').selectAll().execute()
      return topics
    },
    issue: async (_parent, { id }, ctx) => {
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return issue ?? null
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
  },

  // Type resolvers for relationships
  Author: {
    createdAt: (parent) =>
      parent.createdAt ? new Date(parent.createdAt) : null,
    issues: async (parent, _args, ctx) => {
      const issues = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('authorId', '=', parent.id)
        .execute()
      return issues
    },
    updatedAt: (parent) =>
      parent.updatedAt ? new Date(parent.updatedAt) : null,
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
    date: (parent) => (parent.date ? new Date(parent.date) : null),
    published: (parent) => !!parent.published,
    topics: async (parent, _args, ctx) => {
      const topics = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('issueId', '=', parent.id)
        .orderBy('position', 'asc')
        .execute()
      return topics
    },
  },

  Link: {
    topic: async (parent, _args, ctx) => {
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
    createdAt: (parent) =>
      parent.createdAt ? new Date(parent.createdAt) : null,
    updatedAt: (parent) =>
      parent.updatedAt ? new Date(parent.updatedAt) : null,
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
    links: async (parent, _args, ctx) => {
      const links = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('topicId', '=', parent.id)
        .execute()
      return links
    },
  },
}
