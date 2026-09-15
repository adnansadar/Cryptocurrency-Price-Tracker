import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata = { title: "Reset password" };
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <main className="auth-page shell">
      <ResetPasswordForm token={(await searchParams).token ?? ""} />
    </main>
  );
}
