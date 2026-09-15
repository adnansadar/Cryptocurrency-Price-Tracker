import { AuthForm } from "@/components/auth-form";
import { safeReturnTo } from "@/lib/return-to";

export const metadata = { title: "Sign in or create an account" };

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    returnTo?: string;
    oauthError?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  return (
    <main className="auth-page shell">
      <AuthForm
        mode={mode}
        returnTo={safeReturnTo(params.returnTo)}
        oauthError={params.oauthError === "true" || Boolean(params.error)}
      />
    </main>
  );
}
