import { describe, expect, it } from "vitest";
import type { Artwork } from "@/types/artwork";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";
import { reclampPlacement } from "@/lib/reclamp-placements";

const baseArtwork: Artwork = {
  id: "art-1",
  user_id: "user-1",
  title: "Piece",
  artist: "Artist",
  year: 2020,
  medium: "Oil",
  width_cm: 60,
  height_cm: 80,
  status: "available",
  description: null,
  condition_notes: null,
  image_path: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const room: RoomTemplate = {
  id: "room-1",
  name: "Test room",
  description: "",
  floorSize: [6, 6],
  cameraPosition: [0, 1.6, 4],
  cameraTarget: [0, 1.4, 0],
  walls: [
    {
      id: "wall-a",
      label: "A",
      width: 4,
      height: 3,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
  ],
};

function placement(
  overrides: Partial<PlacementWithArtwork> = {},
): PlacementWithArtwork {
  return {
    id: "placement-1",
    exhibition_id: "ex-1",
    artwork_id: baseArtwork.id,
    wall_id: "wall-a",
    position_x: 0,
    position_y: 1.45,
    scale: 1,
    rotation_deg: 0,
    sort_order: 0,
    created_at: "2024-01-01T00:00:00.000Z",
    artwork: baseArtwork,
    ...overrides,
  };
}

describe("reclampPlacement", () => {
  it("returns original coordinates when wall is missing", () => {
    const input = placement({
      wall_id: "missing",
      position_x: 1.2,
      position_y: 0.9,
    });
    expect(reclampPlacement(input, room)).toEqual({
      position_x: 1.2,
      position_y: 0.9,
    });
  });

  it("clamps an out-of-bounds placement to the wall", () => {
    const input = placement({ position_x: 2, position_y: 2.9, scale: 1 });
    const result = reclampPlacement(input, room);

    expect(result.position_x).toBeLessThan(2);
    expect(result.position_y).toBeLessThan(2.9);
  });
});
