import { useCallback, useEffect, useState } from "react";
import { DEMO_SLUG, getDemoPublicShow } from "@/data/demo-exhibition";
import {
  DEMO_BUILDER_SLUG,
  getDemoSandboxPublicShow,
} from "@/lib/demo-sandbox";
import { supabase } from "@/lib/supabase";
import { buildRoomTemplate, slugify } from "@/rooms/templates";
import { mergeRoomConfig, type RoomConfig } from "@/rooms/room-config";
import { reclampPlacement } from "@/lib/reclamp-placements";
import { addArtworkToExhibitionCatalogue } from "@/services/exhibition-catalogue";
import { duplicateExhibition as duplicateExhibitionRecord } from "@/services/exhibitions";
import { fetchPublicPresenterName } from "@/services/profile";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, Placement, PlacementWithArtwork } from "@/types";

function normalizeExhibition(row: Exhibition): Exhibition {
  return {
    ...row,
    featuring_override: row.featuring_override ?? null,
    room_config: mergeRoomConfig(row.room_template_id, row.room_config ?? {}),
  };
}

export function useExhibitions(userId: string | undefined) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setExhibitions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("exhibitions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setExhibitions((data as Exhibition[]).map(normalizeExhibition));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createExhibition = async (
    title: string,
    roomTemplateId: string,
    description?: string,
    roomConfig?: RoomConfig,
  ) => {
    if (!userId) throw new Error("Not signed in");
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const config = mergeRoomConfig(roomTemplateId, roomConfig);

    const { data, error } = await supabase
      .from("exhibitions")
      .insert({
        user_id: userId,
        title,
        description: description ?? null,
        slug,
        room_template_id: roomTemplateId,
        room_config: config,
      })
      .select()
      .single();
    if (error) throw error;

    const exhibition = data as Exhibition;

    await refresh();
    return exhibition;
  };

  const deleteExhibition = async (id: string) => {
    const { error } = await supabase.from("exhibitions").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const duplicateExhibition = async (id: string) => {
    if (!userId) throw new Error("Not signed in");
    const copy = await duplicateExhibitionRecord(id, userId);
    await refresh();
    return copy;
  };

  return {
    exhibitions,
    loading,
    refresh,
    createExhibition,
    deleteExhibition,
    duplicateExhibition,
  };
}

