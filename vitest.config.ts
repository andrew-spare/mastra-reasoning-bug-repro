import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60000, // 60s timeout for LLM calls
    hookTimeout: 30000,
  },
});
