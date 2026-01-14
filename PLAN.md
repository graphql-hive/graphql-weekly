# GraphQL Weekly Monorepo Migration Plan

## Remaining Work

### API: Auth with Better Auth

Using Better Auth with built-in Kysely adapter (D1 passed directly).

**Auth method:**

- [x] GitHub OAuth — ties to repo collaborators, simple

**Implementation:**

- [x] Install `better-auth`
- [x] Create auth schema migration (user, session, account, verification tables)
- [x] Integrate Better Auth with D1 (uses built-in Kysely adapter)
- [x] Mount auth handler at `/auth/*` in API worker
- [x] Add auth client to CMS
- [ ] Add `BETTER_AUTH_SECRET` to worker secrets (need to set in CF dashboard)
- [x] Link User to Author (every Author requires a User; User optionally has Author profile)
- [x] Add audit fields (`createdBy`, `updatedBy`) to mutations
- [x] Add auth guards to CMS mutations (require logged-in collaborator)
- [x] Add `me` query to check auth status and collaborator access
- [x] Verify user is `graphql-hive/graphql-weekly` collaborator on each request
- [ ] Test GitHub OAuth

### CMS

- [x] Add `me` query to `operations.graphql` and regenerate types
- [x] Add Astro middleware to protect `/issue/*` routes
- [x] Add `/login` and `/access-denied` pages
- [ ] Add topic name autocomplete in editor
- [x] Add Playwright E2E tests against local API + CMS (see `packages/cms/e2e/TEST_PLAN.md`)
- [x] Update E2E tests to use real GitHub auth (Playwright `storageState`)

### Deploy

- [ ] Set up CF Worker secrets (BETTER_AUTH_SECRET, MAILCHIMP_API_KEY)
- [x] Configure GitHub Actions CI/CD (with PR previews)
- [ ] Add `CF_API_TOKEN` secret to GitHub
- [ ] Update Stellate origin to new Worker URL
- [ ] Set up domains / routes
- [ ] Delete old Netlify sites
