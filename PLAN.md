## Current Status

### Lint Error Cleanup ✅ COMPLETE

**Final Result**: 210 problems → **0 problems** (100% cleanup)

**All Issues Fixed**:

- ✅ Removed legacy Gatsby files (`gatsby-node.js`, `gatsby-browser.js`, `gatsby-config.js`)
- ✅ Fixed parsing errors by updating `.eslintignore` → flat config `ignores`
- ✅ Fixed PropsWithChildren import restriction (14 files) - replaced `import * as React` with named imports
- ✅ Fixed Function type errors (4 files) - replaced `Function` with explicit signatures
- ✅ Fixed equality operators (`==` → `===`)
- ✅ Converted all vector components to named exports with proper SVG types:
  - Vector components: Archive, ArrowLeft, ArrowRight, Arrow, Check, ChevronRight, Mail, Run, Slack, Subscribe, Twitter
  - Nav components: Button, Close, Logo
  - Footer components: Arrow, PrismaLogo
- ✅ Fixed all 'any' types with proper types:
  - SideMenu onClick handler
  - ContentWrapper props styling
  - Playground event handlers
  - Code.tsx and typescript.ts (eslint-disable for library types)
  - env.d.ts (eslint-disable for module augmentation)
  - screenshot.ts error handling
- ✅ Fixed all accessibility errors:
  - Header social links (Twitter, Discord) with real URLs
  - Nav menu converted span→button
  - SubmitForm backdrop click (eslint-disable for UX pattern)
- ✅ Fixed code quality issues in lib/api.ts:
  - Replaced if statement with `||=` operator
  - Removed dynamic delete by building new object
- ✅ Fixed React hooks issues in tests/visually-same/src/app.tsx:
  - Converted functions to useCallback hooks
  - Moved useEffect before conditional return
  - Updated tsconfig.json to use `"jsx": "react-jsx"`
  - Added eslint-disable for CLI initialization pattern
- ✅ Fixed all warnings:
  - Removed unused variables
  - Removed unused React imports
  - Fixed import sorting/spacing
  - Removed unused typography.js file
- ✅ Build verification: `bun run build` passes cleanly

---

## Next Steps

### 3. Compare bundle size and lighthouse audit against production

- **Goal**: Ensure no performance regressions from recent changes
- **Requirements**:
  - Run production build
  - Generate bundle size comparison
  - Run Lighthouse audit
  - Compare metrics against current production site

### 5. Migrate to Tailwind 4

- First, build an oracle. Tailwind 4 version screenshots must be exactly the same as Tailwind 3 version screenshots.
  - Copy -local.png screenshots from `visually-same/screenshots` to another directory. They are gonna be our paragon.
  - Run `bunx @tailwindcss/upgrade`
  - Compare screenshots with `odiff` and see what changed.
- ✅ Built TypeScript visual oracle with ink, odiff-bin, and Playwright
  - Commands: `compare`, `update-baseline`, `screenshot-production`
  - Location: `tests/visually-same/`
