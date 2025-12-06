import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { category, certificateIds } = await request.json();

    if (!category || !certificateIds || !Array.isArray(certificateIds)) {
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

    // Update sort_order for each certificate
    const updates = certificateIds.map((id: string, index: number) =>
      supabase
        .from("certificates")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("category", category)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering certificates:", error);
    return NextResponse.json(
      { error: "Failed to reorder certificates" },
      { status: 500 }
    );
  }
}
