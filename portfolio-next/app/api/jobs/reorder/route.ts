import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePublicContent } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return auth.error;
    }

    const { jobIds } = await request.json();

    if (!jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const updates = jobIds.map((id: string, index: number) =>
      auth.supabase.from("jobs").update({ sort_order: index }).eq("id", id)
    );

    await Promise.all(updates);

    revalidatePublicContent();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering jobs:", error);
    return NextResponse.json(
      { error: "Failed to reorder jobs" },
      { status: 500 }
    );
  }
}
