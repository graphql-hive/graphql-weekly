# GraphQL Weekly Monorepo Migration Plan

## Remaining Work

### API: Auth with Cloudflare Access

- [ ] Set up CF Access application (Zero Trust)
- [ ] Configure OAuth provider (Google/GitHub)
- [ ] Extract user from `Cf-Access-Jwt-Assertion` header
- [ ] Add audit fields (`createdBy`, `updatedBy`) to mutations

### API: Testing

- [ ] Test Mailchimp integration (mock API responses)

### CMS

- [ ] Add topic name autocomplete in editor
- [x] Add Playwright E2E tests against local API + CMS

### Deploy

- [ ] Set up CF Worker secrets
- [ ] Configure GitHub Actions CI/CD
- [ ] Add `CF_API_TOKEN` secret to GitHub
- [ ] Update Stellate origin to new Worker URL
- [ ] DNS: point api subdomain to CF Worker
- [ ] Delete old Netlify sites
