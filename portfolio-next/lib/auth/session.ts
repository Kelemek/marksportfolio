import {
  OTP_CODE_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/auth/constants";
import { normalizeEmail } from "@/lib/auth/normalize";

export type LoginStep =
  | { kind: "email" }
  | { kind: "code"; email: string };

export const EMAIL_LOGIN_STEP: LoginStep = { kind: "email" };

type OtpCooldown = {
  email: string;
  sentAt: number;
  cooldownSeconds: number;
};

const STEP_KEY = "login_step";
const COOLDOWN_KEY = "login_otp_cooldown";
const LOGIN_SESSION_CHANGE = "login-session-change";

let cachedLoginStep: LoginStep = EMAIL_LOGIN_STEP;

function loginStepsEqual(a: LoginStep, b: LoginStep): boolean {
  if (a.kind !== b.kind) {
    return false;
  }

  if (a.kind === "email") {
    return true;
  }

  return a.email === b.email;
}

function parseLoginStep(): LoginStep {
  const raw = sessionStorage.getItem(STEP_KEY);
  if (!raw) {
    return EMAIL_LOGIN_STEP;
  }

  try {
    const parsed = JSON.parse(raw) as LoginStep;
    if (parsed.kind === "code" && typeof parsed.email === "string") {
      return { kind: "code", email: parsed.email };
    }
  } catch {
    // fall through
  }

  return EMAIL_LOGIN_STEP;
}

export function getLoginStepSnapshot(): LoginStep {
  const next = parseLoginStep();

  if (loginStepsEqual(next, cachedLoginStep)) {
    return cachedLoginStep;
  }

  cachedLoginStep =
    next.kind === "email"
      ? EMAIL_LOGIN_STEP
      : { kind: "code", email: next.email };

  return cachedLoginStep;
}

export function getServerLoginStepSnapshot(): LoginStep {
  return EMAIL_LOGIN_STEP;
}

export function readLoginStep(): LoginStep {
  return parseLoginStep();
}

function notifyLoginSessionChange(): void {
  window.dispatchEvent(new Event(LOGIN_SESSION_CHANGE));
}

export function subscribeLoginSession(callback: () => void): () => void {
  window.addEventListener(LOGIN_SESSION_CHANGE, callback);
  return () => window.removeEventListener(LOGIN_SESSION_CHANGE, callback);
}

function writeCooldown(email: string, cooldownSeconds: number): void {
  const cooldown: OtpCooldown = {
    email: normalizeEmail(email),
    sentAt: Date.now(),
    cooldownSeconds,
  };
  sessionStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldown));
  notifyLoginSessionChange();
}

function readCooldown(): OtpCooldown | null {
  const raw = sessionStorage.getItem(COOLDOWN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OtpCooldown;
    if (typeof parsed.email !== "string" || typeof parsed.sentAt !== "number") {
      return null;
    }
    return {
      email: parsed.email,
      sentAt: parsed.sentAt,
      cooldownSeconds:
        typeof parsed.cooldownSeconds === "number"
          ? parsed.cooldownSeconds
          : OTP_RESEND_COOLDOWN_SECONDS,
    };
  } catch {
    return null;
  }
}

export function resetToEmailStep(): void {
  sessionStorage.removeItem(STEP_KEY);
  notifyLoginSessionChange();
}

export function showOtpStep(email: string): void {
  const normalizedEmail = normalizeEmail(email);
  sessionStorage.setItem(
    STEP_KEY,
    JSON.stringify({ kind: "code", email: normalizedEmail } satisfies LoginStep)
  );
  notifyLoginSessionChange();
}

export function beginOtpStep(email: string): void {
  const normalizedEmail = normalizeEmail(email);
  writeCooldown(normalizedEmail, OTP_RESEND_COOLDOWN_SECONDS);
  sessionStorage.setItem(
    STEP_KEY,
    JSON.stringify({ kind: "code", email: normalizedEmail } satisfies LoginStep)
  );
  notifyLoginSessionChange();
}

export function recordOtpRateLimit(
  email: string,
  cooldownSeconds: number
): void {
  writeCooldown(email, cooldownSeconds);
}

export function clearLoginSession(): void {
  sessionStorage.removeItem(STEP_KEY);
  sessionStorage.removeItem(COOLDOWN_KEY);
  notifyLoginSessionChange();
}

export function getSecondsUntilResendAllowed(email: string): number {
  const cooldown = readCooldown();
  if (!cooldown) {
    return 0;
  }

  if (cooldown.email !== normalizeEmail(email)) {
    return 0;
  }

  const elapsedSeconds = Math.floor((Date.now() - cooldown.sentAt) / 1000);
  return Math.max(0, cooldown.cooldownSeconds - elapsedSeconds);
}

export function isValidOtpCode(code: string): boolean {
  return new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code.trim());
}
