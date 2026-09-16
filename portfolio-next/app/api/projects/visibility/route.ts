import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePublicContent } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id, is_visible } = await request.json();

    if (!id || typeof is_visible !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const auth = await requireAdmin();
    if (auth.error) {
      return auth.error;
    }

    const { error } = await auth.supabase
      .from("projects")
      .update({ is_visible })
      .eq("id", id);

    if (error) {
      throw error;
    }

    revalidatePublicContent();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    return NextResponse.json(
      { error: "Failed to toggle visibility" },
      { status: 500 }
    );
  }
}
