import { describe, expect, it } from "vitest";
import type { Artwork } from "@/types/artwork";
import {
  artworkMatchesYearRange,
  countCatalogueActiveFilters,
  formatYearRangeLabel,
  getCatalogueFilterOptions,
  getCatalogueYearExtent,
  groupArtworksByYear,
  normalizeYearRange,
  organizeCatalogueArtworks,
  sortArtworks,
} from "@/lib/catalogue-view";

function artwork(overrides: Partial<Artwork> & Pick<Artwork, "id">): Artwork {
  return {
    user_id: "user-1",
    title: "Untitled",
    artist: "Artist",
    year: null,
    medium: null,
    width_cm: null,
    height_cm: null,
    status: "available",
    description: null,
    condition_notes: null,
    image_path: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeYearRange", () => {
  it("swaps inverted from/to years", () => {
    expect(normalizeYearRange({ from: "2020", to: "2010" })).toEqual({
      from: 2010,
      to: 2020,
    });
  });

  it("parses partial ranges", () => {
    expect(normalizeYearRange({ from: "1999", to: "" })).toEqual({
      from: 1999,
      to: null,
    });
  });
});

describe("formatYearRangeLabel", () => {
  it("returns null when range is empty", () => {
    expect(formatYearRangeLabel({ from: "", to: "" })).toBeNull();
  });

  it("formats a closed range", () => {
    expect(formatYearRangeLabel({ from: "2010", to: "2020" })).toBe(
      "2010–2020",
    );
  });
});

describe("artworkMatchesYearRange", () => {
  it("excludes undated works when a range is active", () => {
    const piece = artwork({ id: "a", year: null });
    expect(artworkMatchesYearRange(piece, { from: "2000", to: "2010" })).toBe(
      false,
    );
  });

  it("includes works within bounds", () => {
    const piece = artwork({ id: "a", year: 2005 });
    expect(artworkMatchesYearRange(piece, { from: "2000", to: "2010" })).toBe(
      true,
    );
  });
});

describe("sortArtworks", () => {
  it("sorts by title A–Z with artist as tiebreaker", () => {
    const sorted = sortArtworks(
      [
        artwork({ id: "b", title: "Beta", artist: "Zed" }),
        artwork({ id: "a", title: "Alpha", artist: "Ann" }),
        artwork({ id: "c", title: "Beta", artist: "Ann" }),
      ],
      "title",
    );

    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("puts null years last when sorting year descending", () => {
    const sorted = sortArtworks(
      [
        artwork({ id: "old", title: "Old", year: 1990 }),
        artwork({ id: "new", title: "New", year: 2020 }),
        artwork({ id: "undated", title: "?", year: null }),
      ],
      "year_desc",
    );

    expect(sorted.map((item) => item.id)).toEqual(["new", "old", "undated"]);
  });
});

describe("getCatalogueYearExtent", () => {
  it("returns null bounds when no dated works exist", () => {
    expect(getCatalogueYearExtent([artwork({ id: "a", year: null })])).toEqual({
      min: null,
      max: null,
    });
  });

  it("finds min and max year", () => {
    expect(
      getCatalogueYearExtent([
        artwork({ id: "a", year: 2010 }),
        artwork({ id: "b", year: 1998 }),
        artwork({ id: "c", year: null }),
      ]),
    ).toEqual({ min: 1998, max: 2010 });
  });
});

describe("countCatalogueActiveFilters", () => {
  it("counts status, field filters, and year range", () => {
    expect(
      countCatalogueActiveFilters("sold", ["Alice"], ["Oil", "Acrylic"], {
        from: "2000",
        to: "",
      }),
    ).toBe(5);
  });
});

describe("getCatalogueFilterOptions", () => {
  it("returns unique sorted artists", () => {
    const options = getCatalogueFilterOptions(
      [
        artwork({ id: "a", artist: "Zoe" }),
        artwork({ id: "b", artist: "Ann" }),
        artwork({ id: "c", artist: "Ann" }),
      ],
      "artist",
    );

    expect(options).toEqual(["Ann", "Zoe"]);
  });

  it("ignores blank medium values", () => {
    const options = getCatalogueFilterOptions(
      [
        artwork({ id: "a", medium: "Oil" }),
        artwork({ id: "b", medium: "  " }),
        artwork({ id: "c", medium: null }),
      ],
      "medium",
    );

    expect(options).toEqual(["Oil"]);
  });
});

describe("groupArtworksByYear", () => {
  it("groups by year with undated label and orders newest first for year_desc", () => {
    const groups = groupArtworksByYear(
      [
        artwork({ id: "a", title: "A", year: 2010 }),
        artwork({ id: "b", title: "B", year: 2020 }),
        artwork({ id: "c", title: "C", year: null }),
      ],
      "year_desc",
    );

    expect(groups.map((g) => g.label)).toEqual(["2020", "2010", "Undated"]);
    expect(groups[0]?.artworks.map((item) => item.id)).toEqual(["b"]);
  });
});

describe("organizeCatalogueArtworks", () => {
  const catalogue = [
    artwork({
      id: "match",
      title: "Harbour",
      artist: "Alice",
      medium: "Oil",
      year: 2015,
      status: "available",
      description: "Evening light",
    }),
    artwork({
      id: "sold",
      title: "Other",
      artist: "Bob",
      medium: "Acrylic",
      year: 2020,
      status: "sold",
    }),
    artwork({
      id: "old",
      title: "Sketch",
      artist: "Alice",
      medium: "Charcoal",
      year: 1990,
      status: "available",
    }),
  ];

  it("filters by status, artist, year, and search query", () => {
    const { artworks } = organizeCatalogueArtworks(
      catalogue,
      "harbour",
      "available",
      ["Alice"],
      [],
      { from: "2000", to: "2020" },
      "title",
      false,
    );

    expect(artworks.map((item) => item.id)).toEqual(["match"]);
  });

  it("returns year groups when groupByYear is true", () => {
    const { groups } = organizeCatalogueArtworks(
      catalogue,
      "",
      "all",
      [],
      [],
      { from: "", to: "" },
      "year_desc",
      true,
    );

    expect(groups.length).toBeGreaterThan(0);
    expect(groups.some((g) => g.year === 2020)).toBe(true);
  });
});
