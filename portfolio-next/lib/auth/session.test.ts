import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/constants";
import {
  beginOtpStep,
  clearLoginSession,
  getSecondsUntilResendAllowed,
  isValidOtpCode,
  readLoginStep,
  recordOtpRateLimit,
  resetToEmailStep,
  showOtpStep,
} from "@/lib/auth/session";

describe("login session helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("defaults to the email step", () => {
    expect(readLoginStep()).toEqual({ kind: "email" });
  });

  it("persists the code step atomically", () => {
    beginOtpStep("admin@example.com");

    expect(readLoginStep()).toEqual({ kind: "code", email: "admin@example.com" });
    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(
      OTP_RESEND_COOLDOWN_SECONDS
    );
  });

  it("tracks cooldown per email", () => {
    beginOtpStep("admin@example.com");

    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(
      OTP_RESEND_COOLDOWN_SECONDS
    );
    expect(getSecondsUntilResendAllowed("other@example.com")).toBe(0);
  });

  it("reduces cooldown as time passes", () => {
    beginOtpStep("admin@example.com");
    vi.advanceTimersByTime(15_000);

    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(
      OTP_RESEND_COOLDOWN_SECONDS - 15
    );
  });

  it("keeps cooldown when resetting back to the email step", () => {
    beginOtpStep("admin@example.com");
    resetToEmailStep();

    expect(readLoginStep()).toEqual({ kind: "email" });
    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(
      OTP_RESEND_COOLDOWN_SECONDS
    );
  });

  it("clears step and cooldown on successful login cleanup", () => {
    beginOtpStep("admin@example.com");
    clearLoginSession();

    expect(readLoginStep()).toEqual({ kind: "email" });
    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(0);
  });

  it("applies a longer cooldown after a rate-limit response", () => {
    recordOtpRateLimit("admin@example.com", 300);

    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(300);
  });

  it("shows the otp step without changing cooldown", () => {
    recordOtpRateLimit("admin@example.com", 300);
    showOtpStep("admin@example.com");

    expect(readLoginStep()).toEqual({ kind: "code", email: "admin@example.com" });
    expect(getSecondsUntilResendAllowed("admin@example.com")).toBe(300);
  });

  it("validates otp code length", () => {
    expect(isValidOtpCode("123456")).toBe(true);
    expect(isValidOtpCode("12345")).toBe(false);
    expect(isValidOtpCode("abcdef")).toBe(false);
  });
});
