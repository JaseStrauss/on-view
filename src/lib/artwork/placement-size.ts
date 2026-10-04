/**
 * Hang sizing for catalogue works: catalogue box in metres and visible footprint
 * (image aspect fit). Import from here for wall editor, 3D gallery, and reclamp.
 */
import { artworkSizeM } from "@/lib/gallery/wall-coordinates";
import type { Artwork } from "@/types/artwork";
import { artworkPlaneSizeM } from "@/lib/artwork/plane-size";

export interface ImageDimensionsPx {
  width: number;
  height: number;
}

export type ArtworkDimensions = Pick<Artwork, "width_cm" | "height_cm">;

function fitCatalogBoxToImageM(
  catalogWidthM: number,
  catalogHeightM: number,
  imagePx?: ImageDimensionsPx | null,
): { widthM: number; heightM: number } {
  if (!imagePx || imagePx.width <= 0 || imagePx.height <= 0) {
    return { widthM: catalogWidthM, heightM: catalogHeightM };
  }

  const plane = artworkPlaneSizeM(
    catalogWidthM,
    catalogHeightM,
    imagePx.width,
    imagePx.height,
  );
  return { widthM: plane.width, heightM: plane.height };
}

/** Catalogue hang box in metres (artwork cm × placement scale). */
export function catalogSizeForArtwork(
  artwork: ArtworkDimensions,
  scale = 1,
): { widthM: number; heightM: number } {
  return artworkSizeM(artwork.width_cm, artwork.height_cm, scale);
}

/**
 * Visible footprint on a wall: catalogue box fitted to image aspect when pixels
 * are known. Used for 2D frames, drag clamping, and reclamp.
 */
export function placementVisualSizeForArtwork(
  artwork: ArtworkDimensions,
  scale: number,
  imagePx?: ImageDimensionsPx | null,
): { widthM: number; heightM: number } {
  const catalog = catalogSizeForArtwork(artwork, scale);
  return fitCatalogBoxToImageM(catalog.widthM, catalog.heightM, imagePx);
}

/** Same fit when catalogue width and height are already in metres (3D room). */
export function placementVisualSizeFromCatalogM(
  catalogWidthM: number,
  catalogHeightM: number,
  imagePx?: ImageDimensionsPx | null,
): { widthM: number; heightM: number } {
  return fitCatalogBoxToImageM(catalogWidthM, catalogHeightM, imagePx);
}
