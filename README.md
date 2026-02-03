# GraphQL Weekly

Archive website for the GraphQL Weekly newsletter at [graphqlweekly.com](https://www.graphqlweekly.com).

## Workflow

1. Collect links throughout the week
2. Create new issue, add topics (Articles & Videos, Open Source, etc.)
3. Assign 5-6 links per issue, write descriptions
4. Publish to preview, gather feedback
5. Send newsletter via Mailchimp

## Stack

- **Astro** — static site generator
- **React** — interactive components (sidebar, playground)
- **Tailwind CSS** — styling
- **Bun** — package manager and runtime
- **Turbo** — monorepo task orchestration and caching
- **Cloudflare Workers + D1** — API and database

## Monorepo Structure

```
packages/
├── web/         # Astro static site (graphqlweekly.com)
├── api/         # Cloudflare Worker + D1 (GraphQL API)
├── cms/         # Astro + React curator app
└── e2e/         # Playwright end-to-end tests
```

## Domains

| Service | Local                 | Production                    |
| ------- | --------------------- | ----------------------------- |
| API     | http://localhost:2012 | https://api.graphqlweekly.com |
| Website | http://localhost:2015 | https://graphqlweekly.com     |
| CMS     | http://localhost:2016 | https://cms.graphqlweekly.com |

### API Endpoints

- `/graphql` - GraphQL API
- `/auth/*` - Better Auth (GitHub OAuth)
- `/health` - Health check

## Development

**Prerequisites:** Bun 1.3.5, Node >=24.1.0

### Setup

```bash
bun install
cd packages/api && cp .dev.vars.e2e .dev.vars  # then fill in real secrets
bun run migrate:up                              # apply D1 migrations locally
```

### Commands

All commands run through Turbo from the root.

```bash
bun dev              # start all dev servers concurrently
bun run build        # production build
bun run test         # unit (Vitest) + e2e (Playwright)
bun run codegen      # regenerate GraphQL types (run after schema changes)
bun run lint         # ESLint
bun run format       # Prettier
bun run typecheck    # TypeScript across all packages
bun run deploy       # build + deploy to Cloudflare
```

E2E tests seed a local D1 database and start all services automatically. For interactive debugging:

```bash
cd packages/e2e
bun run test:ui      # Playwright UI mode
```

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

## CI/CD

GitHub Actions runs lint, typecheck, and tests on every PR. On merge to `main`, all packages deploy to Cloudflare.

PRs with changes get preview deployments at `https://{branch-slug}-api.graphqlweekly.com` (and equivalent for CMS/web).

**Required secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `TURBO_TOKEN`, `TURBO_TEAM`

## CMS (Curator App)

Internal tool for curating newsletter issues at `packages/cms`.

**Stack:** Astro + React, TanStack Query, Tailwind CSS, Cloudflare Workers

### Access Control

CMS requires GitHub authentication. Access is granted to users with **Triage**, **Write**, **Maintain**, or **Admin** permissions on the `graphql-hive/graphql-weekly` repository.

To grant someone CMS access, add them as a collaborator to the repo with at least Triage permissions.

## Email Templates

Email templates are built with [react-email](https://react.email/).

```bash
bun run email  # Start dev server with live preview
```

Templates live in `src/email/templates/`.
Each template default exports a React component with optional `PreviewProps` for the dev server.

## Debt

- Can't update Vitest to v4 until [cloudflare/workers-sdk#11064](https://github.com/cloudflare/workers-sdk/issues/11064) is closed.
