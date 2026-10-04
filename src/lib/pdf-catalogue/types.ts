import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork, RoomTemplate } from "@/types";

export interface ExportCatalogueOptions {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  room: RoomTemplate;
  catalogueArtworks?: Artwork[];
}

export interface CatalogueImage {
  dataUrl: string;
  format: "JPEG" | "PNG";
  aspectRatio: number;
}
