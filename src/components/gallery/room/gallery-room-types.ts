import type { PlacementWithArtwork, RoomTemplate } from "@/types";

/**
 * `preview` keeps image-based lighting but skips shadow maps and contact shadows
 * so editor/demo builder orbit stays responsive on busy pages.
 */
export type GalleryRenderQuality = "full" | "preview";

export interface GalleryRoomProps {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  /** @default "full" */
  quality?: GalleryRenderQuality;
  interactive?: boolean;
  /** Slow orbit for ambient previews */
  autoRotate?: boolean;
  className?: string;
  selectedPlacementId?: string | null;
  onSelectPlacement?: (placementId: string | null) => void;
  showWallPresets?: boolean;
  /** Fired when the visitor drags or zooms the 3D camera */
  onOrbitInteract?: () => void;
}
