#!/bin/bash
set -e
SCRIPT_DIR="$(dirname "$0")"

cleanup() {
  if [ -n "$API_PID" ]; then
    kill $API_PID 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "=== Starting API ==="
cd "$SCRIPT_DIR/../../api"
bun run migrate:up
bun run dev:e2e &
API_PID=$!

echo "=== Waiting for API (PID: $API_PID) ==="
while ! curl -s http://localhost:2013/health > /dev/null 2>&1; do
  sleep 1
done
echo "=== API ready ==="

echo "=== Starting Web ==="
cd "$SCRIPT_DIR/.."
exec bun run dev
