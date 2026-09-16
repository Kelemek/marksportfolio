import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePublicContent } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) {
    return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
