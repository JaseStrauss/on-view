import type { PlacementWithArtwork, RoomTemplate } from "@/types";

export interface GalleryRoomProps {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  interactive?: boolean;
  /** Slow orbit for ambient previews */
  autoRotate?: boolean;
  className?: string;
  selectedPlacementId?: string | null;
  onSelectPlacement?: (placementId: string | null) => void;
  showWallPresets?: boolean;
}
