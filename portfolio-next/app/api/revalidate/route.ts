import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePublicContent } from "@/lib/revalidate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
  };

  revalidatePublicContent(body.slug);

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
