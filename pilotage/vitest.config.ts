import { defineConfig } from "vitest/config";
import path from "node:path";

// Les tests d'intégration vident la base : ils ne tournent que sur TEST_DATABASE_URL.
const testDb = process.env.TEST_DATABASE_URL;

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    env: testDb ? { DATABASE_URL: testDb, DIRECT_URL: testDb } : {},
    fileParallelism: false,
  },
});
