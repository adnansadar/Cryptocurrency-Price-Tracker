import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": import.meta.dirname } },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "http://localhost" } },
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
});