export function useExhibitionDetail(exhibitionId: string | undefined) {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [placements, setPlacements] = useState<PlacementWithArtwork[]>([]);
  const [catalogueArtworkIds, setCatalogueArtworkIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!exhibitionId) return;
    setLoading(true);

    const [exRes, plRes, catRes] = await Promise.all([
      supabase.from("exhibitions").select("*").eq("id", exhibitionId).single(),
      supabase
        .from("placements")
        .select("*, artwork:artworks(*)")
        .eq("exhibition_id", exhibitionId)
        .order("sort_order"),
      supabase
        .from("exhibition_catalogue")
        .select("artwork_id")
        .eq("exhibition_id", exhibitionId)
        .order("sort_order"),
    ]);

    if (exRes.data)
      setExhibition(normalizeExhibition(exRes.data as Exhibition));
    if (plRes.data) {
      setPlacements(
        (
          plRes.data as Array<
            Placement & { artwork: PlacementWithArtwork["artwork"] }
          >
        ).map((row) => ({
          ...row,
          position_x: Number(row.position_x),
          position_y: Number(row.position_y),
          scale: Number(row.scale) || 1,
          rotation_deg: Number(row.rotation_deg) || 0,
          artwork: row.artwork,
        })),
      );
    }
    if (catRes.data) {
      setCatalogueArtworkIds(
        catRes.data.map((row) => row.artwork_id as string),
      );
    } else {
      setCatalogueArtworkIds([]);
    }
    setLoading(false);
  }, [exhibitionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateExhibition = async (patch: Partial<Exhibition>) => {
    if (!exhibitionId) return;
    const { error } = await supabase
      .from("exhibitions")
      .update(patch)
      .eq("id", exhibitionId);
    if (error) throw error;
    await refresh();
  };

  const addPlacement = async (
    artworkId: string,
    wallId: string,
    positionX = 0,
    positionY = 1.45,
  ) => {
    if (!exhibitionId) return;
    await addArtworkToExhibitionCatalogue(exhibitionId, artworkId);
    const sortOrder = placements.length;
    const { error } = await supabase.from("placements").insert({
      exhibition_id: exhibitionId,
      artwork_id: artworkId,
      wall_id: wallId,
      position_x: positionX,
      position_y: positionY,
      rotation_deg: 0,
      sort_order: sortOrder,
    });
    if (error) throw error;
    await refresh();
  };

  const updatePlacement = async (
    placementId: string,
    patch: Partial<
      Pick<
        Placement,
        "wall_id" | "position_x" | "position_y" | "scale" | "rotation_deg"
      >
    >,
  ) => {
    setPlacements((prev) =>
      prev.map((placement) => {
        if (placement.id !== placementId) return placement;
        const next = { ...placement, ...patch };
        if (patch.rotation_deg !== undefined) {
          next.rotation_deg = Number(patch.rotation_deg);
        }
        if (patch.scale !== undefined) {
          next.scale = Number(patch.scale);
        }
        return next;
      }),
    );

    const { error } = await supabase
      .from("placements")
      .update(patch)
      .eq("id", placementId);
    if (error) {
      await refresh();
      throw error;
    }
  };

  const removePlacement = async (placementId: string) => {
    const { error } = await supabase
      .from("placements")
      .delete()
      .eq("id", placementId);
    if (error) throw error;
    await refresh();
  };

  const applyRoomSettings = async (templateId: string, config: RoomConfig) => {
    if (!exhibitionId || !exhibition) return;

    const merged = mergeRoomConfig(templateId, config);
    const room = buildRoomTemplate(templateId, merged);
    const validWallIds = new Set(room.walls.map((wall) => wall.id));

    const { error: exhibitionError } = await supabase
      .from("exhibitions")
      .update({
        room_template_id: templateId,
        room_config: merged,
      })
      .eq("id", exhibitionId);
    if (exhibitionError) throw exhibitionError;

    for (const placement of placements) {
      if (!validWallIds.has(placement.wall_id)) {
        const { error } = await supabase
          .from("placements")
          .delete()
          .eq("id", placement.id);
        if (error) throw error;
        continue;
      }

      const next = reclampPlacement(placement, room);
      if (
        next.position_x !== placement.position_x ||
        next.position_y !== placement.position_y
      ) {
        const { error } = await supabase
          .from("placements")
          .update(next)
          .eq("id", placement.id);
        if (error) throw error;
      }
    }

    await refresh();
  };

  return {
    exhibition,
    placements,
    catalogueArtworkIds,
    loading,
    refresh,
    updateExhibition,
    applyRoomSettings,
    addPlacement,
    updatePlacement,
    removePlacement,
  };
}

export async function fetchPublicExhibition(slug: string) {
  if (slug === DEMO_SLUG) {
    return getDemoPublicShow();
  }

  if (slug === DEMO_BUILDER_SLUG || slug === "sandbox") {
    return getDemoSandboxPublicShow();
  }

  const { data: exhibition, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !exhibition) return null;

  const [{ data: placements }, { data: catalogueRows }] = await Promise.all([
    supabase
      .from("placements")
      .select("*, artwork:artworks(*)")
      .eq("exhibition_id", exhibition.id)
      .order("sort_order"),
    supabase
      .from("exhibition_catalogue")
      .select("artwork:artworks(*)")
      .eq("exhibition_id", exhibition.id)
      .order("sort_order"),
  ]);

  const catalogueArtworks = (catalogueRows ?? [])
    .map((row) => {
      const artwork = row.artwork;
      if (!artwork || Array.isArray(artwork)) return null;
      return artwork as Artwork;
    })
    .filter((artwork): artwork is Artwork => artwork !== null);

  const presenterName = await fetchPublicPresenterName(exhibition.user_id);

  return {
    exhibition: normalizeExhibition(exhibition as Exhibition),
    placements: (placements ?? []) as PlacementWithArtwork[],
    catalogueArtworks,
    presenterName,
  };
}
