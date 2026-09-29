export type { Artwork, ArtworkStatus } from "./artwork";

export interface Exhibition {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  featuring_override: string | null;
  slug: string;
  room_template_id: string;
  room_config: import("@/rooms/room-config").RoomConfig;
  is_published: boolean;
  opens_at: string | null;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Placement {
  id: string;
  exhibition_id: string;
  artwork_id: string;
  wall_id: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation_deg: number;
  sort_order: number;
  created_at: string;
}

export interface PlacementWithArtwork extends Placement {
  artwork: import("./artwork").Artwork;
}

export interface WallDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  walls: WallDefinition[];
  /** Floor plane size in metres [width (x), depth (z)]. */
  floorSize: [number, number];
  /** Floor centre on the xz plane. Defaults to origin. */
  floorCenter?: [number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}
