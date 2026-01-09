#! /bin/sh
set -e

cd "$(dirname "$0")"

if [ "$1" == "--help" ]; then
  echo "Usage: $0 [--html] [--ui]"
  echo "  --html: Generate HTML report"
  echo "  --ui: Run playwright test with --ui flag to debug tests"
  exit 0
fi

if [ "$1" == "--html" ]; then
  export HTML_REPORT=1
fi

# if --ui is passed, run playwright test with ui
if [ "$1" == "--ui" ]; then
  bun run playwright test --ui
else
  bun run playwright test
  bun ./compare-html.ts
fi

