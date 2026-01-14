import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/generated/graphql.ts": {
      config: {
        exposeFetcher: true,
        exposeQueryKeys: true,
        fetcher: {
          func: "../client/fetcher#fetcher",
        },
        reactQueryVersion: 5,
      },
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
      ],
    },
  },
  schema: "https://graphqlweekly-api.netlify.app/.netlify/functions/graphql",
};

export default config;
