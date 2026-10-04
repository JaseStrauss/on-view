import type { Artwork, ArtworkFormData, ArtworkStatus } from "@/types/artwork";

export const ARTWORK_STATUS_OPTIONS: {
  value: ArtworkStatus;
  label: string;
}[] = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "on_loan", label: "On loan" },
  { value: "reserved", label: "Reserved" },
];

export const ARTWORK_STATUS_LABELS = Object.fromEntries(
  ARTWORK_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ArtworkStatus, string>;

export function formatArtworkStatus(status: ArtworkStatus): string {
  return ARTWORK_STATUS_LABELS[status];
}

export function artworkToFormData(artwork: Artwork): ArtworkFormData {
  return {
    title: artwork.title,
    artist: artwork.artist,
    year: artwork.year?.toString() ?? "",
    medium: artwork.medium ?? "",
    width_cm: artwork.width_cm?.toString() ?? "",
    height_cm: artwork.height_cm?.toString() ?? "",
    status: artwork.status,
    description: artwork.description ?? "",
    condition_notes: artwork.condition_notes ?? "",
  };
}

export function filterArtworks(
  artworks: Artwork[],
  query: string,
  statusFilter: ArtworkStatus | "all",
): Artwork[] {
  const normalizedQuery = query.trim().toLowerCase();

  return artworks.filter((artwork) => {
    if (statusFilter !== "all" && artwork.status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      artwork.title,
      artwork.artist,
      artwork.medium ?? "",
      artwork.description ?? "",
      artwork.year?.toString() ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
