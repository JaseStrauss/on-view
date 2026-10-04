import { formatMediumLine, formatTitleLine } from "@/lib/artwork-caption";
import {
  PDF_COLORS,
  PDF_PAGE,
  PDF_WORK_PAGE,
} from "@/lib/pdf-catalogue/layout";
import type { CatalogueImage } from "@/lib/pdf-catalogue/types";
import type { CataloguePdfWriter } from "@/lib/pdf-catalogue/writer";
import { PDF_SANS, PDF_SERIF } from "@/lib/pdf-fonts";
import type { PlacementWithArtwork } from "@/types";

function renderWorkImage(
  writer: CataloguePdfWriter,
  y: number,
  image: CatalogueImage | null,
): number {
  const doc = writer.doc;

  if (image) {
    let drawWidth = writer.contentWidth;
    let drawHeight = drawWidth / image.aspectRatio;

    if (drawHeight > PDF_WORK_PAGE.maxImageHeightMm) {
      drawHeight = PDF_WORK_PAGE.maxImageHeightMm;
      drawWidth = drawHeight * image.aspectRatio;
    }

    const imageX = writer.margin + (writer.contentWidth - drawWidth) / 2;
    doc.addImage(image.dataUrl, image.format, imageX, y, drawWidth, drawHeight);
    return y + drawHeight + 16;
  }

  writer.setDrawColor(PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.rect(
    writer.margin,
    y,
    writer.contentWidth,
    PDF_WORK_PAGE.placeholderHeightMm,
  );
  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(10);
  writer.setTextColor(PDF_COLORS.subtle);
  doc.text(
    "Image unavailable",
    PDF_PAGE.widthMm / 2,
    y + PDF_WORK_PAGE.placeholderHeightMm / 2,
    { align: "center" },
  );
  return y + PDF_WORK_PAGE.placeholderHeightMm + 16;
}

function renderWorkCaption(
  writer: CataloguePdfWriter,
  placement: PlacementWithArtwork,
  startY: number,
): void {
  const doc = writer.doc;
  const { artwork } = placement;
  const captionX = writer.margin + 5;
  const captionWidth = writer.contentWidth - 5;

  doc.setFont(PDF_SANS, "bold");
  doc.setFontSize(11);
  writer.setTextColor(PDF_COLORS.foreground);
  let captionY = writer.drawPaginatedLines(
    writer.splitLines(artwork.artist || "Unknown artist", captionWidth),
    captionX,
    startY,
    5,
  );

  doc.setFont(PDF_SERIF, "italic");
  doc.setFontSize(18);
  writer.setTextColor(PDF_COLORS.foreground);
  captionY = writer.ensureVerticalSpace(captionY + 4, 8);
  captionY = writer.drawPaginatedLines(
    writer.splitLines(formatTitleLine(artwork), captionWidth),
    captionX,
    captionY,
    8,
  );

  const mediumLine = formatMediumLine(artwork);
  if (mediumLine) {
    doc.setFont(PDF_SANS, "normal");
    doc.setFontSize(10);
    writer.setTextColor(PDF_COLORS.muted);
    captionY = writer.ensureVerticalSpace(captionY + 4, 5);
    captionY = writer.drawWrappedParagraph(
      mediumLine,
      captionX,
      captionY,
      captionWidth,
      5,
    );
  }

  const description = artwork.description?.trim();
  if (!description) return;

  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(9.5);
  writer.setTextColor(PDF_COLORS.muted);
  captionY = writer.ensureVerticalSpace(captionY + 4, 5);
  writer.drawWrappedParagraph(
    description,
    captionX,
    captionY,
    captionWidth,
    4.8,
  );
}

export function renderWorkPage(
  writer: CataloguePdfWriter,
  placement: PlacementWithArtwork,
  wallLabel: string,
  index: number,
  image: CatalogueImage | null,
): void {
  let y = writer.margin;

  writer.drawSectionLabel(String(index).padStart(2, "0"), writer.margin, y);
  writer.drawSectionLabel(
    wallLabel,
    PDF_PAGE.widthMm - writer.margin,
    y,
    "right",
  );
  y += 12;

  y = renderWorkImage(writer, y, image);
  renderWorkCaption(writer, placement, y);
}
