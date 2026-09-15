"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { absoluteWebUrl, safeReturnTo } from "@/lib/return-to";
import { useAuth } from "./auth-provider";

type Mode = "signin" | "signup";

export function AuthForm({
  mode,
  returnTo,
  oauthError = false,
}: {
  mode: Mode;
  returnTo: string;
  oauthError?: boolean;
}) {
  const router = useRouter();
  const { capabilities, isPending, refreshSession } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(
    oauthError ? "Google sign-in was cancelled or could not be completed." : "",
  );
  const destination = safeReturnTo(returnTo);
  const queryFor = (nextMode: Mode) =>
    `/auth?${new URLSearchParams({ mode: nextMode, returnTo: destination })}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");

    if (password.length < 8 || password.length > 128) {
      setMessage("Password must be between 8 and 128 characters.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        const name = String(form.get("name") ?? "").trim();
        if (name.length < 2) {
          setMessage("Enter a name with at least 2 characters.");
          return;
        }
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: absoluteWebUrl(
            `/verify-email?verified=true&returnTo=${encodeURIComponent(destination)}`,
          ),
        });
        if (result.error) {
          setMessage(
            "We could not complete signup. Try signing in or resetting your password.",
          );
          return;
        }
        router.push(
          `/verify-email?${new URLSearchParams({ email, returnTo: destination })}`,
        );
        return;
      }

      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: absoluteWebUrl(destination),
      });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          router.push(
            `/verify-email?${new URLSearchParams({ email, returnTo: destination })}`,
          );
        } else {
          setMessage("The email or password is incorrect.");
        }
        return;
      }
      await refreshSession();
      router.push(destination);
      router.refresh();
    } catch {
      setMessage(
        "Authentication is temporarily unavailable. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setMessage("");
    setSubmitting(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: absoluteWebUrl(destination),
        errorCallbackURL: absoluteWebUrl(
          `/auth?mode=signin&oauthError=true&returnTo=${encodeURIComponent(destination)}`,
        ),
      });
      if (result.error) setMessage("Google sign-in could not be started.");
    } catch {
      setMessage("Google sign-in is temporarily unavailable.");
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-busy={submitting || isPending}>
      <div className="auth-tabs" aria-label="Authentication options">
        <Link
          className={mode === "signin" ? "active" : ""}
          href={queryFor("signin")}
        >
          Sign in
        </Link>
        <Link
          className={mode === "signup" ? "active" : ""}
          href={queryFor("signup")}
        >
          Create account
        </Link>
      </div>
      <div className="auth-heading">
        <p className="eyebrow">Private research workspace</p>
        <h1>{mode === "signup" ? "Create your account." : "Welcome back."}</h1>
        <p>
          {mode === "signup"
            ? "Save watchlists, screens, and research notes securely."
            : "Sign in to continue to your saved research."}
        </p>
      </div>

      {!isPending && !capabilities.enabled ? (
        <div className="form-message error" role="alert">
          Account access is not configured on this deployment.
        </div>
      ) : (
        <>
          {capabilities.google && (
            <button
              className="google-button"
              type="button"
              disabled={submitting}
              onClick={() => void signInWithGoogle()}
            >
              <span aria-hidden="true">G</span>
              Continue with Google
            </button>
          )}
          {capabilities.google && capabilities.emailPassword && (
            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
          )}
          {capabilities.emailPassword && (
            <form className="auth-form" onSubmit={submit}>
              {mode === "signup" && (
                <label>
                  Name
                  <input
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>
              )}
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={8}
                  maxLength={128}
                  required
                />
                {mode === "signup" && <small>Use 8–128 characters.</small>}
              </label>
              {mode === "signin" && (
                <Link className="form-link" href="/forgot-password">
                  Forgot password?
                </Link>
              )}
              <button
                className="primary-button auth-submit"
                disabled={submitting || isPending}
              >
                {submitting
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>
          )}
        </>
      )}
      {message && (
        <div className="form-message error" role="alert">
          {message}
        </div>
      )}
      <p className="auth-footnote">
        Market browsing remains available without an account. Saved research
        requires sign-in.
      </p>
    </section>
  );
}
