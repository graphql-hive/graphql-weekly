## Next Steps

### 1. Remove all frivolous concatenation from `cn()` calls (Easiest win)

- **Goal**: Combine static string arguments into single strings for greppability
- **Pattern**: Change `cn('string1', 'string2', ...)` to `cn('string1 string2 ...')`
- **Rule**: Keep separate arguments only for conditional values (e.g., `className` prop)
- **Scope**: ~18 files use `cn()` with static concatenation
  - Examples: PrimaryButton, Input, SecondaryButton, Textarea, and 14+ other components
- **Why**: Mechanical work, no logic changes, clear pattern, low risk, immediate greppability improvement

### 2. Inline Space component callsites

- **Goal**: Remove non-idiomatic Space component, replace with direct Tailwind classes
- **Scope**: 7 usages across 6 files
  - src/components/home/Header/index.tsx (2 usages)
  - src/components/home/Subscription/index.tsx (1 usage)
  - src/components/home/Header/SubmitForm.tsx (1 usage)
  - src/components/shared/SubmitForm/index.tsx (1 usage)
  - src/components/home/Content/Sidebar.tsx (1 usage)
  - src/components/home/Content/NavIssue.tsx (1 usage)
- **Complexity**: Requires manual conversion of Tailwind classes, must handle mobile/desktop variants (widthOnMobile, heightOnMobile)

### 3. Compare bundle size and lighthouse audit against production

- **Goal**: Ensure no performance regressions from recent changes
- **Requirements**:
  - Run production build
  - Generate bundle size comparison
  - Run Lighthouse audit
  - Compare metrics against current production site

### 4. Code cleanup (investigated, no action needed)

- ~~colorSchema~~: Already removed from codebase ✅
- ~~primaryLight1~~: NOT dead code - actively used in graphqlLight.ts for syntax highlighting

### 5. Migrate to Tailwind 4

- First, build an oracle. Tailwind 4 version screenshots must be exactly the same as Tailwind 3 version screenshots.
  - Copy -local.png screenshots from `visually-same/screenshots` to another directory. They are gonna be our paragon.
  - Run `bunx @tailwindcss/upgrade`
  - Compare screenshots with `odiff` and see what changed.
- ✅ Built TypeScript visual oracle with ink, odiff-bin, and Playwright
  - Commands: `compare`, `update-baseline`, `screenshot-production`
  - Location: `tests/visually-same/`

## Notes

- Breakpoint: 1000px (mobile ≤1000px, desktop ≥1001px)
- Dynamic colors (topicColor, primaryColor props): use inline styles or CSS custom properties

## Someday/Maybe

- Migrate the write API from Netlify Functions (`graphqlweekly-api.netlify.app`) to Cloudflare Workers
