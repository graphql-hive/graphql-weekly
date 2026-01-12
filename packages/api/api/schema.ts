import { DateTimeResolver } from 'graphql-scalars'
import axios from 'axios'
import { builder } from './builder'
import { Context } from './context'
import { GraphQLError } from 'graphql'
import { join } from 'path'
import { db } from './db'

export type User = {
  sub: string
}

const verifyAuth = (user: User) => {
  if (!user) {
    throw new GraphQLError('Not authorized')
  }
  return
}

interface EmailPayload {
  data: {
    Issue: {
      updatedFields: string[]
      node: Issue
    }
  }
}

interface Issue {
  id: string
  title: string
  published: boolean
  versionCount: number
  topics: Topic[]
  isFoundationEdition: boolean
}

interface Topic {
  title: string
  links: Link[]
}

interface Link {
  url: string
  title: string
  text: string
}

builder.prismaObject('Author', {
  fields: (t) => ({
    id: t.exposeString('id', {
      nullable: true,
    }),
    avatarUrl: t.exposeString('avatarUrl', {
      nullable: true,
    }),
    name: t.exposeString('name', {
      nullable: true,
    }),
    description: t.exposeString('description', {
      nullable: true,
    }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: true,
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: true,
    }),
    issues: t.relation('issues', {
      nullable: true,
    }),
  }),
})

const Link = builder.prismaObject('Link', {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: true }),
    position: t.exposeInt('position', {
      nullable: true,
    }),
    text: t.exposeString('text', {
      nullable: true,
    }),
    title: t.exposeString('title', {
      nullable: true,
    }),
    topicId: t.exposeString('topicId', {
      nullable: true,
    }),
    url: t.exposeString('url', {
      nullable: true,
    }),
    topic: t.relation('topic', { nullable: true }),
  }),
})

const Topic = builder.prismaObject('Topic', {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: true }),
    issueId: t.exposeString('issueId', {
      nullable: true,
    }),
    issue_comment: t.exposeString('issue_comment', { nullable: true }),
    position: t.exposeInt('position', {
      nullable: true,
    }),

    title: t.exposeString('title', { nullable: true }),

    issue: t.relation('issue', {
      nullable: true,
    }),
    links: t.relation('links', { nullable: true }),
  }),
})

const Issue = builder.prismaObject('Issue', {
  fields: (t) => ({
    authorId: t.exposeString('authorId', {
      nullable: true,
    }),
    comment: t.exposeString('comment', {
      nullable: true,
    }),

    id: t.exposeString('id', { nullable: true }),
    description: t.exposeString('description', {
      nullable: true,
    }),

    number: t.exposeInt('number', { nullable: true }),

    previewImage: t.exposeString('previewImage', {
      nullable: true,
    }),

    published: t.expose('published', {
      type: 'Boolean',
      nullable: true,
    }),

    specialPerk: t.exposeString('specialPerk', {
      nullable: true,
    }),

    title: t.exposeString('title', { nullable: true }),

    date: t.expose('date', {
      type: 'DateTime',
      nullable: true,
    }),

    versionCount: t.expose('versionCount', {
      type: 'Int',
      nullable: true,
    }),
    topics: t.relation('topics', {
      nullable: true,
    }),
    author: t.relation('author', { nullable: true }),
  }),
})

const LinkSubmission = builder.prismaObject('LinkSubmission', {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: true,
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: true,
    }),
    url: t.exposeString('url', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    title: t.exposeString('title', { nullable: true }),
  }),
})

const Subscriber = builder.prismaObject('Subscriber', {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
  }),
})

const User = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeString('id', { nullable: true }),
    roles: t.exposeString('roles', {
      nullable: true,
    }),
  }),
})

