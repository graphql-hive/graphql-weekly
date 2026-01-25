/* eslint-disable no-console */
import { cleanupAll } from "./cleanup";

// eslint-disable-next-line import/no-default-export
export default async function globalTeardown() {
  try {
    const { issues, links } = await cleanupAll();
    if (links > 0 || issues > 0) {
      console.log(
        `\n🧹 Cleaned up ${links} test links and ${issues} test issues`,
      );
    }
  } catch (error) {
    // Don't fail tests if cleanup fails (server may be down)
    console.warn("Cleanup warning:", error);
  }
}
