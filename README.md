# GraphQL Weekly

Archive website for the GraphQL Weekly newsletter at [graphqlweekly.com](https://www.graphqlweekly.com).

## Stack

- **Astro** — static site generator
- **React** — interactive components (sidebar, playground)
- **Tailwind CSS** — styling
- **Bun** — package manager and runtime
- **Cloudflare Workers + D1** — API and database

## Domains

| Service | Local                 | Production                    |
| ------- | --------------------- | ----------------------------- |
| API     | http://localhost:2012 | https://api.graphqlweekly.com |
| CMS     | http://localhost:2016 | https://cms.graphqlweekly.com |
| Website | http://localhost:2015 | https://graphqlweekly.com     |

### API Endpoints

- `/graphql` - GraphQL API
- `/auth/*` - Better Auth (GitHub OAuth)
- `/health` - Health check

## Monorepo Structure

```
packages/
├── web/         # Astro static site (graphqlweekly.com)
├── api/         # Cloudflare Worker + D1 (GraphQL API)
└── cms/         # Astro + React curator app
```

## Development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

## Deployment

Site deployed to **Cloudflare**.

Build command: `bun run build`
Output directory: `dist`

No environment variables required.

## Architecture

### Two GraphQL Backends

```
┌─────────────────────────────────────────────────────────────┐
│                    graphqlweekly.com                        │
└─────────────────────────────────────────────────────────────┘
          │                               │
          │ read                          │ write
          ▼                               ▼
┌────────────────────────────────┐    ┌──────────────────────────────┐
│  graphql-weekly.graphqcdn.app |    │  graphqlweekly.com/graphql  │
│                               │    │                             │
│  (Stellate)                   │    |  (GraphQL Yoga, Workers)    │
│  Issues, Topics, Links        │    │  Subscriptions, Submissions │
└────────────────────────────────┘    └──────────────────────────────┘
```

### Read API — `https://graphql-weekly.graphcdn.app`

Stellate (formerly GraphCDN) edge-cached GraphQL endpoint serving all newsletter content.

**Build time:** `src/lib/api.ts` fetches all issues via `getAllIssues()` to generate static pages for every issue and topic.

**Runtime:** The interactive Playground in the footer (`src/components/home/Footer/Playground.tsx`) lets users run GraphQL queries against this endpoint.

### Write API — Cloudflare Worker

GraphQL API running on Cloudflare Workers with D1 database. Handles mutations at runtime.

| Mutation               | Purpose             | Component                                                                                 |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `createSubscriber`     | Newsletter signup   | `src/components/home/Subscription/index.tsx`                                              |
| `createSubmissionLink` | Submit article link | `src/components/home/Header/SubmitForm.tsx`, `src/components/shared/SubmitForm/index.tsx` |

## CMS (Curator App)

Internal tool for curating newsletter issues at `packages/cms`.

**Stack:** Astro + React, TanStack Query, Tailwind CSS, Cloudflare Workers

### Access Control

CMS requires GitHub authentication. Access is granted to users with **Triage**, **Write**, **Maintain**, or **Admin** permissions on the `graphql-hive/graphql-weekly` repository.

To grant someone CMS access, add them as a collaborator to the repo with at least Triage permissions.

**Scripts:**

```bash
bun dev          # Dev server
bun run preview  # Preview with Wrangler
bun run deploy   # Build and deploy
bun test:e2e     # Playwright tests
bun run codegen  # GraphQL types
```

**Workflow:**

1. Collect links throughout the week
2. Create new issue, add topics (Articles & Videos, Open Source, etc.)
3. Assign 5-6 links per issue, write descriptions
4. Publish to preview, gather feedback
5. Send newsletter via Mailchimp

## Email Templates

Email templates are built with [react-email](https://react.email/).

```bash
bun run email  # Start dev server with live preview
```

Templates live in `src/email/templates/`.
Each template default exports a React component with optional `PreviewProps` for the dev server.

## Debt

- Can't update Vitest to v4 until [cloudflare/workers-sdk#11064](https://github.com/cloudflare/workers-sdk/issues/11064) is closed.
