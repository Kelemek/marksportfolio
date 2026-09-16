export async function requestRevalidate(projectSlug?: string) {
  const response = await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectSlug ? { slug: projectSlug } : {}),
  });

  if (!response.ok) {
    throw new Error("Failed to revalidate public content");
  }
}
