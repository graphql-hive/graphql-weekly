import { nexusPrismaPlugin } from 'nexus-prisma'
import {
  intArg,
  makeSchema,
  objectType,
  stringArg,
  asNexusMethod,
  booleanArg,
  arg,
} from '@nexus/schema'
import { GraphQLDateTime } from 'graphql-iso-date'
import axios from 'axios'
import { Context } from './context'

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

export const GQLDate = asNexusMethod(GraphQLDateTime, 'DateTime')

const Author = objectType({
  name: 'Author',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('avatarUrl', { type: 'String' })
    t.field('name', { type: 'String' })
    t.field('description', { type: 'String' })
    t.field('issues', { type: 'String' })
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
    t.list.field('issues', {
      type: 'Issue',
      resolve: (parent, args, ctx) =>
        ctx.prisma.author
          .findOne({
            where: { id: parent.id },
          })
          .issues(),
    })
  },
})

const Link = objectType({
  name: 'Link',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('position', { type: 'Int', nullable: true })
    t.field('text', { type: 'String', nullable: true })
    t.field('title', { type: 'String', nullable: true })
    t.field('topicId', { type: 'String', nullable: true })
    t.field('url', { type: 'String' })
    t.field('topic', {
      type: 'Topic',
      nullable: true,
      resolve: (parent, args, ctx) =>
        ctx.prisma.link
          .findOne({
            where: { id: parent.id },
          })
          .topic(),
    })
  },
})

const Topic = objectType({
  name: 'Topic',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('issueId', { type: 'String', nullable: true })
    t.field('issue_comment', { type: 'String' })
    t.field('position', { type: 'Int', nullable: true })
    t.field('title', { type: 'String' })
    t.field('issue', {
      type: 'Issue',
      nullable: true,
      resolve: (parent, args, ctx) =>
        ctx.prisma.topic
          .findOne({
            where: { id: parent.id },
          })
          .issue(),
    })
    t.list.field('links', {
      type: 'Link',
      resolve: (parent, args, ctx) =>
        ctx.prisma.topic
          .findOne({
            where: { id: parent.id },
          })
          .links(),
    })
  },
})

const Issue = objectType({
  name: 'Issue',
  definition(t) {
    t.field('authorId', { type: 'String', nullable: true })
    t.field('comment', { type: 'String', nullable: true })
    t.field('id', { type: 'String' })
    t.field('description', { type: 'String', nullable: true })
    t.field('number', { type: 'Int' })
    t.field('previewImage', { type: 'String', nullable: true })
    t.field('published', { type: 'Boolean' })
    t.field('specialPerk', { type: 'String', nullable: true })
    t.field('title', { type: 'String' })
    t.field('date', { type: 'DateTime' })
    t.field('versionCount', { type: 'Int' })
    t.list.field('topics', {
      type: 'Topic',
      resolve: (parent, args, ctx) =>
        ctx.prisma.issue
          .findOne({
            where: { id: parent.id },
          })
          .topics(),
    })
    t.field('author', {
      type: 'Author',
      nullable: true,
      resolve: (parent, args, ctx) =>
        ctx.prisma.issue
          .findOne({
            where: { id: parent.id },
          })
          .author(),
    })
  },
})

const LinkSubmission = objectType({
  name: 'LinkSubmission',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('email', { type: 'String' })
    t.field('name', { type: 'String' })
    t.field('createdAt', { type: 'DateTime' })
    t.field('updatedAt', { type: 'DateTime' })
    t.field('url', { type: 'String' })
    t.field('description', { type: 'String' })
    t.field('title', { type: 'String' })
  },
})

