import type { Resolvers } from '../generated/graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { createEmailCampaign } from '../services/mailchimp'
import type { NewsletterTopic } from '../email'

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 25)
}

export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    allIssues: async (_parent, _args, ctx) => {
      const issues = await ctx.db.selectFrom('Issue').selectAll().execute()
      return issues
    },
    allTopics: async (_parent, _args, ctx) => {
      const topics = await ctx.db.selectFrom('Topic').selectAll().execute()
      return topics
    },
    allAuthors: async (_parent, _args, ctx) => {
      const authors = await ctx.db.selectFrom('Author').selectAll().execute()
      return authors
    },
    allLinks: async (_parent, _args, ctx) => {
      const links = await ctx.db.selectFrom('Link').selectAll().execute()
      return links
    },
    allSubscribers: async (_parent, _args, ctx) => {
      const subscribers = await ctx.db
        .selectFrom('Subscriber')
        .selectAll()
        .execute()
      return subscribers
    },
    allLinkSubmissions: async (_parent, _args, ctx) => {
      const submissions = await ctx.db
        .selectFrom('LinkSubmission')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .execute()
      return submissions
    },
    issue: async (_parent, { id }, ctx) => {
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return issue ?? null
    },
  },

  Mutation: {
    createSubscriber: async (_parent, { email, name }, ctx) => {
      const id = generateId()
      await ctx.db
        .insertInto('Subscriber')
        .values({ id, email, name })
        .execute()
      return { id, email, name }
    },
    createLink: async (_parent, { url }, ctx) => {
      const id = generateId()
      await ctx.db.insertInto('Link').values({ id, url }).execute()
      const link = await ctx.db
        .selectFrom('Link')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return link ?? null
    },
    createIssue: async (_parent, { title, number, published, date }, ctx) => {
      const id = generateId()
      const dateStr = date ? date.toISOString() : new Date().toISOString()
      await ctx.db
        .insertInto('Issue')
        .values({
          id,
          title,
          number,
          published: published ? 1 : 0,
          date: dateStr,
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
    createTopic: async (_parent, { title, issue_comment, issueId }, ctx) => {
      const id = generateId()
      await ctx.db
        .insertInto('Topic')
        .values({ id, title, issue_comment, issueId })
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return topic ?? null
    },
    createSubmissionLink: async (
      _parent,
      { name, email, description, title, url },
      ctx,
    ) => {
      const id = generateId()
      const now = new Date().toISOString()
      await ctx.db
        .insertInto('LinkSubmission')
        .values({
          id,
          name,
          email,
          description,
          title,
          url,
          createdAt: now,
          updatedAt: now,
        })
        .execute()
      const submission = await ctx.db
        .selectFrom('LinkSubmission')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return submission ?? null
    },
    updateLink: async (_parent, { id, title, text, url }, ctx) => {
      await ctx.db
        .updateTable('Link')
        .set({
          title,
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
    updateIssue: async (
      _parent,
      { id, published, versionCount, previewImage },
      ctx,
    ) => {
      const updates: Record<string, unknown> = {}
      if (published !== null && published !== undefined)
        updates.published = published ? 1 : 0
      if (versionCount !== null && versionCount !== undefined)
        updates.versionCount = versionCount
      if (previewImage !== null && previewImage !== undefined)
        updates.previewImage = previewImage

      if (Object.keys(updates).length > 0) {
        await ctx.db
          .updateTable('Issue')
          .set(updates)
          .where('id', '=', id)
          .execute()
      }
      const issue = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return issue ?? null
    },
    updateTopic: async (_parent, { id, position }, ctx) => {
      if (position !== null && position !== undefined) {
        await ctx.db
          .updateTable('Topic')
          .set({ position })
          .where('id', '=', id)
          .execute()
      }
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
      return topic ?? null
    },
    updateTopicWhenIssueDeleted: async (_parent, { id }, ctx) => {
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
    addLinksToTopic: async (_parent, { topicId, linkId }, ctx) => {
      await ctx.db
        .updateTable('Link')
        .set({ topicId })
        .where('id', '=', linkId)
        .execute()
      const topic = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('id', '=', topicId)
        .executeTakeFirst()
      return topic ?? null
    },
    deleteLink: async (_parent, { id }, ctx) => {
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
    deleteIssue: async (_parent, { id }, ctx) => {
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
    publishEmailDraft: async (
      _parent,
      { id, versionCount, isFoundation },
      ctx,
    ) => {
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
            title: topic.title,
            links: links.map((link) => ({
              url: link.url,
              title: link.title ?? '',
              text: link.text ?? '',
            })),
          }
        }),
      )

      // Create Mailchimp campaign if API key is configured
      if (ctx.env.MAILCHIMP_API_KEY && issue.published) {
        try {
          await createEmailCampaign(
            { apiKey: ctx.env.MAILCHIMP_API_KEY },
            issue.title,
            topicsWithLinks,
            issue.versionCount,
            isFoundation ?? false,
          )
        } catch (error) {
          console.error('Failed to create Mailchimp campaign:', error)
        }
      }

      return issue
    },
  },

  // Type resolvers for relationships
  Author: {
    issues: async (parent, _args, ctx) => {
      const issues = await ctx.db
        .selectFrom('Issue')
        .selectAll()
        .where('authorId', '=', parent.id)
        .execute()
      return issues
    },
    createdAt: (parent) =>
      parent.createdAt ? new Date(parent.createdAt) : null,
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
    topics: async (parent, _args, ctx) => {
      const topics = await ctx.db
        .selectFrom('Topic')
        .selectAll()
        .where('issueId', '=', parent.id)
        .execute()
      return topics
    },
    published: (parent) => Boolean(parent.published),
    date: (parent) => (parent.date ? new Date(parent.date) : null),
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
}
