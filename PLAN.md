# GraphQL Weekly Monorepo Migration Plan

## Remaining Work

### Auth

- [x] Mock GitHub API in E2E tests (`/user/emails`, `/user/orgs`) via Bun mock server — tests real `getVerifiedEmails`/`getUserOrgs` code paths
- [ ] Switch to GitHub App for granular permissions (`contents:read`, `members:read`)
- [ ] When repo is public, switch org check to repo collaborator permissions check
- [x] Remove debug logging from auth functions
- [x] Run migration on production (`--remote`)
- [x] Cache `isCollaborator` in session (computed once at login, not per-request)

### CMS

- [ ] Add topic name autocomplete in editor

### Deploy

- [ ] Update Stellate origin to new Worker URL
- [x] Set up domains / routes
- [ ] Delete old Netlify sites

---

## Preview Subdomain Auth (Completed)

Enable auth on preview subdomains (`feat-x.api.graphqlweekly.com`) for PR previews using single Worker + single GitHub OAuth app.

### Architecture

```
User on feat-x.cms.graphqlweekly.com clicks "Sign in with GitHub"
        ↓
callbackURL: "https://feat-x.cms.graphqlweekly.com" stored in OAuth state
        ↓
GitHub OAuth callback → api.graphqlweekly.com/auth/callback/github
        ↓
Better Auth reads state, redirects to callbackURL
        ↓
Cookie works via Domain=.graphqlweekly.com
```

### Router for Preview Versions

API Worker routes both API and CMS preview subdomains:

```
*.api.graphqlweekly.com → API Worker → {branch}-graphqlweekly-api.stellate.workers.dev
*.cms.graphqlweekly.com → API Worker → {branch}-graphqlweekly-cms.stellate.workers.dev
api.graphqlweekly.com   → API Worker (production)
cms.graphqlweekly.com   → CMS Worker (production)
```

Total: 2 workers (API + CMS), no per-branch workers.

### Changes Made

1. **`packages/api/src/auth/index.ts`** — Fixed `trustedOrigins` to use wildcards:

   ```typescript
   trustedOrigins: [
     'https://graphqlweekly.com',
     'https://*.graphqlweekly.com',
     'http://localhost:*',
   ],
   ```

2. **`packages/api/src/worker.ts`** — Added router logic:
   - `getPreviewSubdomain()` extracts preview subdomain and service (api/cms) from hostname
   - `isAllowedOrigin()` validates CORS with wildcard support
   - Routes `{branch}.api.graphqlweekly.com` → `{branch}-graphqlweekly-api.stellate.workers.dev`
   - Routes `{branch}.cms.graphqlweekly.com` → `{branch}-graphqlweekly-cms.stellate.workers.dev`

3. **`packages/api/wrangler.jsonc`** — Added routes for both API and CMS previews:

   ```jsonc
   "workers_dev": true,
   "routes": [
     { "pattern": "api.graphqlweekly.com/*", "zone_name": "graphqlweekly.com" },
     { "pattern": "*.api.graphqlweekly.com/*", "zone_name": "graphqlweekly.com" },
     { "pattern": "*.cms.graphqlweekly.com/*", "zone_name": "graphqlweekly.com" },
   ],
   "vars": { "WORKERS_DEV_SUBDOMAIN": "recc" },
   ```

4. **`.github/workflows/ci.yml`** — Updated preview deploys:
   - API: `wrangler versions upload --preview-alias {branch}`
   - CMS: `wrangler versions upload --preview-alias {branch}`

### Still Needed

1. **DNS Records** — Add in Cloudflare Dashboard:
   - `A` record: `api` → `192.0.2.1` (Proxied) ✅ Done
   - `A` record: `*.api` → `192.0.2.1` (Proxied) ✅ Done
   - `A` record: `*.cms` → `192.0.2.1` (Proxied) — needed for CMS previews

### E2E Tests

Passed: 20 passed, 2 flaky (pre-existing UI timing), 1 skipped
