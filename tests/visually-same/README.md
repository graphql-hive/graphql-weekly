# Visually Same - Visual Regression Testing CLI

TypeScript CLI tool using **ink**, **odiff-bin**, and **Playwright** to ensure visual consistency.

## Quick Start

```bash
# Install dependencies
cd tests/visually-same
bun install

# Run compare (requires preview server running)
bun run preview &
bun run src/cli.tsx compare
```

## Features

- 🎨 Beautiful CLI UI powered by ink
- 📸 Playwright for high-quality screenshots
- 🔍 odiff-bin for fast, accurate comparisons
- ⚡ Built with Bun for maximum performance
- 🔄 Three commands: compare, update-baseline, screenshot-production

## Commands

### `compare`

Take screenshots of local build and compare against baseline.

```bash
bun run src/cli.tsx compare
```

**Workflow:**
1. Captures screenshots from `http://localhost:4321`
2. Compares each against `*-baseline.png`
3. Generates `*-diff.png` for differences
4. Shows pass/fail results with diff percentages

### `update-baseline`

Take screenshots and save as new baseline.

```bash
bun run src/cli.tsx update-baseline
```

**When to use:**
- After intentional design changes
- After deploying to production
- When you want to accept current state as reference

### `screenshot-production`

Take screenshots from production site (no branch switching required).

```bash
bun run src/cli.tsx screenshot-production
```

**When to use:**
- When you need production screenshots for comparison
- Without switching branches or rebuilding
- Quick production reference capture

## Requirements

### For `compare` and `update-baseline` commands:

The preview server must be running:

```bash
bun run preview
```

The CLI connects to `http://localhost:4321` to capture screenshots.

### For `screenshot-production` command:

No local server needed - captures directly from `https://www.graphqlweekly.com`.

## Configuration

Edit `src/config.ts` to customize:

- **Pages**: URLs to test
- **Viewport**: Browser size (default: 1280x720)
- **Threshold**: odiff tolerance (default: 0.1 = 10%)
- **Diff color**: Hex code for diff overlay (default: #cd2cc9)

## Screenshot Files

- `*-baseline.png` - Reference screenshots
- `*-local.png` - Current local build screenshots
- `*-production.png` - Production site screenshots
- `*-diff.png` - Difference highlights (magenta)

## Development

Run directly with TypeScript (no build required):

```bash
bun run src/cli.tsx compare
bun run src/cli.tsx update-baseline
bun run src/cli.tsx screenshot-production
```

## CI/CD

```yaml
- name: Start local server
  run: bun run preview &  
- name: Run visual comparison
  run: cd tests/visually-same && bun run src/cli.tsx compare
```

## Notes

- odiff threshold of 0.1 allows 10% color difference tolerance
- Review `*-diff.png` files before updating baseline
- CLI provides helpful error messages if preview server isn't running
