import { revalidatePath } from "next/cache";

export function revalidatePublicContent(projectSlug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");

  if (projectSlug) {
    revalidatePath(`/projects/${projectSlug}`);
  }
}
