import { nexusPrismaPlugin } from 'nexus-prisma'
// import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import {
  intArg,
  makeSchema,
  objectType,
  stringArg,
  asNexusMethod,
} from '@nexus/schema'
import { GraphQLDate } from 'graphql-iso-date'

export const GQLDate = asNexusMethod(GraphQLDate, 'date')

const Author = objectType({
  name: 'Author',
  definition(t) {
    t.field('id', { type: 'String' })
    t.field('avatarUrl', { type: 'String' })
    t.field('name', { type: 'String' })
    t.field('description', { type: 'String' })
    t.field('issues', { type: 'String' })
    t.field('createdAt', { type: 'Date' })
    t.field('updatedAt', { type: 'Date' })
    //t.model.issues()
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
    t.field('date', { type: 'Date' })
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
    t.field('createdAt', { type: 'Date' })
    t.field('updatedAt', { type: 'Date' })
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
      resolve: (_, args, ctx) => {
        return ctx.prisma.linkSubmission.findMany()
      },
    })

    // t.list.field('authors', {
    //   type: 'Author',
    //   resolve: (_, args, ctx) => {
    //     return ctx.prisma.author.findMany()
    //   },
    // })

    // t.list.field('issues', {
    //   type: 'Issue',
    //   resolve: (_, args, ctx) => {
    //     return ctx.prisma.issue.findMany()
    //   },
    // })

    // t.list.field('filterPosts', {
    //   type: 'Post',
    //   args: {
    //     searchString: stringArg({ nullable: true }),
    //   },
    //   resolve: (_, { searchString }, ctx) => {
    //     return ctx.prisma.post.findMany({
    //       where: {
    //         OR: [
    //           { title: { contains: searchString } },
    //           { content: { contains: searchString } },
    //         ],
    //       },
    //     })
    //   },
    // })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    // t.crud.createOneUser({ alias: 'signupUser' })
    // t.crud.deleteOnePost()

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
            email
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
            url
          },
        })
      },
    })

    // t.field('publish', {
    //   type: 'Post',
    //   nullable: true,
    //   args: {
    //     id: intArg(),
    //   },
    //   resolve: (_, { id }, ctx) => {
    //     return ctx.prisma.post.update({
    //       where: { id: Number(id) },
    //       data: { published: true },
    //     })
    //   },
    // })
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
    Mutation
  ],
  // types: [Query, Mutation, Post, User],
//   plugins: [
//     nexusSchemaPrisma({
//       experimentalCRUD: true,
//     }),
//   ],
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




// import { nexusPrismaPlugin } from 'nexus-prisma'
// import { intArg, makeSchema, objectType, stringArg } from '@nexus/schema'

// const Author = objectType({
//   name: 'Author',
//   definition(t) {
//     t.field('id', { type: 'String' })
//     t.field('avatarUrl', { type: 'String' })
//     t.field('name', { type: 'String' })
//     t.field('description', { type: 'String' })
//     // t.list.field('issues', {
//     //   type: Issue,
//     //   resolve(root, args, ctx) {
//     //     return ctx.getAuthor(root.id).issues()
//     //   },
//     // })
//     // issues
//     // createdAt
//     // updatedAt
//   },
// })
// const Topic = objectType({
//   name: 'Topic',
//   definition(t) {
//     t.field('id', { type: 'String' })
//   },
// })

// const Issue = objectType({
//   name: 'Issue',
//   definition(t) {
//     t.field('authorId', { type: 'String', nullable: true })
//     t.field('comment', { type: 'String', nullable: true })
//     t.field('id', { type: 'String' })
//     t.field('description', { type: 'String', nullable: true })
//     t.field('number', { type: 'Int' })
//     t.field('previewImage', { type: 'String', nullable: true })
//     t.field('published', { type: 'Boolean' })
//     t.field('specialPerk', { type: 'String', nullable: true })
//     t.field('title', { type: 'String' })
//     t.field('versionCount', { type: 'Int' })
//     // t.list.field('topics', {
//     //   type: Topic,
//     //   resolve(root, args, ctx) {
//     //     return ctx.getUser(root.id).topics()
//     //   },
//     // })
//     // t.list.field('topics', {type: "Topic", nullable: true})
//     t.list.field('topics', {
//       type: Topic,
//       nullable: true,
//       resolve: (parent, args, ctx) =>
//         ctx.prisma.issue
//           .findOne({
//             where: { id: parent.id },
//           })
//           .topics(),
//     })

//     //Author
//   },
// })