const Query = builder.queryType({
  fields: (t) => ({
    allSubscribers: t.prismaField({
      nullable: true,
      type: ['Subscriber'],
      authScopes: { loggedIn: true },
      resolve: (query) => {
        return db.subscriber.findMany({
          ...query,
        })
      },
    }),

    allIssues: t.prismaField({
      nullable: true,
      type: ['Issue'],

      resolve: (query) => {
        return db.issue.findMany({
          ...query,
        })
      },
    }),

    allAuthors: t.prismaField({
      nullable: true,
      type: ['Author'],
      authScopes: { loggedIn: true },
      resolve: (query) => {
        return db.author.findMany({
          ...query,
        })
      },
    }),

    allTopics: t.prismaField({
      nullable: true,
      type: ['Topic'],

      resolve: (query) => {
        return db.topic.findMany({
          ...query,
        })
      },
    }),

    allLinks: t.prismaField({
      nullable: true,
      type: ['Link'],
      authScopes: { loggedIn: true },
      resolve: (query) => {
        return db.link.findMany({ ...query })
      },
    }),

    allLinkSubmissions: t.prismaField({
      nullable: true,
      type: ['LinkSubmission'],
      authScopes: { loggedIn: true },
      resolve: (query) => {
        return db.linkSubmission.findMany({
          ...query,
          orderBy: {
            createdAt: 'desc',
          },
        })
      },
    }),

    issue: t.prismaField({
      type: 'Issue',
      nullable: true,
      authScopes: { loggedIn: true },
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (query, _, args) => {
        return db.issue.findFirst({ ...query, where: { id: args.id } })
      },
    }),
  }),
})

