import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["lib/**/*.test.ts","tests/**/*.test.ts","tests/**/*.test.tsx"],
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      "@": path.resolve(dir, "."),
    },
  },
});
