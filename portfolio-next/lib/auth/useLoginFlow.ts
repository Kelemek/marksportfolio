"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { OTP_CODE_LENGTH } from "@/lib/auth/constants";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/auth/login";
import {
  clearLoginSession,
  getLoginStepSnapshot,
  getSecondsUntilResendAllowed,
  getServerLoginStepSnapshot,
  isValidOtpCode,
  resetToEmailStep,
  subscribeLoginSession,
  type LoginStep,
} from "@/lib/auth/session";

function useLoginStep(): LoginStep {
  return useSyncExternalStore(
    subscribeLoginSession,
    getLoginStepSnapshot,
    getServerLoginStepSnapshot
  );
}

function useOtpCooldown(email: string, active: boolean): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active || !email) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [active, email]);

  if (!active || !email) {
    return 0;
  }

  return getSecondsUntilResendAllowed(email);
}

export function useLoginFlow() {
  const router = useRouter();
  const step = useLoginStep();
  const [draftEmail, setDraftEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");

  const waitingForCode = step.kind === "code";
  const email = waitingForCode ? step.email : draftEmail;
  const resendCooldownSeconds = useOtpCooldown(email, waitingForCode);

  const resetForm = () => {
    resetToEmailStep();
    setDraftEmail("");
    setCode("");
    setError("");
  };

  const requestOtp = async (targetEmail: string) => {
    setError("");
    try {
      const result = await sendLoginOtp(targetEmail);

      if (!result.success) {
        setError(result.error ?? "Failed to send verification code. Please try again.");
        return false;
      }

      setCode("");
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    }
  };

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await requestOtp(draftEmail);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (submittedCode?: string) => {
    const token = (submittedCode ?? code).trim();

    if (!isValidOtpCode(token)) {
      setError(`Please enter the complete ${OTP_CODE_LENGTH}-digit code.`);
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyLoginOtp(email, token);

      if (result.success) {
        clearLoginSession();
        router.refresh();
        router.push("/admin");
        return;
      }

      setError(result.error ?? "Invalid code. Please try again.");
      setCode("");
    } catch {
      setError("Something went wrong. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
    setCode(digits);
    setError("");

    if (digits.length === OTP_CODE_LENGTH && !loading) {
      void handleVerifyCode(digits);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldownSeconds > 0) {
      setError(
        `Please wait ${resendCooldownSeconds} seconds before requesting another code.`
      );
      return;
    }

    setResendLoading(true);
    try {
      await requestOtp(email);
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (waitingForCode) {
      void handleVerifyCode();
    } else {
      void handleSendCode(event);
    }
  };

  return {
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
  };
}
