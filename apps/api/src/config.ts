export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  coinGeckoUrl:
    process.env.COINGECKO_API_URL ?? "https://api.coingecko.com/api/v3",
  coinGeckoApiKey: process.env.COINGECKO_API_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  authUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  authSecret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-before-deploy",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  authEmailFrom: process.env.AUTH_EMAIL_FROM ?? "",
};

export const persistenceEnabled = Boolean(config.databaseUrl);
export const googleAuthEnabled =
  persistenceEnabled &&
  Boolean(config.googleClientId && config.googleClientSecret);
export const emailPasswordAuthEnabled =
  persistenceEnabled && Boolean(config.resendApiKey && config.authEmailFrom);
export const authEnabled = googleAuthEnabled || emailPasswordAuthEnabled;

if (
  process.env.NODE_ENV === "production" &&
  authEnabled &&
  !process.env.BETTER_AUTH_SECRET
)
  throw new Error(
    "BETTER_AUTH_SECRET is required when authentication is enabled",
  );
