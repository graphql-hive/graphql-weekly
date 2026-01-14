import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // Use local API schema from packages/api (run `bun run dev` in api package first)
  schema: "../api/src/schema.graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
      ],
      config: {
        reactQueryVersion: 5,
        fetcher: {
          func: "../client/fetcher#fetcher",
        },
        exposeQueryKeys: true,
        exposeFetcher: true,
      },
    },
  },
};

export default config;
