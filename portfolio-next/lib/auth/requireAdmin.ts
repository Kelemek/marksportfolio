import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type RequireAdminSuccess = {
  supabase: SupabaseClient;
  user: User;
  error?: undefined;
};

type RequireAdminFailure = {
  error: NextResponse;
  supabase?: undefined;
  user?: undefined;
};

export async function requireAdmin(): Promise<
  RequireAdminSuccess | RequireAdminFailure
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!user.email || !isAdminEmail(user.email)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { supabase, user };
}
