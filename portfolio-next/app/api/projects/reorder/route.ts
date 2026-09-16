import { requireAdmin } from "@/lib/auth/requireAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type, projectIds } = await request.json();

    if (!type || !projectIds || !Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const auth = await requireAdmin();
    if (auth.error) {
      return auth.error;
    }

    const updates = projectIds.map((id: string, index: number) =>
      auth.supabase
        .from("projects")
        .update({ display_order: index })
        .eq("id", id)
        .eq("type", type)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering projects:", error);
    return NextResponse.json(
      { error: "Failed to reorder projects" },
      { status: 500 }
    );
  }
}
