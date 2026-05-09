import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/tests/unit/**/*.test.ts"],
    setupFiles: ["src/tests/unit/setup.ts"],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      {
        find: /^server-only$/,
        replacement: path.resolve(__dirname, "src/tests/unit/server-only-stub.ts"),
      },
    ],
  },
});
