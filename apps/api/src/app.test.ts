import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("API application", () => {
  it("reports health and feature availability", async () => {
    const response = await request(createApp()).get("/health").expect(200);
    expect(response.body.status).toBe("ok");
    expect(typeof response.body.persistence).toBe("boolean");
    expect(typeof response.body.auth.enabled).toBe("boolean");
    expect(typeof response.body.auth.emailPassword).toBe("boolean");
    expect(typeof response.body.auth.google).toBe("boolean");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("publishes public authentication capabilities", async () => {
    const response = await request(createApp())
      .get("/v1/auth/capabilities")
      .expect(200);
    expect(response.body).toEqual({
      enabled: expect.any(Boolean),
      emailPassword: expect.any(Boolean),
      google: expect.any(Boolean),
    });
  });

  it("rejects malformed market queries before contacting the provider", async () => {
    const response = await request(createApp())
      .get("/v1/markets?page=0")
      .expect(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("normalizes unknown routes", async () => {
    const response = await request(createApp()).get("/missing").expect(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("does not expose workspace data when authentication is unavailable", async () => {
    const response = await request(createApp())
      .get("/v1/watchlist")
      .expect(503);
    expect(response.body.error.code).toBe("AUTH_DISABLED");
  });

  it("publishes a versioned OpenAPI contract", async () => {
    const response = await request(createApp())
      .get("/openapi.json")
      .expect(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.paths["/v1/markets"]).toBeTruthy();
  });
});
