import { describe, expect, it } from "vitest";
import { OTP_RATE_LIMIT_MESSAGE } from "@/lib/auth/constants";
import { formatOtpError, isRateLimitError } from "@/lib/auth/errors";

describe("otp error helpers", () => {
  it("detects rate-limit errors", () => {
    expect(isRateLimitError("email rate limit exceeded")).toBe(true);
    expect(isRateLimitError("nope", 429, "over_email_send_rate_limit")).toBe(true);
    expect(isRateLimitError("invalid login")).toBe(false);
  });

  it("formats rate-limit errors with the shared message", () => {
    expect(formatOtpError("email rate limit exceeded")).toBe(OTP_RATE_LIMIT_MESSAGE);
  });

  it("passes through other errors", () => {
    expect(formatOtpError("Signups not allowed")).toBe("Signups not allowed");
    expect(formatOtpError(undefined)).toBe(
      "Failed to send verification code. Please try again."
    );
  });
});
