import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() {
  return (
    <main className="auth-page shell">
      <ForgotPasswordForm />
    </main>
  );
}
