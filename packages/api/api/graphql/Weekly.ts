import { schema } from 'nexus'

schema.objectType({
    name: 'Author',
    definition(t) {
      t.field('id', { type: 'String' })
      t.field('avatarUrl', { type: 'String' })
      t.field('name', { type: 'String' })
      t.field('description', { type: 'String' })
      t.field('issues', { type: 'String' })
    //   t.field('createdAt', { type: 'Date' })
    //   t.field('updatedAt', { type: 'Date' })
      //t.model.issues()
      t.list.field('issues', {
        type: 'Issue',
        resolve: (parent, args, ctx) =>
          ctx.db.author
            .findOne({
              where: { id: parent.id },
            })
            .issues(),
      })
    },
  })
  
  schema.objectType({
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
          ctx.db.link
            .findOne({
              where: { id: parent.id },
            })
            .topic(),
      })
    },
  })
  
  schema.objectType({
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
          ctx.db.topic
            .findOne({
              where: { id: parent.id },
            })
            .issue(),
      })
      t.list.field('links', {
        type: 'Link',
        resolve: (parent, args, ctx) =>
          ctx.db.topic
            .findOne({
              where: { id: parent.id },
            })
            .links(),
      })
    },
  })
  
  schema.objectType({
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
    //   t.field('date', { type: 'Date' })
      t.field('versionCount', { type: 'Int' })
      t.list.field('topics', {
        type: 'Topic',
        resolve: (parent, args, ctx) =>
          ctx.db.issue
            .findOne({
              where: { id: parent.id },
            })
            .topics(),
      })
      t.field('author', {
        type: 'Author',
        nullable: true,
        resolve: (parent, args, ctx) =>
          ctx.db.issue
            .findOne({
              where: { id: parent.id },
            })
            .author(),
      })
    },
  })
  
  schema.objectType({
    name: 'LinkSubmission',
    definition(t) {
      t.field('id', { type: 'String' })
      t.field('email', { type: 'String' })
      t.field('name', { type: 'String' })
    //   t.field('createdAt', { type: 'Date' })
    //   t.field('updatedAt', { type: 'Date' })
      t.field('url', { type: 'String' })
      t.field('description', { type: 'String' })
      t.field('title', { type: 'String' })
    },
  })
  
  schema.objectType({
    name: 'Subscriber',
    definition(t) {
      t.field('id', { type: 'String' })
      t.field('email', { type: 'String' })
      t.field('name', { type: 'String' })
    },
  })
  
  schema.objectType({
    name: 'User',
    definition(t) {
      t.field('id', { type: 'String' })
    //   t.list.field('roles', {
    //     type: 'String',
    //     resolve: (parent, args, ctx) =>
    //       ctx.db.user
    //         .findOne({
    //           where: { id: parent.id },
    //         })
    //         .roles(),
    //})
    },
  })
  
  schema.queryType({
    definition(t) {
      t.list.field('allSubscribers', {
        type: 'Subscriber',
        resolve: (_, args, ctx) => {
          return ctx.db.subscriber.findMany()
        },
      })
  
      t.list.field('allIssues', {
        type: 'Issue',
        resolve: (_, args, ctx) => {
          return ctx.db.issue.findMany()
        },
      })
  
      t.list.field('allAuthors', {
        type: 'Author',
        resolve: (_, args, ctx) => {
          return ctx.db.author.findMany()
        },
      })
      t.list.field('allTopics', {
        type: 'Topic',
        resolve: (_, args, ctx) => {
          return ctx.db.topic.findMany()
        },
      })
      t.list.field('allLinks', {
        type: 'Link',
        resolve: (_, args, ctx) => {
          return ctx.db.link.findMany()
        },
      })
      t.list.field('allLinkSubmissions', {
        type: 'LinkSubmission',
        resolve: (_, args, ctx) => {
          return ctx.db.linkSubmission.findMany()
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
  
  schema.mutationType({
    definition(t) {
      // t.crud.createOneUser({ alias: 'signupUser' })
      // t.crud.deleteOnePost()
  
      t.field('createSubscriber', {
        type: 'Subscriber',
        args: {
          name: schema.stringArg({ nullable: false }),
          email: schema.stringArg({ nullable: false }),
        },
        resolve: (_, { name, email }, ctx) => {
          return ctx.db.subscriber.create({
            data: {
              name,
              email
            },
          })
        },
      })
  
    //   t.field('createSubmissionLink', {
    //     type: 'LinkSubmission',
    //     args: {
    //       name: stringArg({ nullable: false }),
    //       email: stringArg({ nullable: false }),
    //       description: stringArg({ nullable: false }),
    //       title: stringArg({ nullable: false }),
    //       url: stringArg({ nullable: false }),
    //     },
    //     resolve: (_, { name, email, description, title, url }, ctx) => {
    //       return ctx.prisma.linkSubmission.create({
    //         data: {
    //           name,
    //           email,
    //           description,
    //           title,
    //           url
    //         },
    //       })
    //     },
    //   })
  
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