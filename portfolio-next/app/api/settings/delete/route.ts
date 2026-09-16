import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) {
    return NextResponse.json({ error: "Missing settings ID" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("settings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/settings");

  return NextResponse.redirect(new URL("/admin/settings", request.url), {
    status: 303,
  });
}
