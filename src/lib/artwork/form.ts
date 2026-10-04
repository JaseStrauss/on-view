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

export function parseDimensionCm(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function validateDimensionFields(
  widthCm: string,
  heightCm: string,
): string | null {
  if (!parseDimensionCm(widthCm)) {
    return "Width (cm) is required and must be a positive number.";
  }
  if (!parseDimensionCm(heightCm)) {
    return "Height (cm) is required and must be a positive number.";
  }
  return null;
}

export function assertArtworkFormValid(form: ArtworkFormData): void {
  if (!form.title.trim()) {
    throw new Error("Title is required.");
  }
  const dimensionError = validateDimensionFields(form.width_cm, form.height_cm);
  if (dimensionError) {
    throw new Error(dimensionError);
  }
}

export function artworkFormToDbFields(form: ArtworkFormData) {
  assertArtworkFormValid(form);
  return {
    title: form.title.trim(),
    artist: form.artist.trim(),
    year: form.year ? Number(form.year) : null,
    medium: form.medium.trim() || null,
    width_cm: parseDimensionCm(form.width_cm)!,
    height_cm: parseDimensionCm(form.height_cm)!,
    status: form.status,
    description: form.description.trim() || null,
    condition_notes: form.condition_notes.trim() || null,
  };
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
