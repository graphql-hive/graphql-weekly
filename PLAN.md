# GraphQL Weekly Monorepo Migration Plan

## Remaining Work

### API: Auth with Better Auth

Using Better Auth + `better-auth-cloudflare` package instead of CF Access.

**Auth method:**
- [x] GitHub OAuth

**Implementation:**
- [ ] Install `better-auth`, `better-auth-cloudflare`
- [ ] Create auth schema migration (user, session, account, verification tables)
- [ ] Integrate Better Auth with Kysely (or run Drizzle alongside for auth only)
- [ ] Mount auth handler at `/auth/*` in API worker
- [ ] Add auth client to CMS
- [ ] Add `BETTER_AUTH_SECRET` to worker secrets
- [ ] Link User to Author (every Author requires a User; User optionally has Author profile)
- [ ] Add audit fields (`createdBy`, `updatedBy`) to mutations

### CMS

- [ ] Add topic name autocomplete in editor
- [x] Add Playwright E2E tests against local API + CMS

### Deploy

- [ ] Set up CF Worker secrets (MAILCHIMP_API_KEY)
- [x] Configure GitHub Actions CI/CD (with PR previews)
- [ ] Add `CF_API_TOKEN` secret to GitHub
- [ ] Update Stellate origin to new Worker URL
- [ ] DNS: point api subdomain to CF Worker
- [ ] Delete old Netlify sites
