"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function AuthGateDialog({
  open,
  onClose,
  feature = "this workspace feature",
}: {
  open: boolean;
  onClose: () => void;
  feature?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedSearch = searchParams.toString();
  const returnTo = `${pathname}${serializedSearch ? `?${serializedSearch}` : ""}`;
  const authQuery = (mode: "signup" | "signin") =>
    `/auth?${new URLSearchParams({ mode, returnTo })}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="auth-gate-dialog"
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="auth-gate-title"
    >
      <button className="dialog-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <span className="lock-mark" aria-hidden="true">
        🔒
      </span>
      <p className="eyebrow">Account required</p>
      <h2 id="auth-gate-title">Keep your research private.</h2>
      <p>
        Create a free account to use {feature} and access your research across
        devices.
      </p>
      <div className="dialog-actions">
        <Link className="primary-button" href={authQuery("signup")}>
          Create account
        </Link>
        <Link className="secondary-button" href={authQuery("signin")}>
          Sign in
        </Link>
      </div>
    </dialog>
  );
}
