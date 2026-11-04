import { filterExhibitionPaletteArtworks } from "@/lib/exhibition/palette-artworks";
import { supabase } from "@/lib/supabase";

export { filterExhibitionPaletteArtworks };

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

export async function removeArtworkFromExhibitionCatalogue(
  exhibitionId: string,
  artworkId: string,
): Promise<void> {
  const { error: placementError } = await supabase
    .from("placements")
    .delete()
    .eq("exhibition_id", exhibitionId)
    .eq("artwork_id", artworkId);

  if (placementError) throw placementError;

  const { error } = await supabase
    .from("exhibition_catalogue")
    .delete()
    .eq("exhibition_id", exhibitionId)
    .eq("artwork_id", artworkId);

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
