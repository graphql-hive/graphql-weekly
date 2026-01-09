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
