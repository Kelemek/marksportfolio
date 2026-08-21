import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  OTP_RATE_LIMIT_MESSAGE,
  OTP_RATE_LIMIT_RETRY_SECONDS,
} from "@/lib/auth/constants";
import { isRateLimitError } from "@/lib/auth/errors";
import { normalizeEmail } from "@/lib/auth/normalize";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const normalizedEmail = normalizeEmail(body.email ?? "");

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!isAdminEmail(normalizedEmail)) {
    return NextResponse.json(
      { error: "This email is not authorized for admin access." },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: { shouldCreateUser: false },
  });

  if (error) {
    const rateLimited = isRateLimitError(
      error.message,
      error.status,
      error.code
    );

    return NextResponse.json(
      {
        error: rateLimited ? OTP_RATE_LIMIT_MESSAGE : error.message,
        retryAfterSeconds: rateLimited ? OTP_RATE_LIMIT_RETRY_SECONDS : undefined,
      },
      { status: rateLimited ? 429 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
