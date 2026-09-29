import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

export type ExhibitionDetailsPatch = Pick<
  Exhibition,
  "description" | "opens_at" | "closes_at" | "featuring_override"
>;

export function uniqueArtistsFromArtworks(
  artworks: Array<Pick<Artwork, "artist"> | null | undefined>,
): string[] {
  const seen = new Set<string>();
  const artists: string[] = [];

  for (const artwork of artworks) {
    const name = artwork?.artist?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push(name);
  }

  return artists.sort((a, b) => a.localeCompare(b));
}

export function formatArtistList(artists: string[]): string | null {
  if (artists.length === 0) return null;
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return `${artists[0]} and ${artists[1]}`;
  return `${artists.slice(0, -1).join(", ")}, and ${artists[artists.length - 1]}`;
}

export function deriveExhibitionArtists(
  catalogueArtworks: Artwork[],
  placements: PlacementWithArtwork[],
  catalogueIsScoped: boolean,
): string[] {
  if (catalogueIsScoped) {
    return uniqueArtistsFromArtworks(catalogueArtworks);
  }
  return uniqueArtistsFromArtworks(
    placements.map((placement) => placement.artwork),
  );
}

export function resolveFeaturingLine(
  exhibition: Pick<Exhibition, "featuring_override">,
  derivedArtists: string[],
): string | null {
  const override = exhibition.featuring_override?.trim();
  if (override) return override;
  const list = formatArtistList(derivedArtists);
  return list ? `Featuring ${list}` : null;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatSingleDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatExhibitionDates(
  opensAt: string | null,
  closesAt: string | null,
): string | null {
  if (opensAt && closesAt) {
    return `${formatSingleDate(opensAt)} – ${formatSingleDate(closesAt)}`;
  }
  if (opensAt) return `Opens ${formatSingleDate(opensAt)}`;
  if (closesAt) return `Until ${formatSingleDate(closesAt)}`;
  return null;
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
