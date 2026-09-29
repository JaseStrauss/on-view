import type { Artwork } from "@/types/artwork";

export function formatDimensions(
  widthCm: number | null,
  heightCm: number | null,
): string | null {
  if (widthCm && heightCm) return `${widthCm} × ${heightCm} cm`;
  if (widthCm) return `${widthCm} cm wide`;
  if (heightCm) return `${heightCm} cm high`;
  return null;
}

/** Single-line catalogue line: *Title*, Year */
export function formatTitleLine(
  artwork: Pick<Artwork, "title" | "year">,
): string {
  if (artwork.year) {
    return `${artwork.title}, ${artwork.year}`;
  }
  return artwork.title;
}

/** Secondary lines: medium · dimensions */
export function formatMediumLine(
  artwork: Pick<Artwork, "medium" | "width_cm" | "height_cm">,
): string | null {
  const parts: string[] = [];
  if (artwork.medium) parts.push(artwork.medium);
  const dimensions = formatDimensions(artwork.width_cm, artwork.height_cm);
  if (dimensions) parts.push(dimensions);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export { formatExhibitionDates } from "@/lib/exhibition-details";
