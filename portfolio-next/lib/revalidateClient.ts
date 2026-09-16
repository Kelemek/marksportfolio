export async function requestRevalidate(projectSlug?: string) {
  await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectSlug ? { slug: projectSlug } : {}),
  });
}
