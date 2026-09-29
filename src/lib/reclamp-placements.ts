import { artworkSizeM, clampPlacement } from "@/lib/wall-coordinates";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";

export function reclampPlacement(
  placement: PlacementWithArtwork,
  room: RoomTemplate,
): { position_x: number; position_y: number } {
  const wall = room.walls.find((w) => w.id === placement.wall_id);
  if (!wall) {
    return {
      position_x: placement.position_x,
      position_y: placement.position_y,
    };
  }

  const sizeM = artworkSizeM(
    placement.artwork.width_cm,
    placement.artwork.height_cm,
    placement.scale,
  );
  const clamped = clampPlacement(
    { x: placement.position_x, y: placement.position_y },
    sizeM,
    wall,
  );

  return { position_x: clamped.x, position_y: clamped.y };
}

export function reclampPlacements(
  placements: PlacementWithArtwork[],
  room: RoomTemplate,
): Array<{ id: string; position_x: number; position_y: number }> {
  return placements.map((placement) => ({
    id: placement.id,
    ...reclampPlacement(placement, room),
  }));
}
