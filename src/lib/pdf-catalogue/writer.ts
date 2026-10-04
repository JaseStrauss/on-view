import type { jsPDF } from "jspdf";
import { PDF_COLORS, PDF_CONTENT, PDF_PAGE } from "@/lib/pdf-catalogue/layout";
import { PDF_SANS, PDF_SERIF } from "@/lib/pdf-fonts";

export class CataloguePdfWriter {
  constructor(readonly doc: jsPDF) {}

  get margin(): number {
    return PDF_PAGE.marginMm;
  }

  get contentWidth(): number {
    return PDF_CONTENT.widthMm;
  }

  setTextColor(color: [number, number, number]): void {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }

  setDrawColor(color: [number, number, number]): void {
    this.doc.setDrawColor(color[0], color[1], color[2]);
  }

  drawSectionLabel(
    text: string,
    x: number,
    y: number,
    align: "left" | "right" = "left",
  ): void {
    this.doc.setFont(PDF_SANS, "normal");
    this.doc.setFontSize(8);
    this.setTextColor(PDF_COLORS.muted);
    this.doc.text(text.toUpperCase(), x, y, { align, charSpace: 0.8 });
  }

  /**
   * Returns y after the last line. Inserts new pages when text would cross the footer zone.
   */
  drawPaginatedLines(
    lines: string[],
    x: number,
    startY: number,
    lineHeightMm: number,
  ): number {
    let y = startY;
    for (const line of lines) {
      y = this.ensureVerticalSpace(y, lineHeightMm);
      this.doc.text(line, x, y);
      y += lineHeightMm;
    }
    return y;
  }

  drawWrappedParagraph(
    text: string,
    x: number,
    startY: number,
    maxWidthMm: number,
    lineHeightMm: number,
  ): number {
    const lines = this.doc.splitTextToSize(text, maxWidthMm);
    return this.drawPaginatedLines(lines, x, startY, lineHeightMm);
  }

  ensureVerticalSpace(y: number, lineHeightMm: number): number {
    if (y + lineHeightMm > PDF_CONTENT.bottomYMm) {
      this.doc.addPage();
      return this.margin;
    }
    return y;
  }

  splitLines(text: string, maxWidthMm: number): string[] {
    return this.doc.splitTextToSize(text, maxWidthMm);
  }

  addPage(): void {
    this.doc.addPage();
  }

  renderFooters(): void {
    const totalPages = this.doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      this.doc.setPage(page);
      this.renderFooter(page, totalPages);
    }
  }

  private renderFooter(pageNumber: number, totalPages: number): void {
    const footerY = PDF_CONTENT.footerYMm;
    this.setDrawColor(PDF_COLORS.border);
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.margin,
      footerY - 4,
      PDF_PAGE.widthMm - this.margin,
      footerY - 4,
    );

    this.doc.setFont(PDF_SERIF, "italic");
    this.doc.setFontSize(9);
    this.setTextColor(PDF_COLORS.subtle);
    this.doc.text("On View", this.margin, footerY);

    this.doc.setFont(PDF_SANS, "normal");
    this.doc.setFontSize(8);
    this.doc.text(
      `${pageNumber} / ${totalPages}`,
      PDF_PAGE.widthMm - this.margin,
      footerY,
      { align: "right" },
    );
  }
}
