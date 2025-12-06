import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) {
    return NextResponse.json({ error: "Missing settings ID" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("settings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/settings");

  return NextResponse.redirect(new URL("/admin/settings", request.url), {
    status: 303,
  });
}
