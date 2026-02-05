#!/usr/bin/env bun
/* eslint-disable no-console */

type Package = "api" | "cms" | "web";

const URLS: Record<Package, (slug: string) => string> = {
  api: (slug) => `https://${slug}-api.graphqlweekly.com/graphql`,
  cms: (slug) => `https://${slug}-cms.graphqlweekly.com`,
  web: (slug) => `https://${slug}-graphqlweekly-v2.recc.workers.dev`,
};

function generateComment(
  branchSlug: string,
  deployed: Package[],
  commitSha: string
): string | null {
  if (deployed.length === 0) return null;

  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const shortSha = commitSha.slice(0, 7);

  const lines = [
    "<!--- preview-deployment --->",
    "### 🔮 Preview Deployment",
    "",
    "| Package | URL | Commit | Deployed |",
    "|---------|-----|--------|----------|",
  ];

  for (const pkg of deployed) {
    lines.push(
      `| ${pkg} | ${URLS[pkg](branchSlug)} | \`${shortSha}\` | ${timestamp} |`
    );
  }

  return lines.join("\n");
}

function main() {
  const branchSlug = process.env.BRANCH_SLUG;
  const commitSha = process.env.COMMIT_SHA;

  if (!branchSlug || !commitSha) {
    console.error("BRANCH_SLUG and COMMIT_SHA env vars are required");
    process.exit(1);
  }

  const deployed: Package[] = [];
  if (process.env.DEPLOYED_API === "true") deployed.push("api");
  if (process.env.DEPLOYED_CMS === "true") deployed.push("cms");
  if (process.env.DEPLOYED_WEB === "true") deployed.push("web");

  const comment = generateComment(branchSlug, deployed, commitSha);
  if (comment) console.log(comment);
}

main();