const Subscriber = objectType({
  name: 'Subscriber',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('email', { type: 'String' })
    t.field('name', { type: 'String' })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.field('id', { type: 'String' })
    t.list.field('roles', {
      type: 'String',
      resolve: (parent, args, ctx) =>
        ctx.prisma.user
          .findOne({
            where: { id: parent.id },
          })
          .roles(),
    })
  },
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.list.field('allSubscribers', {
      type: 'Subscriber',
      resolve: (_, args, ctx) => {
        return ctx.prisma.subscriber.findMany()
      },
    })

    t.list.field('allIssues', {
      type: 'Issue',
      resolve: (_, args, ctx) => {
        return ctx.prisma.issue.findMany()
      },
    })

    t.list.field('allAuthors', {
      type: 'Author',
      resolve: (_, args, ctx) => {
        return ctx.prisma.author.findMany()
      },
    })
    t.list.field('allTopics', {
      type: 'Topic',
      resolve: (_, args, ctx) => {
        return ctx.prisma.topic.findMany()
      },
    })
    t.list.field('allLinks', {
      type: 'Link',
      resolve: (_, args, ctx) => {
        return ctx.prisma.link.findMany()
      },
    })
    t.list.field('allLinkSubmissions', {
      type: 'LinkSubmission',
      resolve: (_, args, ctx: Context) => {
        return ctx.prisma.linkSubmission.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        })
      },
    })

    t.field('issue', {
      type: 'Issue',
      args: {
        id: stringArg({ nullable: false }),
      },
      resolve: (_, args, ctx) => {
        return ctx.prisma.issue.findOne({ where: { id: args.id } })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('createSubscriber', {
      type: 'Subscriber',
      args: {
        name: stringArg({ nullable: false }),
        email: stringArg({ nullable: false }),
      },
      resolve: (_, { name, email }, ctx) => {
        return ctx.prisma.subscriber.create({
          data: {
            name,
            email,
          },
        })
      },
    })

    t.field('createLink', {
      type: 'Link',
      args: {
        url: stringArg({ nullable: false }),
      },
      resolve: (_, { url }, ctx) => {
        return ctx.prisma.link.create({
          data: {
            url,
          },
        })
      },
    })

    t.field('createIssue', {
      type: 'Issue',
      args: {
        title: stringArg({ nullable: false }),
        number: intArg({ nullable: false }),
        date: arg({ type: 'DateTime' }),
        published: booleanArg({ nullable: false }),
      },
      resolve: (_, { title, number, published, date }, ctx) => {
        return ctx.prisma.issue.create({
          data: {
            date,
            published,
            title,
            number,
          },
        })
      },
    })

    t.field('createTopic', {
      type: 'Topic',
      args: {
        issue_comment: stringArg({ nullable: false }),
        title: stringArg({ nullable: false }),
        issueId: stringArg({ nullable: false }),
      },
      resolve: (_, { issue_comment, title, issueId }, ctx) => {
        return ctx.prisma.topic.create({
          data: {
            issue: {
              connect: { id: issueId },
            },
            title,
            issue_comment,
          },
        })
      },
    })

    t.field('createSubmissionLink', {
      type: 'LinkSubmission',
      args: {
        name: stringArg({ nullable: false }),
        email: stringArg({ nullable: false }),
        description: stringArg({ nullable: false }),
        title: stringArg({ nullable: false }),
        url: stringArg({ nullable: false }),
      },
      resolve: (_, { name, email, description, title, url }, ctx) => {
        return ctx.prisma.linkSubmission.create({
          data: {
            name,
            email,
            description,
            title,
            url,
          },
        })
      },
    })

    t.field('updateLink', {
      type: 'Link',
      args: {
        id: stringArg({ nullable: false }),
        title: stringArg({ nullable: false }),
        text: stringArg(),
        url: stringArg(),
      },
      resolve: (_, { id, title, text, url }, ctx) => {
        return ctx.prisma.link.update({
          where: { id: id },
          data: {
            title,
            text,
            url,
          },
        })
      },
    })

    t.field('deleteLink', {
      type: 'Link',
      args: {
        id: stringArg({ nullable: false }),
      },
      resolve: (_, { id }, ctx) => {
        return ctx.prisma.link.delete({
          where: { id: id },
          data: {
            topic: {
              disconnect: true,
            },
          },
        })
      },
    })

    t.field('updateIssue', {
      type: 'Issue',
      args: {
        id: stringArg({ nullable: false }),
        published: booleanArg(),
        versionCount: intArg(),
        previewImage: stringArg(),
      },
      resolve: (_, { id, published, versionCount, previewImage }, ctx) => {
        return ctx.prisma.issue.update({
          where: { id: id },
          data: {
            versionCount,
            published,
            previewImage,
          },
        })
      },
    })

    t.field('publishEmailDraft', {
      type: 'Issue',
      args: {
        id: stringArg({ nullable: false }),
        versionCount: intArg(),
      },
      resolve: async (_, { id, versionCount }, ctx) => {
        try {
          await ctx.prisma.issue.update({
            where: { id: id },
            data: {
              versionCount,
            },
          })

          const issue = await ctx.prisma.issue.findOne({
            where: { id: id },
            include: {
              topics: {
                include: {
                  links: true,
                },
              },
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
                  topics: issue.topics.map((topic: Topic) => ({
                    title: topic.title,
                    links: topic.links.map((link: Link) => ({
                      url: link.url,
                      title: link.title,
                      text: link.text,
                    })),
                  })),
                },
              },
            },
          }

          const mailchimpLink =
            'https://r11tuy1wm6.execute-api.eu-west-1.amazonaws.com/dev/newsletter-sender'

          await axios.post(mailchimpLink, emailPayload)

          return issue
        } catch (err) {
          throw new Error(err)
        }
      },
    })

    t.field('deleteIssue', {
      type: 'Issue',
      args: {
        id: stringArg({ nullable: false }),
      },
      resolve: (_, { id }, ctx) => {
        return ctx.prisma.issue.delete({
          where: { id: id },
        })
      },
    })

    t.field('updateTopic', {
      type: 'Topic',
      args: {
        id: stringArg({ nullable: false }),
        position: intArg(),
      },
      resolve: (_, { id, position }, ctx) => {
        return ctx.prisma.topic.update({
          where: { id: id },
          data: {
            position,
          },
        })
      },
    })

    t.field('updateTopicWhenIssueDeleted', {
      type: 'Topic',
      args: {
        id: stringArg({ nullable: false }),
      },
      resolve: (_, { id }, ctx) => {
        return ctx.prisma.topic.update({
          where: { id: id },
          data: {
            issue: { disconnect: true },
          },
        })
      },
    })

    t.field('addLinksToTopic', {
      type: 'Topic',
      args: {
        topicId: stringArg({ nullable: false }),
        linkId: stringArg({ nullable: false }),
      },
      resolve: (_, { topicId, linkId }, ctx) => {
        return ctx.prisma.topic.update({
          where: { id: topicId },
          data: {
            links: {
              connect: { id: linkId },
            },
          },
        })
      },
    })
  },
})

export const schema = makeSchema({
  types: [
    Query,
    Subscriber,
    Author,
    Link,
    Topic,
    Issue,
    LinkSubmission,
    User,
    GQLDate,
    Mutation,
  ],
  plugins: [
    nexusPrismaPlugin({
      shouldGenerateArtifacts: false,
    }),
  ],
  outputs: {
    schema: __dirname + '/generated/nexus/schema.graphql',
    typegen: __dirname + '/generated/nexus/nexus.ts',
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('./context'),
        alias: 'Context',
      },
    ],
  },
})
