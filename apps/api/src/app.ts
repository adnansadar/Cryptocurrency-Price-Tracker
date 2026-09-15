import crypto from "node:crypto";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import { auth } from "./auth.js";
import {
  authEnabled,
  config,
  emailPasswordAuthEnabled,
  googleAuthEnabled,
  persistenceEnabled,
} from "./config.js";
import { ApiException } from "./errors.js";
import { marketRouter } from "./market-routes.js";
import { createOpenApiDocument } from "./openapi.js";
import { workspaceRouter } from "./workspace-routes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: config.webOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
  );
  app.use((request, response, next) => {
    const requestId = String(
      request.headers["x-request-id"] ?? crypto.randomUUID(),
    );
    response.setHeader("x-request-id", requestId);
    next();
  });
  app.use(pinoHttp({ autoLogging: process.env.NODE_ENV !== "test" }));

  if (auth) app.all("/api/auth/*splat", toNodeHandler(auth));
  else
    app.use("/api/auth", (_request, response) =>
      response.status(503).json({
        error: {
          code: "AUTH_DISABLED",
          message: "Authentication is not configured",
        },
      }),
    );

  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/v1",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.get("/health", (_request, response) =>
    response.json({
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
      persistence: persistenceEnabled,
      auth: {
        enabled: authEnabled,
        emailPassword: emailPasswordAuthEnabled,
        google: googleAuthEnabled,
      },
    }),
  );
  app.get("/v1/auth/capabilities", (_request, response) =>
    response.json({
      enabled: authEnabled,
      emailPassword: emailPasswordAuthEnabled,
      google: googleAuthEnabled,
    }),
  );
  app.get("/openapi.json", (request, response) =>
    response.json(
      createOpenApiDocument(`${request.protocol}://${request.get("host")}`),
    ),
  );
  app.use("/v1", marketRouter);
  app.use("/v1", workspaceRouter);
  app.use((_request, _response, next) =>
    next(new ApiException(404, "NOT_FOUND", "Route not found")),
  );

  const errorHandler: ErrorRequestHandler = (
    error,
    request,
    response,
    _next,
  ) => {
    const requestId = response.getHeader("x-request-id")?.toString();
    if (error instanceof ApiException) {
      response.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      });
      return;
    }
    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: error.flatten(),
          requestId,
        },
      });
      return;
    }
    request.log.error({ err: error, requestId }, "unhandled request error");
    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        requestId,
      },
    });
  };
  app.use(errorHandler);
  return app;
}
