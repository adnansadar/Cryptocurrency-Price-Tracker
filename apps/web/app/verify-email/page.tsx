import { VerifyEmailPanel } from "@/components/verify-email-panel";
import { safeReturnTo } from "@/lib/return-to";

export const metadata = { title: "Verify email" };
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    verified?: string;
    error?: string;
    returnTo?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <main className="auth-page shell">
      <VerifyEmailPanel
        email={params.email ?? ""}
        verified={params.verified === "true"}
        error={Boolean(params.error)}
        returnTo={safeReturnTo(params.returnTo)}
      />
    </main>
  );
}
