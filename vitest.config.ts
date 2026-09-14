import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  ssr: {
    external: ["zod", "@trpc/server", "superjson", "node-cron", "axios", "cheerio"],
    noExternal: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
      "node-cron": path.resolve(templateRoot, "vitest.mock.node-cron.ts"),
    },
  },
  test: {
    environment: "node",
    pool: "forks",
    // shared/ war nicht erfasst: Tests zu Modulen, die sich Server und Client
    // teilen, waeren nie gelaufen.
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "shared/**/*.test.ts",
      "shared/**/*.spec.ts",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