// // const User = objectType({
// //   name: 'User',
// //   definition(t) {
// //     t.model.id()
// //     t.model.roles()
// //   },
// // })

// const Subscriber = objectType({
//   name: 'Subscriber',
//   definition(t) {
//     t.field('id', { type: 'String' })
//     t.field('email', { type: 'String' })
//     t.field('name', { type: 'String' })
//   },
// })

// // const Post = objectType({
// //   name: 'Post',
// //   definition(t) {
// //     t.model.id()
// //     t.model.title()
// //     t.model.content()
// //     t.model.published()
// //     t.model.author()
// //     t.model.authorId()
// //   },
// // })

// const Query = objectType({
//   name: 'Query',
//   definition(t) {
//     // t.list.field('users', {
//     //   type: 'User',
//     //   resolve: (_, args, ctx) => {
//     //     return ctx.prisma.user.findMany()
//     //   },
//     // })

//     t.field('topic', {
//       type: 'Topic',
//       args: {
//         topicId: stringArg({ nullable: false }),
//       },
//       resolve: (_, args, ctx) => {
//         return ctx.prisma.topic.findOne({
//           where: { id: args.topicId },
//         })
//       },
//     })

//     t.list.field('subscribers', {
//       type: 'Subscriber',
//       resolve: (_, args, ctx) => {
//         return ctx.prisma.subscriber.findMany()
//       },
//     })

//     t.list.field('issues', {
//       type: 'Issue',
//       resolve: (_, args, ctx) => {
//         return ctx.prisma.issue.findMany()
//       },
//     })

//     t.list.field('authors', {
//       type: 'Author',
//       resolve: (_, args, ctx) => {
//         return ctx.prisma.author.findMany()
//       },
//     })
//     t.list.field('topics', {
//       type: 'Topic',
//       resolve: (_, args, ctx) => {
//         return ctx.prisma.topic.findMany()
//       },
//     })

//     // t.list.field('authors', {
//     //   type: 'Author',
//     //   resolve: (_, args, ctx) => {
//     //     return ctx.prisma.author.findMany()
//     //   },
//     // })

//     // t.list.field('issues', {
//     //   type: 'Issue',
//     //   resolve: (_, args, ctx) => {
//     //     return ctx.prisma.issue.findMany()
//     //   },
//     // })

//     // t.list.field('filterPosts', {
//     //   type: 'Post',
//     //   args: {
//     //     searchString: stringArg({ nullable: true }),
//     //   },
//     //   resolve: (_, { searchString }, ctx) => {
//     //     return ctx.prisma.post.findMany({
//     //       where: {
//     //         OR: [
//     //           { title: { contains: searchString } },
//     //           { content: { contains: searchString } },
//     //         ],
//     //       },
//     //     })
//     //   },
//     // })
//   },
// })

// // const Mutation = objectType({
// //   name: 'Mutation',
// //   definition(t) {
// //     t.crud.createOneUser({ alias: 'signupUser' })
// //     t.crud.deleteOnePost()

// //     t.field('createDraft', {
// //       type: 'Post',
// //       args: {
// //         title: stringArg({ nullable: false }),
// //         content: stringArg(),
// //         authorEmail: stringArg(),
// //       },
// //       resolve: (_, { title, content, authorEmail }, ctx) => {
// //         return ctx.prisma.post.create({
// //           data: {
// //             title,
// //             content,
// //             published: false,
// //             author: {
// //               connect: { email: authorEmail },
// //             },
// //           },
// //         })
// //       },
// //     })

// //     t.field('publish', {
// //       type: 'Post',
// //       nullable: true,
// //       args: {
// //         id: intArg(),
// //       },
// //       resolve: (_, { id }, ctx) => {
// //         return ctx.prisma.post.update({
// //           where: { id: Number(id) },
// //           data: { published: true },
// //         })
// //       },
// //     })
// //   },
// // })

// export const schema = makeSchema({
//   types: [Query, Subscriber, Author, Topic, Issue],
//   // types: [Query, Mutation, Post, User],
//   plugins: [
//     nexusPrismaPlugin({
//       shouldGenerateArtifacts: false,
//     }),
//   ],
//   outputs: {
//     schema: __dirname + '/generated/nexus/schema.graphql',
//     typegen: __dirname + '/generated/nexus/nexus.ts',
//   },
//   typegenAutoConfig: {
//     contextType: 'Context.Context',
//     sources: [
//       {
//         source: '@prisma/client',
//         alias: 'prisma',
//       },
//       {
//         source: require.resolve('./context'),
//         alias: 'Context',
//       },
//     ],
//   },
// })