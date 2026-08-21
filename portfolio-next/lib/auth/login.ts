import { createClient } from "@/lib/supabase/client";
import { OTP_CODE_LENGTH, OTP_RATE_LIMIT_RETRY_SECONDS } from "@/lib/auth/constants";
import { formatOtpError } from "@/lib/auth/errors";
import { normalizeEmail } from "@/lib/auth/normalize";
import {
  beginOtpStep,
  getSecondsUntilResendAllowed,
  isValidOtpCode,
  recordOtpRateLimit,
  showOtpStep,
} from "@/lib/auth/session";

// OTP send goes through the API route (admin gate). Verify stays client-side so
// the browser Supabase client can establish the session cookies.
export async function sendLoginOtp(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const secondsUntilResend = getSecondsUntilResendAllowed(normalizedEmail);

  if (secondsUntilResend > 0) {
    return {
      success: false,
      error: `Please wait ${secondsUntilResend} seconds before requesting another code.`,
    };
  }

  const response = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const data = (await response.json()) as {
    error?: string;
    retryAfterSeconds?: number;
  };

  if (!response.ok) {
    if (response.status === 429) {
      recordOtpRateLimit(
        normalizedEmail,
        data.retryAfterSeconds ?? OTP_RATE_LIMIT_RETRY_SECONDS
      );
      showOtpStep(normalizedEmail);
    }

    return {
      success: false,
      error: formatOtpError(data.error),
    };
  }

  beginOtpStep(normalizedEmail);
  return { success: true };
}

export async function verifyLoginOtp(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const token = code.trim();

  if (!isValidOtpCode(token)) {
    return {
      success: false,
      error: `Please enter the complete ${OTP_CODE_LENGTH}-digit code.`,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: "email",
  });

  if (error) {
    return {
      success: false,
      error: "The code you entered is incorrect. Please check and try again.",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { success: false, error: "Verification failed. Please try again." };
  }

  return { success: true };
}
