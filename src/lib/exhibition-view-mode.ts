/**
 * Public exhibition view: catalogue-only vs 3D gallery.
 * Use `?view=` on share links to force an entry mode (overrides session preference).
 */
export function parseExhibitionViewQuery(
  value: string | null | undefined,
): boolean | null {
  if (value == null || value === "") return null;

  const normalized = value.toLowerCase().trim();

  if (
    normalized === "catalogue" ||
    normalized === "catalogue-only" ||
    normalized === "catalog" ||
    normalized === "list"
  ) {
    return true;
  }

  if (
    normalized === "gallery" ||
    normalized === "3d" ||
    normalized === "room" ||
    normalized === "virtual"
  ) {
    return false;
  }

  return null;
}
