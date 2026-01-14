import { theGuild } from "@hasparus/eslint-config";

export default [
  ...theGuild,
  {
    settings: {
      react: { version: "19" },
    },
  },
  {
    ignores: [
      ".cache/",
      ".localflare/",
      ".turbo/",
      ".wrangler/",
      "**/wrangler/",
      "dist/",
      "**/dist/",
      "node_modules/",
      "**/node_modules/",
      "**/node_modules/**",
      "playwright-report/",
      "**/playwright-report/",
      "test-results/",
      "**/test-results/",
      "generated/",
      "**/generated/",
      "**/data-dump/",
    ],
  },
  {
    files: ["**/worker.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
