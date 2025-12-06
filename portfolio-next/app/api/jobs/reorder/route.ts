import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { jobIds } = await request.json();

    if (!jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update sort_order for each job
    const updates = jobIds.map((id: string, index: number) =>
      supabase.from("jobs").update({ sort_order: index }).eq("id", id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering jobs:", error);
    return NextResponse.json(
      { error: "Failed to reorder jobs" },
      { status: 500 }
    );
  }
}
