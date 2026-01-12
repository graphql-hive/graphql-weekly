# GraphQL Weekly Monorepo Migration Plan

## Decisions

- **Test runner:** Vitest (fast, ESM-native, good Miniflare integration)
- **GraphQL client in CMS:** Keep graphql-request + TanStack Query
- **Email templates:** Exact match of current design (pixel-perfect recreation)
- **Stellate:** Keep it, update origin URL to new Worker after deploy
- **API domain:** Decide during deploy phase
- **Open source:** Only after removing Netlify (secrets in history don't matter until then)

## Phase 3: Consolidate to Bun

### packages/api

- [ ] Delete `yarn.lock`
- [ ] Update `package.json`: remove yarn-specific config, add `"type": "module"`
- [ ] Run `bun install`
- [ ] Fix any import issues (CJS → ESM)

### packages/cms

- [ ] Already uses Bun - verify `bun install` works
- [ ] Update any scripts referencing npm/yarn

### packages/api/src/email (formerly graphqlweekly-email)

- [ ] Delete old `package.json` (deps move to api's package.json)
- [ ] Merge dependencies into `packages/api/package.json`
- [ ] Remove netlify-lambda, babel config

## Phase 4: Migrate API to Cloudflare Workers

### 4.1 Setup

- [ ] Create `packages/api/wrangler.toml`
- [ ] Add CF Worker entry point: `packages/api/src/worker.ts`
- [ ] Create D1 database: `wrangler d1 create graphqlweekly`

### 4.2 Migrate to schema-first GraphQL (drop Pothos)

- [ ] Create `packages/api/src/schema.graphql` from existing Pothos types
- [ ] Set up graphql-codegen:

```ts
// packages/api/graphql-codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schema.graphql",
  generates: {
    "src/generated/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "../context#Context",
        mappers: {
          Issue: "../db/types#IssueRow",
          Topic: "../db/types#TopicRow",
          Link: "../db/types#LinkRow",
          // etc.
        },
      },
    },
  },
};
export default config;
```

- [ ] Add codegen deps: `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-resolvers`
- [ ] Write resolvers with generated types
- [ ] Remove Pothos deps: `@pothos/core`, `@pothos/plugin-prisma`, `@pothos/plugin-relay`, `@pothos/plugin-scope-auth`

### 4.3 Adapt GraphQL Yoga for Workers

- [ ] Replace Netlify handler with CF Worker fetch handler
- [ ] Update context creation for CF Worker Request
- [ ] Replace `process.env` with Worker env bindings
- [ ] Configure Workers Static Assets for CMS

```ts
// packages/api/src/worker.ts
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { createContext } from "./context";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  context: ({ request, env }) => createContext(request, env),
});

export default yoga;
```

```toml
# packages/api/wrangler.toml
name = "graphqlweekly-api"
main = "src/worker.ts"

[assets]
directory = "./public"  # CMS build output

[[d1_databases]]
binding = "DB"
database_name = "graphqlweekly"
database_id = "..."
```

Workers Static Assets serves `/admin/*` from `public/admin/`, GraphQL Yoga handles `/graphql`.

### 4.4 Migrate to D1 (drop Prisma)

- [ ] Convert Prisma schema to D1 SQL migrations
- [ ] Create `packages/api/migrations/0001_init.sql`:

```sql
CREATE TABLE Author (
  id TEXT PRIMARY KEY,
  avatarUrl TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Issue (
  id TEXT PRIMARY KEY,
  authorId TEXT REFERENCES Author(id),
  comment TEXT,
  date TEXT NOT NULL,
  description TEXT,
  number INTEGER UNIQUE NOT NULL,
  previewImage TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  specialPerk TEXT,
  title TEXT NOT NULL,
  versionCount INTEGER DEFAULT 0,
  createdBy TEXT,
  updatedBy TEXT
);

CREATE TABLE Topic (
  id TEXT PRIMARY KEY,
  issueId TEXT REFERENCES Issue(id),
  issue_comment TEXT NOT NULL,
  position INTEGER,
  title TEXT NOT NULL,
  createdBy TEXT,
  updatedBy TEXT
);

CREATE TABLE Link (
  id TEXT PRIMARY KEY,
  position INTEGER DEFAULT 0,
  text TEXT,
  title TEXT,
  topicId TEXT REFERENCES Topic(id),
  url TEXT NOT NULL,
  createdBy TEXT,
  updatedBy TEXT
);

CREATE TABLE LinkSubmission (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Subscriber (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE User (
  id TEXT PRIMARY KEY,
  roles TEXT
);
```

- [ ] Run migration: `wrangler d1 migrations apply graphqlweekly`
- [ ] Export data from MySQL, import to D1
- [ ] Replace Prisma client with raw D1 queries or a lightweight wrapper (e.g., drizzle-orm)
- [ ] Remove `@prisma/client`, `prisma` deps
- [ ] Delete `prisma/` directory

### 4.5 Auth with Cloudflare Access

- [ ] Set up CF Access application (Zero Trust → Access → Applications)
- [ ] Configure OAuth provider (Google/GitHub)
- [ ] Create policy: allow specific emails (you + Mo)
- [ ] Extract user from `Cf-Access-Jwt-Assertion` header in context:

```ts
// packages/api/src/context.ts
export async function createContext(request: Request, env: Env) {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  const user = jwt ? JSON.parse(atob(jwt.split(".")[1])) : null;

  return { user, env };
}
```

- [ ] Add audit fields to schema and use in mutations
- [ ] Add auth to `createLink` mutation (check `ctx.user`)

### 4.6 Cleanup

- [ ] Remove Netlify config (`.netlify/`, `netlify.toml`)
- [ ] Remove Gatsby (was only used for... unclear?)
- [ ] Update `turbo.json` with api build/dev tasks

### 4.7 Local Dev & Testing

- [ ] Set up `wrangler dev` for local Worker development
- [ ] Add `localflare` for D1/KV/R2 inspection dashboard
- [ ] Add Miniflare for programmatic integration tests (real D1 bindings)
- [ ] Email template snapshot tests (render + compare)
- [ ] GraphQL resolver tests via Miniflare
- [ ] Test Mailchimp integration (mock API responses)

## Phase 5: Migrate Email to React Email

### 5.1 Setup

- [ ] Add deps to `packages/api`: `react-email`, `@react-email/components`
- [ ] Create `packages/api/src/email/templates/` directory

### 5.2 Build Templates

- [ ] Create `newsletter.tsx` template component
- [ ] Match existing email structure (topics, links, etc.)
- [ ] Add preview script: `email dev` for local preview
- [ ] Make topic colorMap editable from CMS (store in DB or config, not hardcoded)

### 5.3 Integrate with Mailchimp

- [ ] Replace old email generation with `render()` from react-email
- [ ] Update `publishEmailDraft` to:
  1. Fetch issue data
  2. Render email with react-email
  3. Send via Mailchimp API (with env var, not hardcoded key)

### 5.4 Cleanup

- [ ] Remove old email lambda code
- [ ] Remove babel config (react-email uses modern tooling)
- [ ] Remove netlify-lambda dependency

## Phase 6: Migrate CMS into API (Astro + React Islands)

### 6.1 Convert CMS to Astro

- [ ] Add Astro to `packages/cms`: `bun add astro @astrojs/react`
- [ ] Configure Astro with `/admin` base path:

```ts
// packages/cms/astro.config.ts
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  outDir: "dist",
  base: "/admin",
});
```

- [ ] Create Astro layout with prerendered shell:

```astro
---
// packages/cms/src/layouts/Admin.astro
---
<html>
  <head><title>GraphQL Weekly CMS</title></head>
  <body>
    <nav><!-- static navigation --></nav>
    <main><slot /></main>
  </body>
</html>
```

### 6.2 Migrate pages to Astro + React islands

- [ ] Create Astro pages that wrap existing React components:

```astro
---
// packages/cms/src/pages/issues.astro
import Layout from "../layouts/Admin.astro";
import IssueList from "../components/IssueList";
---
<Layout title="Issues">
  <h1>Issues</h1>
  <IssueList client:load />
</Layout>
```

- [ ] Keep existing React components (IssueList, LinkEditor, etc.)
- [ ] Components hydrate client-side, fetch via TanStack Query + GraphQL
- [ ] Update GraphQL endpoint to `/graphql` (same origin, no CORS)
- [ ] Add topic name autocomplete in editor (suggest from existing topics + colorMap keys)

### 6.3 Build integration

- [ ] Add CMS as workspace dependency in `packages/api/package.json`:

```json
{
  "dependencies": {
    "@graphqlweekly/cms": "workspace:*"
  },
  "scripts": {
    "build": "bun run build:cms && bun run build:worker",
    "build:cms": "cp -r ../cms/dist public/admin",
    "build:worker": "esbuild src/worker.ts --bundle --outfile=dist/worker.js"
  }
}
```

- [ ] Turbo handles build order (CMS builds first via `^build` dependency)
- [ ] API copies CMS dist to `public/admin/`
- [ ] Add `public/admin` to `packages/api/.gitignore` (build artifact)
- [ ] Test locally: `wrangler dev` serves both API and CMS

## Phase 7: Cleanup & Deploy

- [ ] Delete empty `packages/msg/` directory
- [ ] Update root `README.md` with new structure
- [ ] Set up CF Worker secrets: `wrangler secret put MAILCHIMP_API_KEY` etc.
- [ ] Configure CI/CD for API + CMS (GitHub Actions):

```yaml
# .github/workflows/api.yml
name: API
on:
  push:
    branches: [main]
    paths: ["packages/api/**", "packages/cms/**"]
  pull_request:
    paths: ["packages/api/**", "packages/cms/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install

      - name: Build (API + CMS)
        working-directory: packages/api
        run: bun run build

      - name: Deploy (main)
        if: github.ref == 'refs/heads/main'
        working-directory: packages/api
        run: bunx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}

      - name: Upload version (PR)
        if: github.event_name == 'pull_request'
        working-directory: packages/api
        run: bunx wrangler versions upload
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

- [ ] Add `CF_API_TOKEN` secret to GitHub repo
- [ ] Keep CF Pages GitHub integration for `web`
- [ ] Update Stellate origin: point to new CF Worker URL
- [ ] DNS: point api subdomain to CF Worker
- [ ] Delete old Netlify sites after transition

## Final Structure

```
graphqlweekly-v2/
├── packages/
│   ├── api/
│   │   ├── src/
│   │   │   ├── schema.graphql # GraphQL schema (source of truth)
│   │   │   ├── resolvers/     # typed resolvers
│   │   │   ├── generated/     # graphql-codegen output
│   │   │   ├── email/
│   │   │   │   └── templates/ # React Email templates
│   │   │   ├── db/            # D1 queries/helpers
│   │   │   └── worker.ts      # CF Worker entry (GraphQL Yoga)
│   │   ├── public/
│   │   │   └── admin/         # CMS build output (served by Workers Static Assets)
│   │   ├── migrations/        # D1 SQL migrations
│   │   ├── graphql-codegen.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── cms/                   # Astro + React islands
│   │   ├── src/
│   │   │   ├── layouts/       # Astro layouts (prerendered shell)
│   │   │   ├── pages/         # Astro pages
│   │   │   └── components/    # React components (hydrate client-side)
│   │   ├── dist/              # Build output (copied to api/public/admin)
│   │   └── astro.config.ts
│   └── web/                   # Public website (CF Pages)
├── turbo.json
└── package.json
```

**Deployments:**

- `api` + `cms` → single CF Worker (GitHub Actions)
- `web` → CF Pages (GitHub integration)

---

## Open Questions

None - all decisions made.
