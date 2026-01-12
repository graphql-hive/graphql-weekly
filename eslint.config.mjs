import { theGuild } from "@hasparus/eslint-config";

export default [
  ...theGuild,
  {
    ignores: [
      ".cache/",
      ".localflare/",
      ".turbo/",
      ".wrangler/",
      "dist/",
      "node_modules/",
      "playwright-report/",
      "test-results/",
    ],
  },
];
