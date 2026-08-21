import { normalizeEmail } from "@/lib/auth/normalize";

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? "";
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return false;
  }
  return normalizeEmail(email) === normalizeEmail(adminEmail);
}
