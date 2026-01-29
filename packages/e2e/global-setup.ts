/**
 * Playwright globalSetup - runs BEFORE webServers start.
 * Seeds database when wrangler dev isn't running (no D1 lock conflicts).
 */
import { seedDatabase } from "./src/seed-database";

// eslint-disable-next-line import/no-default-export
export default function globalSetup() {
  seedDatabase();
}
