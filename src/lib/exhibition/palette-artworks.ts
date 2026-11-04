import type { Artwork } from "@/types/artwork";

/**
 * Palette works: in exhibition catalogue (when scoped), not on a wall, with an image.
 * If the exhibition has no catalogue rows yet, fall back to the full studio catalogue.
 */
export function filterExhibitionPaletteArtworks(
  artworks: Artwork[],
  catalogueArtworkIds: Set<string>,
  placedArtworkIds: Set<string>,
): Artwork[] {
  const useScopedCatalogue = catalogueArtworkIds.size > 0;

  return artworks.filter((artwork) => {
    if (!artwork.image_path) return false;
    if (placedArtworkIds.has(artwork.id)) return false;
    if (useScopedCatalogue) return catalogueArtworkIds.has(artwork.id);
    return true;
  });
}
