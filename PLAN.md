# GraphQL Weekly Monorepo Migration Plan

## Remaining Work

### API: Auth with Better Auth

Using Better Auth + `better-auth-cloudflare` package instead of CF Access.

**Auth method:**

- [x] GitHub OAuth — ties to repo collaborators, simple

**Implementation:**

- [x] Install `better-auth`, `better-auth-cloudflare`
- [x] Create auth schema migration (user, session, account, verification tables)
- [x] Integrate Better Auth with Drizzle (running alongside Kysely for auth only)
- [x] Mount auth handler at `/auth/*` in API worker
- [x] Add auth client to CMS
- [ ] Add `BETTER_AUTH_SECRET` to worker secrets (need to set in CF dashboard)
- [x] Link User to Author (every Author requires a User; User optionally has Author profile)
- [x] Add audit fields (`createdBy`, `updatedBy`) to mutations
- [ ] Add auth guards to CMS mutations (throw if not logged in)
- [ ] Verify user is `graphql-hive/graphql-weekly` collaborator during OAuth
- [ ] Test GitHub OAuth

### CMS

- [ ] Add topic name autocomplete in editor
- [x] Add Playwright E2E tests against local API + CMS (see `packages/cms/e2e/TEST_PLAN.md`)

### Deploy

- [ ] Set up CF Worker secrets (MAILCHIMP_API_KEY)
- [x] Configure GitHub Actions CI/CD (with PR previews)
- [ ] Add `CF_API_TOKEN` secret to GitHub
- [ ] Update Stellate origin to new Worker URL
- [ ] DNS: point api subdomain to CF Worker
- [ ] Delete old Netlify sites
