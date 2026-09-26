import { formatMediumLine, formatTitleLine } from "@/lib/artwork-caption";
import {
  deriveExhibitionArtists,
  formatExhibitionDates,
  resolveFeaturingLine,
} from "@/lib/exhibition-details";
import { PDF_SANS, PDF_SERIF, registerPdfFonts } from "@/lib/pdf-fonts";
import { getArtworkImageUrl } from "@/services/artworks";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork, RoomTemplate } from "@/types";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  foreground: [46, 44, 42] as [number, number, number],
  muted: [128, 124, 118] as [number, number, number],
  subtle: [160, 156, 150] as [number, number, number],
  border: [230, 226, 220] as [number, number, number],
};

interface LoadedImage {
  dataUrl: string;
  format: "JPEG" | "PNG";
  aspectRatio: number;
}

function slugifyFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function setColor(doc: import("jspdf").jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDrawColor(
  doc: import("jspdf").jsPDF,
  color: [number, number, number],
) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function drawLabel(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  y: number,
  align: "left" | "right" = "left",
) {
  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);
  doc.text(text.toUpperCase(), x, y, { align, charSpace: 0.8 });
}

async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const dimensions = await new Promise<{ w: number; h: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );

    const format: LoadedImage["format"] = blob.type.includes("png")
      ? "PNG"
      : "JPEG";

    return {
      dataUrl,
      format,
      aspectRatio: dimensions.w / dimensions.h,
    };
  } catch {
    return null;
  }
}

function addFooter(
  doc: import("jspdf").jsPDF,
  pageNumber: number,
  totalPages: number,
) {
  const footerY = PAGE_HEIGHT - 12;
  setDrawColor(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, footerY - 4, PAGE_WIDTH - MARGIN, footerY - 4);

  doc.setFont(PDF_SERIF, "italic");
  doc.setFontSize(9);
  setColor(doc, COLORS.subtle);
  doc.text("On View", MARGIN, footerY);

  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(8);
  doc.text(`${pageNumber} / ${totalPages}`, PAGE_WIDTH - MARGIN, footerY, {
    align: "right",
  });
}

function buildCoverPage(
  doc: import("jspdf").jsPDF,
  exhibition: Exhibition,
  room: RoomTemplate,
  workCount: number,
  featuringLine: string | null,
) {
  let y = 36;

  drawLabel(doc, "Exhibition catalogue", MARGIN, y);
  y += 18;

  doc.setFont(PDF_SERIF, "normal");
  doc.setFontSize(34);
  setColor(doc, COLORS.foreground);
  const titleLines = doc.splitTextToSize(exhibition.title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 13 + 10;

  setDrawColor(doc, COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + 28, y);
  y += 14;

  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(10.5);
  setColor(doc, COLORS.muted);

  const metaLines: string[] = [];
  const dates = formatExhibitionDates(
    exhibition.opens_at,
    exhibition.closes_at,
  );
  if (dates) metaLines.push(dates);
  if (featuringLine) metaLines.push(featuringLine);
  metaLines.push(room.name);
  metaLines.push(`${workCount} work${workCount === 1 ? "" : "s"} on view`);

  for (const line of metaLines) {
    doc.text(line, MARGIN, y);
    y += 6.5;
  }

  if (exhibition.description) {
    y += 8;
    doc.setFontSize(11);
    setColor(doc, COLORS.muted);
    const descLines = doc.splitTextToSize(
      exhibition.description,
      CONTENT_WIDTH,
    );
    doc.text(descLines, MARGIN, y, { lineHeightFactor: 1.55 });
  }

  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(8.5);
  setColor(doc, COLORS.subtle);
  doc.text(
    `Generated ${new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    MARGIN,
    PAGE_HEIGHT - 28,
  );
}

function addWorkPage(
  doc: import("jspdf").jsPDF,
  placement: PlacementWithArtwork,
  wallLabel: string,
  index: number,
  image: LoadedImage | null,
) {
  const { artwork } = placement;
  let y = MARGIN;

  drawLabel(doc, String(index).padStart(2, "0"), MARGIN, y);
  drawLabel(doc, wallLabel, PAGE_WIDTH - MARGIN, y, "right");
  y += 12;

  const maxImageWidth = CONTENT_WIDTH;
  const maxImageHeight = 138;

  if (image) {
    let drawWidth = maxImageWidth;
    let drawHeight = drawWidth / image.aspectRatio;

    if (drawHeight > maxImageHeight) {
      drawHeight = maxImageHeight;
      drawWidth = drawHeight * image.aspectRatio;
    }

    const imageX = MARGIN + (CONTENT_WIDTH - drawWidth) / 2;
    doc.addImage(image.dataUrl, image.format, imageX, y, drawWidth, drawHeight);
    y += drawHeight + 16;
  } else {
    setDrawColor(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 80);
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(10);
    setColor(doc, COLORS.subtle);
    doc.text("Image unavailable", PAGE_WIDTH / 2, y + 42, { align: "center" });
    y += 96;
  }

  const captionX = MARGIN + 5;
  const captionWidth = CONTENT_WIDTH - 5;

  setDrawColor(doc, COLORS.border);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, MARGIN, y + 28);

  doc.setFont(PDF_SANS, "bold");
  doc.setFontSize(11);
  setColor(doc, COLORS.foreground);
  doc.text(artwork.artist || "Unknown artist", captionX, y + 5);

  doc.setFont(PDF_SERIF, "italic");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(
    formatTitleLine(artwork),
    captionWidth,
  );
  doc.text(titleLines, captionX, y + 14);

  const mediumLine = formatMediumLine(artwork);
  let captionBottom = y + 14 + (titleLines.length - 1) * 8 + 8;

  if (mediumLine) {
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(10);
    setColor(doc, COLORS.muted);
    doc.text(mediumLine, captionX, captionBottom);
    captionBottom += 7;
  }

  const description = artwork.description?.trim();
  if (description) {
    captionBottom += 3;
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(9.5);
    setColor(doc, COLORS.muted);
    const descLines = doc.splitTextToSize(description, captionWidth);
    doc.text(descLines, captionX, captionBottom, { lineHeightFactor: 1.5 });
  }
}

export interface ExportCatalogueOptions {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  room: RoomTemplate;
  catalogueArtworks?: Artwork[];
}

export async function exportExhibitionCataloguePdf({
  exhibition,
  placements,
  room,
  catalogueArtworks = [],
}: ExportCatalogueOptions): Promise<void> {
  const sorted = [...placements].sort(
    (a, b) =>
      a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );

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
      return loadImage(url);
    }),
  );

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await registerPdfFonts(doc);

  const totalPages = sorted.length + 1;

  const featuringLine = resolveFeaturingLine(
    exhibition,
    deriveExhibitionArtists(
      catalogueArtworks,
      placements,
      catalogueArtworks.length > 0,
    ),
  );

  buildCoverPage(doc, exhibition, room, sorted.length, featuringLine);
  addFooter(doc, 1, totalPages);

  for (let i = 0; i < sorted.length; i++) {
    doc.addPage();
    const placement = sorted[i];
    const wallLabel = wallLabels.get(placement.wall_id) ?? placement.wall_id;
    addWorkPage(doc, placement, wallLabel, i + 1, images[i]);
    addFooter(doc, i + 2, totalPages);
  }

  doc.save(`${slugifyFilename(exhibition.title)}-catalogue.pdf`);
}
