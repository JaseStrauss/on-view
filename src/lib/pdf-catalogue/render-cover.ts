import { formatExhibitionDates } from "@/lib/exhibition-details";
import { PDF_COLORS } from "@/lib/pdf-catalogue/layout";
import type { CataloguePdfWriter } from "@/lib/pdf-catalogue/writer";
import { PDF_SANS, PDF_SERIF } from "@/lib/pdf-fonts";
import type { Exhibition } from "@/types";

export function renderCoverPage(
  writer: CataloguePdfWriter,
  exhibition: Exhibition,
  featuringLine: string | null,
): void {
  const doc = writer.doc;
  let y = 36;

  writer.drawSectionLabel("Exhibition catalogue", writer.margin, y);
  y += 18;

  doc.setFont(PDF_SERIF, "normal");
  doc.setFontSize(34);
  writer.setTextColor(PDF_COLORS.foreground);
  y = writer.drawPaginatedLines(
    writer.splitLines(exhibition.title, writer.contentWidth),
    writer.margin,
    y,
    13,
  );
  y += 10;

  writer.setDrawColor(PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(writer.margin, y, writer.margin + 28, y);
  y += 14;

  doc.setFont(PDF_SANS, "normal");
  doc.setFontSize(10.5);
  writer.setTextColor(PDF_COLORS.muted);

  const meta: string[] = [];
  const dates = formatExhibitionDates(
    exhibition.opens_at,
    exhibition.closes_at,
  );
  if (dates) meta.push(dates);
  if (featuringLine) meta.push(featuringLine);

  for (const block of meta) {
    y = writer.drawWrappedParagraph(
      block,
      writer.margin,
      y,
      writer.contentWidth,
      6.5,
    );
  }

  const statement = exhibition.description?.trim();
  if (!statement) return;

  y += 8;
  doc.setFontSize(11);
  writer.setTextColor(PDF_COLORS.muted);
  writer.drawWrappedParagraph(
    statement,
    writer.margin,
    y,
    writer.contentWidth,
    6.2,
  );
}
