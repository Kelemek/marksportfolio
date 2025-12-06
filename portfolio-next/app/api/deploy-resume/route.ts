import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_RESUME;

  if (!deployHookUrl) {
    return NextResponse.json(
      { error: "Deploy hook not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(deployHookUrl, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Deploy failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deploy failed" },
      { status: 500 }
    );
  }
}
