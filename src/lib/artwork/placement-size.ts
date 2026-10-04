import { artworkSizeM } from "@/lib/gallery/wall-coordinates";
import type { Artwork } from "@/types/artwork";
import { artworkPlaneSizeM } from "@/lib/artwork/plane-size";

export interface ImageDimensionsPx {
  width: number;
  height: number;
}

/** Catalogue hang box in metres (cm × scale). Used as the outer bounds before image fit. */
export function catalogSizeM(
  widthCm: number | null,
  heightCm: number | null,
  scale = 1,
): { widthM: number; heightM: number } {
  return artworkSizeM(widthCm, heightCm, scale);
}

export function catalogSizeMForArtwork(
  artwork: Pick<Artwork, "width_cm" | "height_cm">,
  scale: number,
): { widthM: number; heightM: number } {
  return catalogSizeM(artwork.width_cm, artwork.height_cm, scale);
}

/**
 * Visible footprint on a wall: catalogue box fitted to image aspect when pixels
 * are known. Same size for 2D hang frames, drag clamping, and 3D planes.
 */
export function placementVisualSizeM(
  widthCm: number | null,
  heightCm: number | null,
  scale: number,
  imagePx?: ImageDimensionsPx | null,
): { widthM: number; heightM: number } {
  const catalog = catalogSizeM(widthCm, heightCm, scale);
  if (!imagePx || imagePx.width <= 0 || imagePx.height <= 0) {
    return catalog;
  }

  const plane = artworkPlaneSizeM(
    catalog.widthM,
    catalog.heightM,
    imagePx.width,
    imagePx.height,
  );
  return { widthM: plane.width, heightM: plane.height };
}

export function placementVisualSizeMForArtwork(
  artwork: Pick<Artwork, "width_cm" | "height_cm">,
  scale: number,
  imagePx?: ImageDimensionsPx | null,
): { widthM: number; heightM: number } {
  return placementVisualSizeM(
    artwork.width_cm,
    artwork.height_cm,
    scale,
    imagePx,
  );
}

/** Same fit logic when catalogue size is already in metres (3D room). */
export function placementVisualSizeFromCatalogM(
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
