# GraphQL Weekly

Archive website for the GraphQL Weekly newsletter at [graphqlweekly.com](https://www.graphqlweekly.com).

## Stack

- **Astro** — static site generator
- **React** — interactive components (sidebar, playground)
- **Tailwind CSS** — styling
- **Bun** — package manager and runtime

## Development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
bun wrangler:dev
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
│                   (Static Site - Astro)                     │
└─────────────────────────────────────────────────────────────┘
          │                              │
          │ Build time + Runtime         │ Runtime only
          │ (read)                       │ (write)
          ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│  graphql-weekly         │    │  graphqlweekly-api          │
│  .graphcdn.app          │    │  .netlify.app               │
│                         │    │  /.netlify/functions/graphql│
│  (Stellate/GraphCDN)    │    │  (Netlify Functions)        │
│  Issues, Topics, Links  │    │  Subscriptions, Submissions │
└─────────────────────────┘    └─────────────────────────────┘
```

### Read API — `https://graphql-weekly.graphcdn.app`

Stellate (formerly GraphCDN) edge-cached GraphQL endpoint serving all newsletter content.

**Build time:** `src/lib/api.ts` fetches all issues via `getAllIssues()` to generate static pages for every issue and topic.

**Runtime:** The interactive Playground in the footer (`src/components/home/Footer/Playground.tsx`) lets users run GraphQL queries against this endpoint.

### Write API — `https://graphqlweekly-api.netlify.app/.netlify/functions/graphql`

Netlify Functions backend handling user submissions. Called at runtime only.

| Mutation               | Purpose             | Component                                                                                 |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `createSubscriber`     | Newsletter signup   | `src/components/home/Subscription/index.tsx`                                              |
| `createSubmissionLink` | Submit article link | `src/components/home/Header/SubmitForm.tsx`, `src/components/shared/SubmitForm/index.tsx` |

This is a separate Netlify deployment. The static site just calls it via HTTPS.

## Debt

- Can't update Vitest to v4 until [cloudflare/workers-sdk#11064](https://github.com/cloudflare/workers-sdk/issues/11064) is closed.
