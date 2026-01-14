import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  generates: {
    './src/generated/graphql.ts': {
      config: {
        contextType: '../worker#GraphQLContext',
        mappers: {
          Author: '../db/types#AuthorRow',
          Issue: '../db/types#IssueRow',
          Link: '../db/types#LinkRow',
          LinkSubmission: '../db/types#LinkSubmissionRow',
          Subscriber: '../db/types#SubscriberRow',
          Topic: '../db/types#TopicRow',
        },
        scalars: {
          DateTime: 'Date',
        },
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  schema: './src/schema.graphql',
}

export default config
