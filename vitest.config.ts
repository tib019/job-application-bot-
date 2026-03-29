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
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
