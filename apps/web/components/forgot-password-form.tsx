"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { absoluteWebUrl } from "@/lib/return-to";
import { useAuth } from "./auth-provider";

export function ForgotPasswordForm() {
  const { capabilities } = useAuth();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: absoluteWebUrl("/reset-password"),
      });
    } finally {
      setSent(true);
      setPending(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-heading">
        <p className="eyebrow">Account recovery</p>
        <h1>Reset your password.</h1>
        <p>
          We’ll send a secure reset link if an account exists for that address.
        </p>
      </div>
      {sent ? (
        <div className="form-message success" role="status">
          Check your inbox. If the address belongs to an account, a reset link
          is on its way.
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button
            className="primary-button auth-submit"
            disabled={pending || !capabilities.emailPassword}
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <Link className="form-link" href="/auth?mode=signin">
        ← Back to sign in
      </Link>
    </section>
  );
}
