import type { NewsletterProps } from './newsletter'

export const issue399: NewsletterProps = {
  issueTitle: 'Issue 399',
  topics: [
    {
      title: 'Tools & Open Source',
      links: [
        {
          title: 'New GraphQL Codegen preview',
          text: "The GraphQL Codegen team is working on a new major version and they're looking for community feedback. If you're using Codegen in production, this is your chance to shape the future of the tool.",
          url: 'https://www.linkedin.com/posts/eddeee888_typescript-operations-and-client-preset-activity-7404433547521855489-k5Mi',
        },
        {
          title: 'Codegen migration codemod',
          text: 'Migrating from legacy Apollo hooks to the client preset? The Codegen team has released a codemod that automates the tedious parts of the migration, saving you hours of manual refactoring.',
          url: 'https://www.linkedin.com/posts/eddeee888_graphql-codemod-migrating-from-legacy-apollo-activity-7360638966124990464-DgPi',
        },
        {
          title: 'Hive schema proposals preview',
          text: 'Schema Proposals is a new Hive feature that brings pull request-style reviews to your GraphQL schema changes. Collaborate on schema design before committing to production.',
          url: 'https://the-guild.dev/graphql/hive/product-updates/2025-09-03-schema-proposals',
        },
      ],
    },
    {
      title: 'Videos',
      links: [
        {
          title: 'One API Definition To Rule Them All: Generating GraphQL Schemas From TypeSpec',
          text: 'Fiona Huang explains how Pinterest uses TypeSpec to define APIs once and generate GraphQL and OpenAPI schemas from a single source of truth.',
          url: 'https://www.youtube.com/watch?v=AGVEV53fVEo',
        },
        {
          title: 'Breaking change management guide',
          text: "Eddy Nguyen walks through the process of safely removing GraphQL fields without breaking your clients. A must-watch if you're maintaining a public API or working with multiple consumer teams.",
          url: 'https://www.linkedin.com/posts/eddeee888_removing-graphql-fields-heres-how-to-not-activity-7393645705900285952-5DkH',
        },
        {
          title: 'GraphQL Summit 2025 highlights',
          text: 'Catch up on everything from GraphQL Summit 2025 with this curated playlist. Features keynotes, technical deep-dives, and community sessions from the Apollo conference.',
          url: 'https://www.youtube.com/watch?v=MoPYTN4piQc&list=PLpi1lPB6opQz68irPAE7FZct4WmlE_g27',
        },
      ],
    },
    {
      title: 'GraphQL Foundation Working Group Updates',
      links: [
        {
          title: 'Announcing the AI working group',
          text: 'The GraphQL Foundation has officially launched a dedicated working group focused on AI integrations. This group will explore how GraphQL can better serve AI-powered applications and LLM tooling.',
          url: 'https://graphql.org/blog/2025-10-14-announcing-ai-wg/',
        },
      ],
    },
    {
      title: 'Announcements',
      links: [
        {
          title: 'Hive Gateway now uses Rust query planner',
          text: "Hive Gateway's query planner has been rewritten in Rust, delivering substantial performance improvements for complex federated queries. The Guild shares benchmarks and migration notes.",
          url: 'https://the-guild.dev/graphql/hive/product-updates/2025-11-17-hive-gateway-rust-query-planner',
        },
        {
          title: 'Hive Console public GraphQL API',
          text: 'Hive Console now exposes a public GraphQL API, enabling teams to build custom integrations, automate workflows, and extend their schema management pipelines programmatically.',
          url: 'https://the-guild.dev/graphql/hive/product-updates/2025-08-10-public-graphql-api',
        },
      ],
    },
    {
      title: 'Releases',
      links: [
        {
          title: 'Apollo MCP Server 1.0 is generally available',
          text: 'Apollo MCP Server reaches 1.0, bringing stable support for Model Context Protocol integrations. Connect your GraphQL APIs to AI assistants with confidence.',
          url: 'https://www.apollographql.com/blog/apollo-mcp-server-1-0-is-generally-available',
        },
        {
          title: 'Apollo iOS 2.0',
          text: 'Apollo iOS 2.0 is here with Swift concurrency support, improved code generation, and a modernized API surface. A significant upgrade for iOS developers working with GraphQL.',
          url: 'https://www.apollographql.com/blog/announcing-apollo-ios-2-0',
        },
      ],
    },
    {
      title: 'Community & Events',
      links: [
        {
          title: 'Meet the December Ambassador Cohort',
          text: 'The GraphQL Foundation is happy to announce the next cohort of GraphQL Ambassadors! Ambassadors are nominated and represent a diverse range of geographies, backgrounds, and use cases — from maintainers of popular libraries, to meetup organizers, to educators writing guides and tutorials.',
          url: 'https://graphql.org/blog/2025-12-19-meet-the-december-ambassador-cohort/',
        },
        {
          title: 'GraphQL Conf 2025 recap',
          text: "The Guild shares their highlights from GraphQL Conf 2025, including key announcements, community discussions, and what's next for the GraphQL ecosystem.",
          url: 'https://the-guild.dev/graphql/hive/blog/graphql-conf-2025-recap',
        },
        {
          title: 'What comes after Apollo Client',
          text: "Apollo hosts a webinar exploring the future of GraphQL clients and how to prepare your graph for upcoming changes. Essential viewing if you're planning your frontend architecture.",
          url: 'https://www.apollographql.com/events/what-comes-after-apollo-client-preparing-your-graph-for-what-s-next',
        },
      ],
    },
    {
      title: 'Tutorials',
      links: [
        {
          title: 'Expo GraphQL example with automatic types',
          text: 'Kadi Kraman shares a new Expo example featuring a complete GraphQL setup with server, client, and automatic type generation. Perfect starting point for your next React Native project.',
          url: 'https://www.linkedin.com/posts/kadi-kraman_new-expo-example-graphql-server-and-client-ugcPost-7354148965640011776-hoTi',
        },
        {
          title: 'Building apps for ChatGPT with Apollo MCP',
          text: 'Learn how to connect your GraphQL API to ChatGPT using Apollo\'s MCP Server. This tutorial walks through the setup process and demonstrates real-world integration patterns.',
          url: 'https://www.apollographql.com/blog/building-apps-for-chatgpt-with-apollo-mcp-server-and-apollo-client',
        },
      ],
    },
  ],
}
