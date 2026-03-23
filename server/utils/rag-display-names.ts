export function createDisplayNameFromContent(content: string) {
  const firstNonEmptyLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const base = (firstNonEmptyLine || "notes")
    .replace(/^#+\s*/, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 48);

  return `${base || "notes"}-${Date.now()}`;
}
