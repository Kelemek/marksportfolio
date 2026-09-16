import { requireAdmin } from "@/lib/auth/requireAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { category, skillIds } = await request.json();

    if (!category || !skillIds || !Array.isArray(skillIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const auth = await requireAdmin();
    if (auth.error) {
      return auth.error;
    }

    const updates = skillIds.map((id: string, index: number) =>
      auth.supabase
        .from("skills")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("category", category)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering skills:", error);
    return NextResponse.json(
      { error: "Failed to reorder skills" },
      { status: 500 }
    );
  }
}
