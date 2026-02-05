import { theGuild } from "@hasparus/eslint-config";

export default [
  ...theGuild,
  {
    settings: {
      react: { version: "19" },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["scripts/*.ts"],
        },
      },
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
      "*.config.mjs",
      "*.config.mts",
    ],
  },
  {
    files: ["**/worker.ts", "**/email/templates/**"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    rules: {
      "unicorn/no-nested-ternary": "off",
    },
  },
];
