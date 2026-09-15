import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  authEnabled,
  config,
  emailPasswordAuthEnabled,
  googleAuthEnabled,
} from "./config.js";
import { prisma } from "./database.js";
import { dispatchAuthEmail } from "./email.js";

export const auth =
  authEnabled && prisma
    ? betterAuth({
        appName: "Crypto Research Terminal",
        baseURL: config.authUrl,
        basePath: "/api/auth",
        secret: config.authSecret,
        trustedOrigins: [config.webOrigin],
        rateLimit: {
          enabled: true,
          window: 60,
          max: 100,
          customRules: {
            "/sign-in/email": { window: 60, max: 10 },
            "/sign-up/email": { window: 60, max: 5 },
            "/request-password-reset": { window: 60, max: 5 },
            "/send-verification-email": { window: 60, max: 5 },
          },
        },
        database: prismaAdapter(prisma, { provider: "postgresql" }),
        socialProviders: googleAuthEnabled
          ? {
              google: {
                clientId: config.googleClientId,
                clientSecret: config.googleClientSecret,
              },
            }
          : {},
        emailAndPassword: emailPasswordAuthEnabled
          ? {
              enabled: true,
              minPasswordLength: 8,
              maxPasswordLength: 128,
              requireEmailVerification: true,
              resetPasswordTokenExpiresIn: 60 * 60,
              revokeSessionsOnPasswordReset: true,
              sendResetPassword: async ({ user, url }) => {
                dispatchAuthEmail({
                  to: user.email,
                  subject: "Reset your Crypto Terminal password",
                  heading: "Reset your password",
                  message:
                    "Use this secure link to choose a new password. The link expires in one hour.",
                  action: "Reset password",
                  url,
                });
              },
            }
          : { enabled: false },
        emailVerification: emailPasswordAuthEnabled
          ? {
              sendOnSignUp: true,
              sendOnSignIn: true,
              autoSignInAfterVerification: true,
              expiresIn: 60 * 60,
              sendVerificationEmail: async ({ user, url }) => {
                dispatchAuthEmail({
                  to: user.email,
                  subject: "Verify your Crypto Terminal email",
                  heading: "Verify your email",
                  message:
                    "Confirm your email address to activate your private research workspace.",
                  action: "Verify email",
                  url,
                });
              },
            }
          : undefined,
        account: {
          accountLinking: {
            enabled: true,
            disableImplicitLinking: false,
            allowDifferentEmails: false,
          },
        },
        session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
        advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
      })
    : null;
