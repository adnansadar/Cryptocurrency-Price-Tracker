"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-provider";
const links = [
  { href: "/", label: "Markets" },
  { href: "/compare", label: "Compare" },
  { href: "/workspace", label: "Workspace" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isPending, signOut } = useAuth();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">CT</span>
          <span>Crypto Terminal</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {isPending ? (
            <span className="status-chip">Checking account</span>
          ) : user ? (
            <details className="account-menu">
              <summary aria-label="Open account menu">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" />
                ) : (
                  <span aria-hidden="true">{user.name.slice(0, 1)}</span>
                )}
                <span>{user.name}</span>
              </summary>
              <div>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
                <button onClick={() => void signOut()}>Sign out</button>
              </div>
            </details>
          ) : (
            <div className="header-auth-links" aria-busy={isPending}>
              <Link href="/auth?mode=signin">Sign in</Link>
              <Link className="primary-button" href="/auth?mode=signup">
                Create account
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
