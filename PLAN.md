## Problems

- client.n-qD7hcj.js:24 Uncaught Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
- Issue #400 is not visible in the CMS on prod. Why?
- ~~E2E test `submission-to-link.spec.ts` failing on CI~~
  - **Root cause**: Nav menu "Submit a link" button was hidden on desktop due to Tailwind CSS class conflict
  - **Details**: `h-0` (no breakpoint) was applied when menu closed, which should be overridden by `md:h-13` but `overflow-hidden` was clipping content
  - **Fix**: Changed base classes to use `overflow-hidden md:overflow-visible` so desktop shows content
  - **Also fixed**: Added retry-click pattern in test to handle React hydration race condition
- ~~HTTP 503 on /graphql in deploy previews~~
  - **Root cause**: D1 overloaded by N+1 queries (allIssues query = 1 + 112 + 400+ queries!)
  - **Fixes applied**:
    - [x] Try-catch wrapper with CORS headers on all errors (worker.ts)
    - [x] Retry logic with exponential backoff (cms/client/fetcher.ts)
    - [x] N+1 optimization: allIssues now fetches all data in 3 parallel queries instead of 500+
    - [x] Issue.topics prefetches links; Topic.links uses prefetched data
    - [x] Preview proxy now returns CORS headers (was missing for `polish-api.graphqlweekly.com` etc)
  - **Deploy needed** to verify fix works in production
- We're getting a spinner when we move a tag, bad UX
  - We're getting a spinner on most actions on prod, what's super weird.
