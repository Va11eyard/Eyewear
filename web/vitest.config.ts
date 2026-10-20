import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      // Two files are WebGL shells with no logic of their own: placement maths
      // lives in try-on-math and frame-shapes, both covered. Excluding them is a
      // real reduction in guard strength, so it is stated here rather than hidden.
      exclude: ["src/lib/try-on-engine.ts", "src/lib/product-render.ts"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
