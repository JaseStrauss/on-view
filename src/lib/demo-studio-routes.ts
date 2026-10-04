import { DEMO_BUILDER_PATH } from "@/lib/demo-sandbox";
import { DEMO_STUDIO_PATH } from "@/lib/public-demo";

export interface ArtworkFlowPaths {
  backTo: string;
  backLabel: string;
  cancelPath: string;
  addOnePath: string;
  bulkImportPath: string;
}

function withExhibitionQuery(
  path: string,
  exhibitionId: string | null,
): string {
  if (!exhibitionId) return path;
  return `${path}?exhibition=${exhibitionId}`;
}

/** Shared back/cancel/add links for artwork create and bulk import (studio vs demo). */
export function getArtworkFlowPaths(
  demoMode: boolean,
  exhibitionId: string | null,
): ArtworkFlowPaths {
  const studioHome = "/studio";
  const demoHome = DEMO_STUDIO_PATH;
  const home = demoMode ? demoHome : studioHome;

  const addOneBase = demoMode
    ? "/studio/demo/artworks/new"
    : "/studio/artworks/new";
  const bulkBase = demoMode
    ? "/studio/demo/artworks/bulk"
    : "/studio/artworks/bulk";

  const backTo = demoMode
    ? exhibitionId
      ? DEMO_BUILDER_PATH
      : demoHome
    : exhibitionId
      ? `/studio/exhibitions/${exhibitionId}`
      : studioHome;

  return {
    backTo,
    backLabel: exhibitionId ? "Exhibition" : "Exhibitions",
    cancelPath: home,
    addOnePath: withExhibitionQuery(addOneBase, exhibitionId),
    bulkImportPath: withExhibitionQuery(bulkBase, exhibitionId),
  };
}
