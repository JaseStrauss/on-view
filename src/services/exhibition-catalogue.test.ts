import { describe, expect, it } from "vitest";
import type { Artwork } from "@/types/artwork";
import { filterExhibitionPaletteArtworks } from "@/services/exhibition-catalogue";

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
    image_path: "studio/a.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterExhibitionPaletteArtworks", () => {
  const studio = [
    artwork({ id: "a1" }),
    artwork({ id: "a2" }),
    artwork({ id: "a3", image_path: null }),
  ];

  it("uses full studio catalogue when exhibition has no catalogue rows", () => {
    const result = filterExhibitionPaletteArtworks(
      studio,
      new Set(),
      new Set(),
    );
    expect(result.map((a) => a.id)).toEqual(["a1", "a2"]);
  });

  it("limits palette to scoped catalogue artwork ids", () => {
    const result = filterExhibitionPaletteArtworks(
      studio,
      new Set(["a2"]),
      new Set(),
    );
    expect(result.map((a) => a.id)).toEqual(["a2"]);
  });

  it("excludes works without an image", () => {
    const result = filterExhibitionPaletteArtworks(
      [artwork({ id: "no-img", image_path: null })],
      new Set(["no-img"]),
      new Set(),
    );
    expect(result).toEqual([]);
  });

  it("excludes works already placed on a wall", () => {
    const result = filterExhibitionPaletteArtworks(
      studio,
      new Set(),
      new Set(["a1"]),
    );
    expect(result.map((a) => a.id)).toEqual(["a2"]);
  });
});
