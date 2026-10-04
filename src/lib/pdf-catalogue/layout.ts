export const PDF_PAGE = {
  widthMm: 210,
  heightMm: 297,
  marginMm: 20,
} as const;

export const PDF_CONTENT = {
  widthMm: PDF_PAGE.widthMm - PDF_PAGE.marginMm * 2,
  /** Body text stops above footer rule and page number. */
  bottomYMm: PDF_PAGE.heightMm - 22,
  footerYMm: PDF_PAGE.heightMm - 12,
} as const;

export const PDF_COLORS = {
  foreground: [46, 44, 42] as [number, number, number],
  muted: [128, 124, 118] as [number, number, number],
  subtle: [160, 156, 150] as [number, number, number],
  border: [230, 226, 220] as [number, number, number],
} as const;

export const PDF_WORK_PAGE = {
  maxImageHeightMm: 138,
  placeholderHeightMm: 80,
} as const;
