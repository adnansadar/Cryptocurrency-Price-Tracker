import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./config.js";

describe("database URL resolution", () => {
  it("prefers the conventional local and self-hosted variable", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "postgresql://direct",
        POSTGRES_PRISMA_URL: "postgresql://pooled",
      }),
    ).toBe("postgresql://direct");
  });

  it("uses Vercel's Prisma-compatible Supabase URL", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "",
        POSTGRES_PRISMA_URL: "postgresql://pooled",
        POSTGRES_URL: "postgresql://generic",
      }),
    ).toBe("postgresql://pooled");
  });

  it("falls back to Vercel's generic Postgres URL", () => {
    expect(resolveDatabaseUrl({ POSTGRES_URL: "postgresql://generic" })).toBe(
      "postgresql://generic",
    );
  });
});
