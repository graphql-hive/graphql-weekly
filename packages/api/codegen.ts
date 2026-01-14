import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './src/schema.graphql',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../worker#GraphQLContext',
        scalars: {
          DateTime: 'Date',
        },
        mappers: {
          Author: '../db/types#AuthorRow',
          Issue: '../db/types#IssueRow',
          Link: '../db/types#LinkRow',
          Topic: '../db/types#TopicRow',
          Subscriber: '../db/types#SubscriberRow',
          LinkSubmission: '../db/types#LinkSubmissionRow',
        },
      },
    },
  },
}

export default config
