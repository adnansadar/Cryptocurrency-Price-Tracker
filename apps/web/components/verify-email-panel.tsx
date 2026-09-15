"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { absoluteWebUrl, safeReturnTo } from "@/lib/return-to";

export function VerifyEmailPanel({
  email,
  verified,
  error,
  returnTo,
}: {
  email: string;
  verified: boolean;
  error: boolean;
  returnTo: string;
}) {
  const [message, setMessage] = useState("");
  const destination = safeReturnTo(returnTo);

  async function resend() {
    if (!email) return;
    setMessage("Sending…");
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: absoluteWebUrl(
          `/verify-email?verified=true&returnTo=${encodeURIComponent(destination)}`,
        ),
      });
      setMessage(
        "If the account is awaiting verification, a new link has been sent.",
      );
    } catch {
      setMessage("A verification email could not be sent right now.");
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-heading">
        <p className="eyebrow">Email verification</p>
        <h1>
          {verified
            ? "Email verified."
            : error
              ? "Link unavailable."
              : "Check your inbox."}
        </h1>
        <p>
          {verified
            ? "Your account is ready and your private workspace is unlocked."
            : error
              ? "This verification link is invalid or has expired. Request a fresh link below."
              : `We sent a verification link${email ? ` to ${email}` : ""}.`}
        </p>
      </div>
      {verified ? (
        <Link className="primary-button auth-submit" href={destination}>
          Continue
        </Link>
      ) : (
        <>
          {email && (
            <button
              className="secondary-button auth-submit"
              onClick={() => void resend()}
            >
              Resend verification email
            </button>
          )}
          <Link className="form-link" href="/auth?mode=signin">
            Back to sign in
          </Link>
        </>
      )}
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
    </section>
  );
}
