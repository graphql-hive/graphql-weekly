# GraphQL Weekly Monorepo Migration Plan

## Decisions

- **Test runner:** Vitest (fast, ESM-native, good Miniflare integration)
- **GraphQL client in CMS:** Keep graphql-request + TanStack Query
- **Email templates:** Exact match of current design (pixel-perfect recreation)
- **Stellate:** Keep it, update origin URL to new Worker after deploy
- **API domain:** Decide during deploy phase
- **Open source:** Only after removing Netlify (secrets in history don't matter until then)
- **Phase order:** Sequential (3 → 4 → 5 → 6 → 7)
- **Data migration:** Export MySQL dump, adapt for SQLite/D1 ✅ dumped to `packages/api/data-dump/`
- **CMS during dev:** Point to local wrangler dev (configurable endpoint)
- **DB client:** Kysely (not Drizzle)
- **Monorepo tooling:** Turborepo

---

## Phase 4: Migrate API to Cloudflare Workers

<promise>API runs on `wrangler dev` with D1, GraphQL Yoga responds at `/graphql`, CMS can query it locally.</promise>

### 4.1 Setup

- [x] Create `wrangler.jsonc` at root
- [x] Create D1 database: `graphqlweekly` (id: `f7a8d65f-a03c-4505-b7bb-5cd48ad7f390`)
- [ ] Add CF Worker entry point: `packages/api/src/worker.ts`

### 4.2 Migrate to schema-first GraphQL (drop Pothos)

- [ ] Create `packages/api/src/schema.graphql` from existing Pothos types
- [ ] Set up graphql-codegen (`graphql-codegen.ts`)
- [ ] Add codegen deps
- [ ] Write resolvers with generated types
- [ ] Remove Pothos deps

### 4.3 Adapt GraphQL Yoga for Workers

- [ ] Replace Netlify handler with CF Worker fetch handler
- [ ] Update context creation for CF Worker Request
- [ ] Replace `process.env` with Worker env bindings

### 4.4 Migrate to D1 + Kysely (drop Prisma)

- [ ] Convert Prisma schema to D1 SQL migrations
- [ ] Create `packages/api/migrations/0001_init.sql`
- [x] Export data from MySQL → `packages/api/data-dump/*.json`
- [ ] Set up Kysely with D1 dialect
- [ ] Generate Kysely types from schema
- [ ] Create import script for JSON dumps
- [ ] Replace Prisma client with Kysely queries
- [ ] Remove `@prisma/client`, `prisma` deps
- [ ] Delete `prisma/` directory

### 4.5 Auth with Cloudflare Access

- [ ] Set up CF Access application (Zero Trust)
- [ ] Configure OAuth provider (Google/GitHub)
- [ ] Extract user from `Cf-Access-Jwt-Assertion` header
- [ ] Add audit fields (`createdBy`, `updatedBy`) to mutations

### 4.6 Cleanup

- [ ] Remove Netlify config (`.netlify/`, `netlify.toml`)
- [ ] Remove Gatsby
- [ ] Update `turbo.json` with api build/dev tasks

### 4.7 Local Dev & Testing

- [ ] Set up `wrangler dev` for local Worker development
- [ ] Add `localflare` for D1 inspection dashboard
- [ ] Add Vitest + Miniflare for integration tests
- [ ] Test Mailchimp integration (mock API responses)

---

## Phase 5: Migrate Email to React Email

<promise>Newsletter emails render via React Email, pixel-perfect match to current design, sent via Mailchimp API.</promise>

### 5.1 Setup

- [ ] Add `react-email`, `@react-email/components` to api
- [ ] Create `packages/api/src/email/templates/`

### 5.2 Build Templates

- [ ] Create `newsletter.tsx` template component
- [ ] Match existing email structure exactly
- [ ] Add preview script: `email dev`
- [ ] Make topic colorMap editable from CMS

### 5.3 Integrate with Mailchimp

- [ ] Replace old email generation with `render()` from react-email
- [ ] Update `publishEmailDraft` mutation

### 5.4 Cleanup

- [ ] Remove old email lambda code (`src/email/src/index.ts`)

---

## Phase 6: Migrate CMS to Astro + React Islands

<promise>CMS builds as static Astro site, served from `/admin` by the API Worker, queries same-origin `/graphql`.</promise>

### 6.1 Convert CMS to Astro

- [ ] Add Astro + `@astrojs/react`
- [ ] Configure with `/admin` base path
- [ ] Create Astro layout with prerendered shell

### 6.2 Migrate pages

- [ ] Create Astro pages wrapping existing React components
- [ ] Keep React components (IssueList, LinkEditor, etc.)
- [ ] Update GraphQL endpoint to `/graphql` (same origin)
- [ ] Add topic name autocomplete in editor

### 6.3 Build integration

- [ ] API copies CMS dist to `public/admin/`
- [ ] Add `public/admin` to `.gitignore`
- [ ] Test locally: `wrangler dev` serves both API and CMS

---

## Phase 7: Cleanup & Deploy

<promise>API + CMS deployed to Cloudflare Workers via GitHub Actions, old Netlify sites deleted.</promise>

- [ ] Delete `packages/msg/` directory
- [ ] Set up CF Worker secrets
- [ ] Configure GitHub Actions CI/CD
- [ ] Add `CF_API_TOKEN` secret to GitHub
- [ ] Update Stellate origin to new Worker URL
- [ ] DNS: point api subdomain to CF Worker
- [ ] Delete old Netlify sites

---

## Final Structure

```
graphqlweekly-v2/
├── wrangler.jsonc            # Shared CF config (D1 bindings)
├── turbo.json
├── packages/
│   ├── api/                  # CF Worker (GraphQL Yoga + Kysely + D1)
│   │   ├── src/
│   │   │   ├── schema.graphql
│   │   │   ├── resolvers/
│   │   │   ├── generated/
│   │   │   ├── email/templates/
│   │   │   ├── db/           # Kysely setup + types
│   │   │   └── worker.ts
│   │   ├── public/admin/     # CMS build output
│   │   └── migrations/
│   ├── cms/                  # Astro + React islands
│   └── web/                  # CF Pages (unchanged)
```

**Deployments:**

- `api` + `cms` → single CF Worker (GitHub Actions)
- `web` → CF Pages (GitHub integration)
