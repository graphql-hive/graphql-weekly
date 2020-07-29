"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.GQLDate = void 0;
const nexus_prisma_1 = require("nexus-prisma");
const schema_1 = require("@nexus/schema");
const graphql_iso_date_1 = require("graphql-iso-date");
exports.GQLDate = schema_1.asNexusMethod(graphql_iso_date_1.GraphQLDateTime, 'DateTime');
const Author = schema_1.objectType({
    name: 'Author',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('avatarUrl', { type: 'String' });
        t.field('name', { type: 'String' });
        t.field('description', { type: 'String' });
        t.field('issues', { type: 'String' });
        t.field('createdAt', { type: 'DateTime' });
        t.field('updatedAt', { type: 'DateTime' });
        t.list.field('issues', {
            type: 'Issue',
            resolve: (parent, args, ctx) => ctx.prisma.author
                .findOne({
                where: { id: parent.id },
            })
                .issues(),
        });
    },
});
const Link = schema_1.objectType({
    name: 'Link',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('position', { type: 'Int', nullable: true });
        t.field('text', { type: 'String', nullable: true });
        t.field('title', { type: 'String', nullable: true });
        t.field('topicId', { type: 'String', nullable: true });
        t.field('url', { type: 'String' });
        t.field('topic', {
            type: 'Topic',
            nullable: true,
            resolve: (parent, args, ctx) => ctx.prisma.link
                .findOne({
                where: { id: parent.id },
            })
                .topic(),
        });
    },
});
const Topic = schema_1.objectType({
    name: 'Topic',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('issueId', { type: 'String', nullable: true });
        t.field('issue_comment', { type: 'String' });
        t.field('position', { type: 'Int', nullable: true });
        t.field('title', { type: 'String' });
        t.field('issue', {
            type: 'Issue',
            nullable: true,
            resolve: (parent, args, ctx) => ctx.prisma.topic
                .findOne({
                where: { id: parent.id },
            })
                .issue(),
        });
        t.list.field('links', {
            type: 'Link',
            resolve: (parent, args, ctx) => ctx.prisma.topic
                .findOne({
                where: { id: parent.id },
            })
                .links(),
        });
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
        t.field('date', { type: 'DateTime' });
        t.field('versionCount', { type: 'Int' });
        t.list.field('topics', {
            type: 'Topic',
            resolve: (parent, args, ctx) => ctx.prisma.issue
                .findOne({
                where: { id: parent.id },
            })
                .topics(),
        });
        t.field('author', {
            type: 'Author',
            nullable: true,
            resolve: (parent, args, ctx) => ctx.prisma.issue
                .findOne({
                where: { id: parent.id },
            })
                .author(),
        });
    },
});
const LinkSubmission = schema_1.objectType({
    name: 'LinkSubmission',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('email', { type: 'String' });
        t.field('name', { type: 'String' });
        t.field('createdAt', { type: 'DateTime' });
        t.field('updatedAt', { type: 'DateTime' });
        t.field('url', { type: 'String' });
        t.field('description', { type: 'String' });
        t.field('title', { type: 'String' });
    },
});
const Subscriber = schema_1.objectType({
    name: 'Subscriber',
    definition(t) {
        t.field('id', { type: 'String' });
        t.field('email', { type: 'String' });
        t.field('name', { type: 'String' });
    },
});
const User = schema_1.objectType({
    name: 'User',
    definition(t) {
        t.field('id', { type: 'String' });
        t.list.field('roles', {
            type: 'String',
            resolve: (parent, args, ctx) => ctx.prisma.user
                .findOne({
                where: { id: parent.id },
            })
                .roles(),
        });
    },
});
const Query = schema_1.objectType({
    name: 'Query',
    definition(t) {
        t.list.field('allSubscribers', {
            type: 'Subscriber',
            resolve: (_, args, ctx) => {
                return ctx.prisma.subscriber.findMany();
            },
        });
        t.list.field('allIssues', {
            type: 'Issue',
            resolve: (_, args, ctx) => {
                return ctx.prisma.issue.findMany();
            },
        });
        t.list.field('allAuthors', {
            type: 'Author',
            resolve: (_, args, ctx) => {
                return ctx.prisma.author.findMany();
            },
        });
        t.list.field('allTopics', {
            type: 'Topic',
            resolve: (_, args, ctx) => {
                return ctx.prisma.topic.findMany();
            },
        });
        t.list.field('allLinks', {
            type: 'Link',
            resolve: (_, args, ctx) => {
                return ctx.prisma.link.findMany();
            },
        });
        t.list.field('allLinkSubmissions', {
            type: 'LinkSubmission',
            resolve: (_, args, ctx) => {
                return ctx.prisma.linkSubmission.findMany();
            },
        });
        t.field('issue', {
            type: 'Issue',
            args: {
                id: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, args, ctx) => {
                return ctx.prisma.issue.findOne({ where: { id: args.id } });
            },
        });
    },
});
const Mutation = schema_1.objectType({
    name: 'Mutation',
    definition(t) {
        t.field('createSubscriber', {
            type: 'Subscriber',
            args: {
                name: schema_1.stringArg({ nullable: false }),
                email: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { name, email }, ctx) => {
                return ctx.prisma.subscriber.create({
                    data: {
                        name,
                        email,
                    },
                });
            },
        });
        t.field('createLink', {
            type: 'Link',
            args: {
                url: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { url }, ctx) => {
                return ctx.prisma.link.create({
                    data: {
                        url,
                    },
                });
            },
        });
        t.field('createIssue', {
            type: 'Issue',
            args: {
                title: schema_1.stringArg({ nullable: false }),
                number: schema_1.intArg({ nullable: false }),
                date: schema_1.arg({ type: 'DateTime' }),
                published: schema_1.booleanArg({ nullable: false }),
            },
            resolve: (_, { title, number, published, date }, ctx) => {
                return ctx.prisma.issue.create({
                    data: {
                        date,
                        published,
                        title,
                        number,
                    },
                });
            },
        });
        t.field('createTopic', {
            type: 'Topic',
            args: {
                issue_comment: schema_1.stringArg({ nullable: false }),
                title: schema_1.stringArg({ nullable: false }),
                issueId: schema_1.stringArg({ nullable: false }),
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
                });
            },
        });
        t.field('createSubmissionLink', {
            type: 'LinkSubmission',
            args: {
                name: schema_1.stringArg({ nullable: false }),
                email: schema_1.stringArg({ nullable: false }),
                description: schema_1.stringArg({ nullable: false }),
                title: schema_1.stringArg({ nullable: false }),
                url: schema_1.stringArg({ nullable: false }),
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
                });
            },
        });
        t.field('updateLink', {
            type: 'Link',
            args: {
                id: schema_1.stringArg({ nullable: false }),
                title: schema_1.stringArg({ nullable: false }),
                text: schema_1.stringArg(),
                url: schema_1.stringArg(),
            },
            resolve: (_, { id, title, text, url }, ctx) => {
                return ctx.prisma.link.update({
                    where: { id: id },
                    data: {
                        title,
                        text,
                        url,
                    },
                });
            },
        });
        t.field('deleteLink', {
            type: 'Link',
            args: {
                id: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { id }, ctx) => {
                return ctx.prisma.link.delete({
                    where: { id: id },
                    data: {
                        topic: {
                            disconnect: true
                        }
                    }
                });
            },
        });
        t.field('updateIssue', {
            type: 'Issue',
            args: {
                id: schema_1.stringArg({ nullable: false }),
                published: schema_1.booleanArg(),
                versionCount: schema_1.intArg(),
                previewImage: schema_1.stringArg(),
            },
            resolve: (_, { id, published, versionCount, previewImage }, ctx) => {
                return ctx.prisma.issue.update({
                    where: { id: id },
                    data: {
                        versionCount,
                        published,
                        previewImage,
                    },
                });
            },
        });
        t.field('deleteIssue', {
            type: 'Issue',
            args: {
                id: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { id }, ctx) => {
                return ctx.prisma.issue.delete({
                    where: { id: id }
                });
            },
        });
        t.field('updateTopic', {
            type: 'Topic',
            args: {
                id: schema_1.stringArg({ nullable: false }),
                position: schema_1.intArg(),
            },
            resolve: (_, { id, position }, ctx) => {
                return ctx.prisma.topic.update({
                    where: { id: id },
                    data: {
                        position,
                    },
                });
            },
        });
        t.field('updateTopicWhenIssueDeleted', {
            type: 'Topic',
            args: {
                id: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { id }, ctx) => {
                return ctx.prisma.topic.update({
                    where: { id: id },
                    data: {
                        issue: null
                    },
                });
            },
        });
        t.field('addLinksToTopic', {
            type: 'Topic',
            args: {
                topicId: schema_1.stringArg({ nullable: false }),
                linkId: schema_1.stringArg({ nullable: false }),
            },
            resolve: (_, { topicId, linkId }, ctx) => {
                return ctx.prisma.topic.update({
                    where: { id: topicId },
                    data: {
                        links: {
                            connect: { id: linkId },
                        },
                    },
                });
            },
        });
    },
});
exports.schema = schema_1.makeSchema({
    types: [
        Query,
        Subscriber,
        Author,
        Link,
        Topic,
        Issue,
        LinkSubmission,
        User,
        exports.GQLDate,
        Mutation,
    ],
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