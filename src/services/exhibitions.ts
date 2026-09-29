import { supabase } from "@/lib/supabase";
import { mergeRoomConfig } from "@/rooms/room-config";
import { slugify } from "@/rooms/templates";
import type { Exhibition } from "@/types";

function normalizeExhibition(row: Exhibition): Exhibition {
  return {
    ...row,
    featuring_override: row.featuring_override ?? null,
    room_config: mergeRoomConfig(row.room_template_id, row.room_config ?? {}),
  };
}

export async function duplicateExhibition(
  sourceExhibitionId: string,
  userId: string,
): Promise<Exhibition> {
  const [exRes, plRes, catRes] = await Promise.all([
    supabase
      .from("exhibitions")
      .select("*")
      .eq("id", sourceExhibitionId)
      .single(),
    supabase
      .from("placements")
      .select("*")
      .eq("exhibition_id", sourceExhibitionId)
      .order("sort_order"),
    supabase
      .from("exhibition_catalogue")
      .select("artwork_id, sort_order")
      .eq("exhibition_id", sourceExhibitionId)
      .order("sort_order"),
  ]);

  if (exRes.error || !exRes.data) {
    throw exRes.error ?? new Error("Exhibition not found");
  }

  const source = exRes.data as Exhibition;
  if (source.user_id !== userId) {
    throw new Error("Not allowed to duplicate this exhibition");
  }

  const copyTitle = `Copy of ${source.title}`;
  const slug = `${slugify(copyTitle)}-${Date.now().toString(36)}`;

  const { data: created, error: createError } = await supabase
    .from("exhibitions")
    .insert({
      user_id: userId,
      title: copyTitle,
      description: source.description,
      slug,
      room_template_id: source.room_template_id,
      room_config: source.room_config ?? {},
      featuring_override: source.featuring_override,
      opens_at: source.opens_at,
      closes_at: source.closes_at,
      is_published: false,
    })
    .select()
    .single();

  if (createError || !created) {
    throw createError ?? new Error("Could not duplicate exhibition");
  }

  const newExhibitionId = created.id;

  if (catRes.data && catRes.data.length > 0) {
    const { error } = await supabase.from("exhibition_catalogue").insert(
      catRes.data.map((row) => ({
        exhibition_id: newExhibitionId,
        artwork_id: row.artwork_id as string,
        sort_order: row.sort_order as number,
      })),
    );
    if (error) throw error;
  }

  if (plRes.data && plRes.data.length > 0) {
    const { error } = await supabase.from("placements").insert(
      plRes.data.map((row) => ({
        exhibition_id: newExhibitionId,
        artwork_id: row.artwork_id,
        wall_id: row.wall_id,
        position_x: row.position_x,
        position_y: row.position_y,
        scale: row.scale,
        rotation_deg: row.rotation_deg,
        sort_order: row.sort_order,
      })),
    );
    if (error) throw error;
  }

  return normalizeExhibition(created as Exhibition);
}
