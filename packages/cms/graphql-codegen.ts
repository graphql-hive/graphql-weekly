import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // Use local API schema from packages/api (run `bun run dev` in api package first)
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
  schema: "../api/src/schema.graphql",
};

export default config;
