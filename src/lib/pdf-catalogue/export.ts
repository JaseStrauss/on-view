import {
  deriveExhibitionArtists,
  resolveFeaturingLine,
} from "@/lib/exhibition-details";
import { loadCatalogueImage } from "@/lib/pdf-catalogue/load-image";
import { renderCoverPage } from "@/lib/pdf-catalogue/render-cover";
import { renderWorkPage } from "@/lib/pdf-catalogue/render-work";
import type { ExportCatalogueOptions } from "@/lib/pdf-catalogue/types";
import { CataloguePdfWriter } from "@/lib/pdf-catalogue/writer";
import { registerPdfFonts } from "@/lib/pdf-fonts";
import { getArtworkImageUrl } from "@/services/artworks";

function slugifyFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function sortPlacements(
  placements: ExportCatalogueOptions["placements"],
): ExportCatalogueOptions["placements"] {
  return [...placements].sort(
    (a, b) =>
      a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );
}

export async function exportExhibitionCataloguePdf({
  exhibition,
  placements,
  room,
  catalogueArtworks = [],
}: ExportCatalogueOptions): Promise<void> {
  const sorted = sortPlacements(placements);

  if (sorted.length === 0) {
    throw new Error(
      "Add at least one artwork to the exhibition before exporting.",
    );
  }

  const wallLabels = new Map(room.walls.map((wall) => [wall.id, wall.label]));

  const images = await Promise.all(
    sorted.map(async (placement) => {
      const url = getArtworkImageUrl(placement.artwork.image_path);
      if (!url) return null;
      return loadCatalogueImage(url);
    }),
  );

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await registerPdfFonts(doc);

  const writer = new CataloguePdfWriter(doc);

  const featuringLine = resolveFeaturingLine(
    exhibition,
    deriveExhibitionArtists(
      catalogueArtworks,
      placements,
      catalogueArtworks.length > 0,
    ),
  );

  renderCoverPage(writer, exhibition, featuringLine);

  for (let i = 0; i < sorted.length; i += 1) {
    writer.addPage();
    const placement = sorted[i];
    const wallLabel = wallLabels.get(placement.wall_id) ?? placement.wall_id;
    renderWorkPage(writer, placement, wallLabel, i + 1, images[i]);
  }

  writer.renderFooters();

  doc.save(`${slugifyFilename(exhibition.title)}-catalogue.pdf`);
}
