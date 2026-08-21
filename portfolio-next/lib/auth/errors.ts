import { OTP_RATE_LIMIT_MESSAGE } from "@/lib/auth/constants";

export function isRateLimitError(message: string, status?: number, code?: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate limit") ||
    normalized.includes("over_email_send_rate_limit") ||
    status === 429 ||
    code === "over_email_send_rate_limit"
  );
}

export function formatOtpError(error: string | undefined): string {
  if (!error) {
    return "Failed to send verification code. Please try again.";
  }

  if (isRateLimitError(error)) {
    return OTP_RATE_LIMIT_MESSAGE;
  }

  return error;
}
