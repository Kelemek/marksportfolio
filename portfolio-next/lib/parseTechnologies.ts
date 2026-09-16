export function parseTechnologies(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return (raw as string[]).filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}
