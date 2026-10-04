import type { Artwork, ArtworkStatus } from "@/types/artwork";

export type CatalogueSortKey =
  | "recent"
  | "year_desc"
  | "year_asc"
  | "title"
  | "artist";

export const CATALOGUE_SORT_OPTIONS: {
  value: CatalogueSortKey;
  label: string;
}[] = [
  { value: "recent", label: "Recently added" },
  { value: "year_desc", label: "Year (newest)" },
  { value: "year_asc", label: "Year (oldest)" },
  { value: "title", label: "Title (A–Z)" },
  { value: "artist", label: "Artist (A–Z)" },
];

export interface YearCatalogueGroup {
  label: string;
  year: number | null;
  artworks: Artwork[];
}

export interface CatalogueYearRange {
  from: string;
  to: string;
}

export const EMPTY_YEAR_RANGE: CatalogueYearRange = {
  from: "",
  to: "",
};

export interface CatalogueYearExtent {
  min: number | null;
  max: number | null;
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function compareYearNullsLast(
  left: number | null,
  right: number | null,
  direction: "asc" | "desc",
): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  return direction === "asc" ? left - right : right - left;
}

export function sortArtworks(
  artworks: Artwork[],
  sortKey: CatalogueSortKey,
): Artwork[] {
  const sorted = [...artworks];

  sorted.sort((left, right) => {
    switch (sortKey) {
      case "recent":
        return (
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
        );
      case "year_desc": {
        const yearCompare = compareYearNullsLast(left.year, right.year, "desc");
        if (yearCompare !== 0) return yearCompare;
        return compareText(left.title, right.title);
      }
      case "year_asc": {
        const yearCompare = compareYearNullsLast(left.year, right.year, "asc");
        if (yearCompare !== 0) return yearCompare;
        return compareText(left.title, right.title);
      }
      case "title": {
        const titleCompare = compareText(left.title, right.title);
        if (titleCompare !== 0) return titleCompare;
        return compareText(left.artist, right.artist);
      }
      case "artist": {
        const artistCompare = compareText(
          left.artist || "\uffff",
          right.artist || "\uffff",
        );
        if (artistCompare !== 0) return artistCompare;
        return compareText(left.title, right.title);
      }
      default:
        return 0;
    }
  });

  return sorted;
}

function parseYearInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;

  return Math.trunc(parsed);
}

export function getCatalogueYearExtent(
  artworks: Artwork[],
): CatalogueYearExtent {
  const years = artworks
    .map((artwork) => artwork.year)
    .filter((year): year is number => year !== null);

  if (years.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}

export function isYearRangeActive(range: CatalogueYearRange): boolean {
  return Boolean(range.from.trim() || range.to.trim());
}

export type CatalogueFieldFilter = string[];

export function getCatalogueFilterOptions(
  artworks: Artwork[],
  field: "artist" | "medium",
): string[] {
  const values = new Set<string>();

  for (const artwork of artworks) {
    const value =
      field === "artist" ? artwork.artist : (artwork.medium?.trim() ?? "");
    const trimmed = value.trim();
    if (trimmed) values.add(trimmed);
  }

  return Array.from(values).sort((left, right) => compareText(left, right));
}

function artworkMatchesFieldFilter(
  value: string | null | undefined,
  filter: CatalogueFieldFilter,
): boolean {
  if (filter.length === 0) return true;

  const normalized = value?.trim().toLowerCase() ?? "";
  return filter.some((item) => normalized === item.trim().toLowerCase());
}

export function countCatalogueActiveFilters(
  statusFilter: ArtworkStatus | "all",
  artistFilter: CatalogueFieldFilter,
  mediumFilter: CatalogueFieldFilter,
  yearRange: CatalogueYearRange,
): number {
  let count = 0;
  if (statusFilter !== "all") count += 1;
  count += artistFilter.length;
  count += mediumFilter.length;
  if (isYearRangeActive(yearRange)) count += 1;
  return count;
}

export function normalizeYearRange(range: CatalogueYearRange): {
  from: number | null;
  to: number | null;
} {
  let from = parseYearInput(range.from);
  let to = parseYearInput(range.to);

  if (from !== null && to !== null && from > to) {
    [from, to] = [to, from];
  }

  return {
    from,
    to,
  };
}

export function formatYearRangeLabel(range: CatalogueYearRange): string | null {
  if (!isYearRangeActive(range)) return null;

  const { from, to } = normalizeYearRange(range);

  if (from !== null && to !== null) {
    return `${from}–${to}`;
  }

  if (from !== null) {
    return `from ${from}`;
  }

  if (to !== null) {
    return `through ${to}`;
  }

  return null;
}

export function artworkMatchesYearRange(
  artwork: Artwork,
  range: CatalogueYearRange,
): boolean {
  if (!isYearRangeActive(range)) return true;

  const { from, to } = normalizeYearRange(range);

  if (artwork.year === null) {
    return false;
  }

  if (from !== null && artwork.year < from) return false;
  if (to !== null && artwork.year > to) return false;

  return true;
}

export function groupArtworksByYear(
  artworks: Artwork[],
  sortKey: CatalogueSortKey,
): YearCatalogueGroup[] {
  const sorted = sortArtworks(artworks, sortKey);
  const groups = new Map<string, YearCatalogueGroup>();

  for (const artwork of sorted) {
    const label = artwork.year?.toString() ?? "Undated";
    const existing = groups.get(label);

    if (existing) {
      existing.artworks.push(artwork);
      continue;
    }

    groups.set(label, {
      label,
      year: artwork.year,
      artworks: [artwork],
    });
  }

  const groupDirection =
    sortKey === "year_asc"
      ? "asc"
      : sortKey === "year_desc" || sortKey === "recent"
        ? "desc"
        : "desc";

  return Array.from(groups.values()).sort((left, right) =>
    compareYearNullsLast(left.year, right.year, groupDirection),
  );
}

export function organizeCatalogueArtworks(
  artworks: Artwork[],
  query: string,
  statusFilter: ArtworkStatus | "all",
  artistFilter: CatalogueFieldFilter,
  mediumFilter: CatalogueFieldFilter,
  yearRange: CatalogueYearRange,
  sortKey: CatalogueSortKey,
  groupByYear: boolean,
): {
  artworks: Artwork[];
  groups: YearCatalogueGroup[];
} {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = artworks.filter((artwork) => {
    if (statusFilter !== "all" && artwork.status !== statusFilter) {
      return false;
    }

    if (!artworkMatchesFieldFilter(artwork.artist, artistFilter)) {
      return false;
    }

    if (!artworkMatchesFieldFilter(artwork.medium, mediumFilter)) {
      return false;
    }

    if (!artworkMatchesYearRange(artwork, yearRange)) {
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

  const sorted = sortArtworks(filtered, sortKey);

  return {
    artworks: sorted,
    groups: groupByYear ? groupArtworksByYear(filtered, sortKey) : [],
  };
}
