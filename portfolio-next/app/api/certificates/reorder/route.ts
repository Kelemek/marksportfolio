import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePublicContent } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return auth.error;
    }

    const { category, certificateIds } = await request.json();

    if (!category || !certificateIds || !Array.isArray(certificateIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const updates = certificateIds.map((id: string, index: number) =>
      auth.supabase
        .from("certificates")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("category", category)
    );

    await Promise.all(updates);

    revalidatePublicContent();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering certificates:", error);
    return NextResponse.json(
      { error: "Failed to reorder certificates" },
      { status: 500 }
    );
  }
}
