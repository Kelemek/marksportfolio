"use client";

import Link from "next/link";
import EmailStep from "@/components/login/EmailStep";
import OtpStep from "@/components/login/OtpStep";
import { useLoginFlow } from "@/lib/auth/useLoginFlow";

export default function LoginPage() {
  const {
    waitingForCode,
    email,
    draftEmail,
    code,
    loading,
    resendLoading,
    resendCooldownSeconds,
    error,
    setDraftEmail,
    handleCodeChange,
    handleResendCode,
    handleSubmit,
    resetForm,
  } = useLoginFlow();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-large font-heading text-white mb-4">Admin Login</h1>
          <p className="text-white-1">
            {waitingForCode
              ? "Enter the verification code sent to your email"
              : "Enter your email to receive a verification code"}
          </p>
        </div>

        {waitingForCode ? (
          <OtpStep
            email={email}
            code={code}
            loading={loading}
            resendLoading={resendLoading}
            resendCooldownSeconds={resendCooldownSeconds}
            error={error}
            onCodeChange={handleCodeChange}
            onSubmit={handleSubmit}
            onResend={() => void handleResendCode()}
            onReset={resetForm}
          />
        ) : (
          <EmailStep
            email={draftEmail}
            loading={loading}
            error={error}
            onEmailChange={setDraftEmail}
            onSubmit={handleSubmit}
          />
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-pink hover:underline">
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