const Mutation = builder.mutationType({
  fields: (t) => ({
    createSubscriber: t.prismaField({
      nullable: true,
      type: 'Subscriber',
      args: {
        name: t.arg.string({ required: true }),
        email: t.arg.string({ required: true }),
      },
      resolve: async (query, _, { name, email }) => {
        const url =
          'https://us13.api.mailchimp.com/3.0/lists/b07e0b3012/members'
        const authString = Buffer.from(
          `anystring:MAILCHIMP_API_KEY_REDACTED`,
        ).toString('base64')

        // Add to mailchimp
        try {
          await axios.post(
            url,
            {
              status: 'subscribed',
              email_address: email,
              merge_fields: {
                'First Name': name,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${authString}`,
              },
            },
          )
        } catch (error) {
          console.error('Failed to add user to the mailchimp list')
          console.error(
            (error as { response?: { data?: unknown } })?.response?.data,
          )
        }

        return db.subscriber.create({
          ...query,
          data: {
            name,
            email,
          },
        })
      },
    }),

    createLink: t.prismaField({
      type: 'Link',
      nullable: true,
      args: {
        url: t.arg.string({ required: true }),
      },
      resolve: (query, _, { url }) => {
        return db.link.create({
          ...query,
          data: {
            url,
          },
        })
      },
    }),

    createIssue: t.prismaField({
      type: 'Issue',
      nullable: true,
      args: {
        title: t.arg.string({ required: true }),
        number: t.arg.int({ required: true }),
        published: t.arg.boolean({ required: true }),
        date: t.arg({ type: 'DateTime' }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { title, number, published, date }) => {
        return db.issue.create({
          data: {
            date: date ?? new Date(),
            published,
            title,
            number,
          },
        })
      },
    }),

    createTopic: t.prismaField({
      type: 'Topic',
      nullable: true,
      args: {
        title: t.arg.string({ required: true }),
        issue_comment: t.arg.string({ required: true }),
        issueId: t.arg.string({ required: true }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { issue_comment, title, issueId }) => {
        return db.topic.create({
          ...query,
          data: {
            issue: {
              connect: { id: issueId },
            },
            title,
            issue_comment,
          },
        })
      },
    }),

    createSubmissionLink: t.prismaField({
      type: 'LinkSubmission',
      nullable: true,
      args: {
        name: t.arg.string({ required: true }),
        email: t.arg.string({ required: true }),
        description: t.arg.string({ required: true }),
        title: t.arg.string({ required: true }),
        url: t.arg.string({ required: true }),
      },
      resolve: (query, _, { name, email, description, title, url }) => {
        return db.linkSubmission.create({
          ...query,
          data: {
            name,
            email,
            description,
            title,
            url,
          },
        })
      },
    }),

    updateLink: t.prismaField({
      type: 'Link',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
        title: t.arg.string({ required: true }),
        text: t.arg.string(),
        url: t.arg.string(),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { id, title, text, url }) => {
        return db.link.update({
          ...query,
          where: { id: id },
          data: {
            title,
            text: text ?? undefined,
            url: url ?? undefined,
          },
        })
      },
    }),

    deleteLink: t.prismaField({
      type: 'Link',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { id }) => {
        const [, res] = [
          db.topic.delete({
            // @ts-ignore
            where: { issueId: id },
          }),
          db.link.delete({
            ...query,
            where: { id: id },
          }),
        ]
        return res
      },
    }),

    updateIssue: t.prismaField({
      type: 'Issue',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
        published: t.arg.boolean(),
        versionCount: t.arg.int(),
        previewImage: t.arg.string(),
      },
      authScopes: { loggedIn: true },
      resolve: async (
        query,
        _,
        { id, published, versionCount, previewImage },
        ctx: Context,
      ) => {
        const issue = await db.issue.update({
          ...query,
          where: { id: id },
          data: {
            versionCount: versionCount ?? undefined,
            published: published ?? undefined,
            previewImage: previewImage ?? undefined,
          },
        })
        // trigger build if published
        if (published) {
          await axios.post(
            'https://api.netlify.com/build_hooks/NETLIFY_BUILD_HOOK_REDACTED',
          )
        }

        return issue
      },
    }),

    publishEmailDraft: t.prismaField({
      type: 'Issue',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
        versionCount: t.arg.int(),
        isFoundation: t.arg.boolean(),
      },
      authScopes: { loggedIn: true },
      resolve: async (query, _, { id, versionCount, isFoundation }) => {
        try {
          const issue = await db.issue.update({
            include: {
              topics: {
                include: {
                  links: true,
                },
              },
            },
            where: { id: id },
            data: {
              versionCount: versionCount ?? undefined,
            },
          })

          const emailPayload: EmailPayload = {
            data: {
              Issue: {
                updatedFields: ['versionCount'],
                node: {
                  id: issue.id,
                  title: issue.title,
                  published: issue.published,
                  versionCount: issue.versionCount,
                  topics: issue.topics.map((topic) => ({
                    title: topic.title,
                    links: topic.links.map((link) => ({
                      url: link.url,
                      title: link.title ?? '',
                      text: link.text ?? '',
                    })),
                  })),
                  isFoundationEdition: isFoundation ?? false,
                },
              },
            },
          }

          const mailchimpLink = 'https://graphql-weekly-email.netlify.app/'
          // const mailchimpLink = 'http://localhost:55303/'

          await axios.post(mailchimpLink, emailPayload)

          return issue
        } catch (err) {
          console.log('err', err)

          if (typeof err === 'string') {
            throw new Error(err)
          }

          throw err
        }
      },
    }),

    deleteIssue: t.prismaField({
      type: 'Issue',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { id }) => {
        return db.issue.delete({
          ...query,
          where: { id: id },
        })
      },
    }),

    updateTopic: t.prismaField({
      type: 'Topic',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
        position: t.arg.int(),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { id, position }) => {
        return db.topic.update({
          ...query,
          where: { id: id },
          data: {
            position,
          },
        })
      },
    }),

    updateTopicWhenIssueDeleted: t.prismaField({
      type: 'Topic',
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { id }) => {
        return db.topic.update({
          ...query,
          where: { id: id },
          data: {
            issue: { disconnect: true },
          },
        })
      },
    }),

    addLinksToTopic: t.prismaField({
      type: 'Topic',
      nullable: true,
      args: {
        topicId: t.arg.string({ required: true }),
        linkId: t.arg.string({ required: true }),
      },
      authScopes: { loggedIn: true },
      resolve: (query, _, { topicId, linkId }) => {
        return db.topic.update({
          ...query,
          where: { id: topicId },
          data: {
            links: {
              connect: { id: linkId },
            },
          },
        })
      },
    }),
  }),
})

export const schema = builder.toSchema({})
