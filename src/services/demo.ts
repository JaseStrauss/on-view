import {
  DEMO_ARTWORK_DEFINITIONS,
  DEMO_PLACEMENT_SPECS,
} from "@/data/demo-exhibition";
import { supabase } from "@/lib/supabase";

export async function seedDemoForUser(userId: string): Promise<void> {
  const { data: existingArtworks } = await supabase
    .from("artworks")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  const { data: existingExhibitions } = await supabase
    .from("exhibitions")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existingArtworks?.length || existingExhibitions?.length) {
    return;
  }

  const { data: artworks, error: artworkError } = await supabase
    .from("artworks")
    .insert(
      DEMO_ARTWORK_DEFINITIONS.map((definition) => ({
        user_id: userId,
        title: definition.title,
        artist: definition.artist,
        year: definition.year,
        medium: definition.medium,
        width_cm: definition.width_cm,
        height_cm: definition.height_cm,
        status: "available",
        image_path: definition.image_path,
        description: definition.description,
        condition_notes: definition.attribution,
      })),
    )
    .select();

  if (artworkError) throw artworkError;
  if (!artworks?.length) return;

  const artworksByKey = new Map(
    DEMO_ARTWORK_DEFINITIONS.map((definition, index) => [
      definition.key,
      artworks[index],
    ]),
  );

  const { data: exhibition, error: exhibitionError } = await supabase
    .from("exhibitions")
    .insert({
      user_id: userId,
      title: "Sample Exhibition",
      description:
        "A starter show with sample works. Edit, publish, or replace them with your own catalogue.",
      slug: `sample-${Date.now().toString(36)}`,
      room_template_id: "white-cube",
      is_published: false,
    })
    .select()
    .single();

  if (exhibitionError) throw exhibitionError;

  const placementRows = DEMO_PLACEMENT_SPECS.map((spec) => {
    const artwork = artworksByKey.get(spec.artworkKey);
    if (!artwork) throw new Error(`Missing demo artwork: ${spec.artworkKey}`);

    return {
      exhibition_id: exhibition.id,
      artwork_id: artwork.id,
      wall_id: spec.wall_id,
      position_x: spec.position_x,
      position_y: spec.position_y,
      scale: spec.scale,
      rotation_deg: 0,
      sort_order: spec.sort_order,
    };
  });

  const { error: placementError } = await supabase
    .from("placements")
    .insert(placementRows);

  if (placementError) throw placementError;

  const { error: catalogueError } = await supabase
    .from("exhibition_catalogue")
    .insert(
      artworks.map((artwork, index) => ({
        exhibition_id: exhibition.id,
        artwork_id: artwork.id,
        sort_order: index,
      })),
    );

  if (catalogueError) throw catalogueError;
}
