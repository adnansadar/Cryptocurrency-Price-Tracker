import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["components/market-screener.tsx"],
    rules: { "react-hooks/incompatible-library": "off" },
  },
  globalIgnores([".next/**", "playwright-report/**", "test-results/**"]),
]);
