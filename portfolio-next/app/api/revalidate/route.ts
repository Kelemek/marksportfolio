import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidatePath("/");
  revalidatePath("/admin");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
