import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminEmail, isAdminEmail } from "@/lib/auth/admin";
import { normalizeEmail } from "@/lib/auth/normalize";

describe("admin auth helpers", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads admin email from env", () => {
    expect(getAdminEmail()).toBe("admin@example.com");
  });

  it("accepts the configured admin email", () => {
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("Admin@Example.com")).toBe(true);
  });

  it("rejects non-admin emails", () => {
    expect(isAdminEmail("other@example.com")).toBe(false);
  });

  it("rejects all emails when ADMIN_EMAIL is unset", () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    expect(isAdminEmail("admin@example.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeEmail("  Admin@Example.COM ")).toBe("admin@example.com");
  });
});
