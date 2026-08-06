export function formatDateSafe(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
