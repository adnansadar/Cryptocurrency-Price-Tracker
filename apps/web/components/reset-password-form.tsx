"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) setError("This reset link is invalid or has expired.");
      else setComplete(true);
    } catch {
      setError("The password could not be reset. Please request a new link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-heading">
        <p className="eyebrow">Account recovery</p>
        <h1>Choose a new password.</h1>
      </div>
      {!token ? (
        <div className="form-message error" role="alert">
          This reset link is incomplete or invalid.
        </div>
      ) : complete ? (
        <div className="form-message success" role="status">
          Your password has been updated.{" "}
          <Link href="/auth?mode=signin">Sign in</Link>.
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            New password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <button className="primary-button auth-submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
      {error && (
        <div className="form-message error" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
