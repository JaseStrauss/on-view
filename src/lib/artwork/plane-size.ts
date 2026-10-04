/** Fit an image inside catalogue dimensions without stretching (object-contain in 3D). */
export function artworkPlaneSizeM(
  catalogWidthM: number,
  catalogHeightM: number,
  imageWidthPx: number,
  imageHeightPx: number,
): { width: number; height: number } {
  if (
    catalogWidthM <= 0 ||
    catalogHeightM <= 0 ||
    imageWidthPx <= 0 ||
    imageHeightPx <= 0
  ) {
    return { width: catalogWidthM, height: catalogHeightM };
  }

  const imageAspect = imageWidthPx / imageHeightPx;
  const catalogAspect = catalogWidthM / catalogHeightM;

  if (imageAspect > catalogAspect) {
    return {
      width: catalogWidthM,
      height: catalogWidthM / imageAspect,
    };
  }

  return {
    width: catalogHeightM * imageAspect,
    height: catalogHeightM,
  };
}
