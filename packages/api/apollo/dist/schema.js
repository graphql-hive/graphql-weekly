"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const nexus_prisma_1 = require("nexus-prisma");
const schema_1 = require("@nexus/schema");
const Author = schema_1.objectType({
    name: 'Author',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('avatarUrl', { type: 'String' });
        t.field('name', { type: 'String' });
        t.field('description', { type: 'String' });
        // t.list.field('issues', {
        //   type: Issue,
        //   resolve(root, args, ctx) {
        //     return ctx.getAuthor(root.id).issues()
        //   },
        // })
        // issues
        // createdAt
        // updatedAt
    },
});
const Topic = schema_1.objectType({
    name: 'Topic',
    definition(t) {
        t.field('id', { type: 'String' });
    },
});
const Issue = schema_1.objectType({
    name: 'Issue',
    definition(t) {
        t.field('authorId', { type: 'String', nullable: true });
        t.field('comment', { type: 'String', nullable: true });
        t.field('id', { type: 'String' });
        t.field('description', { type: 'String', nullable: true });
        t.field('number', { type: 'Int' });
        t.field('previewImage', { type: 'String', nullable: true });
        t.field('published', { type: 'Boolean' });
        t.field('specialPerk', { type: 'String', nullable: true });
        t.field('title', { type: 'String' });
        t.field('versionCount', { type: 'Int' });
        // t.list.field('topics', {
        //   type: Topic,
        //   resolve(root, args, ctx) {
        //     return ctx.getUser(root.id).topics()
        //   },
        // })
        // t.list.field('topics', {type: "Topic", nullable: true})
        t.list.field('topics', {
            type: Topic,
            nullable: true,
            resolve: (parent, args, ctx) => ctx.prisma.issue
                .findOne({
                where: { id: parent.id },
            })
                .topics(),
        });
        //Author
    },
});
// const User = objectType({
//   name: 'User',
//   definition(t) {
//     t.model.id()
//     t.model.roles()
//   },
// })
const Subscriber = schema_1.objectType({
    name: 'Subscriber',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('email', { type: 'String' });
        t.field('name', { type: 'String' });
    },
});
// const Post = objectType({
//   name: 'Post',
//   definition(t) {
//     t.model.id()
//     t.model.title()
//     t.model.content()
//     t.model.published()
//     t.model.author()
//     t.model.authorId()
//   },
// })
const Query = schema_1.objectType({
    name: 'Query',
    definition(t) {
        // t.list.field('users', {
        //   type: 'User',
        //   resolve: (_, args, ctx) => {
        //     return ctx.prisma.user.findMany()
        //   },
        // })
        t.field('topic', {
            type: 'Topic',
            args: {
                topicId: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, args, ctx) => {
                return ctx.prisma.topic.findOne({
                    where: { id: args.topicId },
                });
            },
        });
        t.list.field('subscribers', {
            type: 'Subscriber',
            resolve: (_, args, ctx) => {
                return ctx.prisma.subscriber.findMany();
            },
        });
        t.list.field('issues', {
            type: 'Issue',
            resolve: (_, args, ctx) => {
                return ctx.prisma.issue.findMany();
            },
        });
        t.list.field('authors', {
            type: 'Author',
            resolve: (_, args, ctx) => {
                return ctx.prisma.author.findMany();
            },
        });
        t.list.field('topics', {
            type: 'Topic',
            resolve: (_, args, ctx) => {
                return ctx.prisma.topic.findMany();
            },
        });
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
});
// const Mutation = objectType({
//   name: 'Mutation',
//   definition(t) {
//     t.crud.createOneUser({ alias: 'signupUser' })
//     t.crud.deleteOnePost()
//     t.field('createDraft', {
//       type: 'Post',
//       args: {
//         title: stringArg({ nullable: false }),
//         content: stringArg(),
//         authorEmail: stringArg(),
//       },
//       resolve: (_, { title, content, authorEmail }, ctx) => {
//         return ctx.prisma.post.create({
//           data: {
//             title,
//             content,
//             published: false,
//             author: {
//               connect: { email: authorEmail },
//             },
//           },
//         })
//       },
//     })
//     t.field('publish', {
//       type: 'Post',
//       nullable: true,
//       args: {
//         id: intArg(),
//       },
//       resolve: (_, { id }, ctx) => {
//         return ctx.prisma.post.update({
//           where: { id: Number(id) },
//           data: { published: true },
//         })
//       },
//     })
//   },
// })
exports.schema = schema_1.makeSchema({
    types: [Query, Subscriber, Author, Topic, Issue],
    // types: [Query, Mutation, Post, User],
    plugins: [
        nexus_prisma_1.nexusPrismaPlugin({
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
});
//# sourceMappingURL=schema.js.map