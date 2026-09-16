export async function postAdminJson(
  path: string,
  body: Record<string, unknown>
): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
}
