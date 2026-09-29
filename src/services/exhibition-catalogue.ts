import { supabase } from "@/lib/supabase";
import type { Artwork } from "@/types/artwork";

export async function addArtworksToExhibitionCatalogue(
  exhibitionId: string,
  artworkIds: string[],
): Promise<void> {
  for (const artworkId of artworkIds) {
    await addArtworkToExhibitionCatalogue(exhibitionId, artworkId);
  }
}

export async function addArtworkToExhibitionCatalogue(
  exhibitionId: string,
  artworkId: string,
): Promise<void> {
  const { count, error: countError } = await supabase
    .from("exhibition_catalogue")
    .select("*", { count: "exact", head: true })
    .eq("exhibition_id", exhibitionId);

  if (countError) throw countError;

  const { error } = await supabase.from("exhibition_catalogue").upsert(
    {
      exhibition_id: exhibitionId,
      artwork_id: artworkId,
      sort_order: count ?? 0,
    },
    { onConflict: "exhibition_id,artwork_id" },
  );

  if (error) throw error;
}

export async function fetchExhibitionCatalogueArtworkIds(
  exhibitionId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("exhibition_catalogue")
    .select("artwork_id")
    .eq("exhibition_id", exhibitionId)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => row.artwork_id as string);
}

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
