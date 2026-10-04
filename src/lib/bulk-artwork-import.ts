import type { CsvArtworkRow } from "@/lib/bulk-import";
import {
  importDemoSandboxCsvRows,
  importDemoSandboxImageFiles,
} from "@/lib/demo-sandbox-artworks";
import {
  createArtworksFromCsvRows,
  createArtworksFromImageFiles,
  type BulkArtworkFailure,
} from "@/services/artworks";
import type { Artwork } from "@/types/artwork";

export type BulkImportMode = "images" | "csv";

export interface BulkImportResult {
  artworks: Artwork[];
  failures: BulkArtworkFailure[];
}

export const BULK_IMPORT_EMPTY_MESSAGE =
  "Nothing was imported. Check the errors below and try again.";

export async function executeBulkArtworkImport(options: {
  demoMode: boolean;
  mode: BulkImportMode;
  userId: string | undefined;
  imageFiles: File[];
  csvRows: CsvArtworkRow[];
}): Promise<BulkImportResult> {
  const { demoMode, mode, userId, imageFiles, csvRows } = options;

  if (demoMode) {
    return mode === "images"
      ? importDemoSandboxImageFiles(imageFiles)
      : importDemoSandboxCsvRows(csvRows);
  }

  if (!userId) {
    return {
      artworks: [],
      failures: [{ label: "Import", error: "Sign in to import artwork." }],
    };
  }

  return mode === "images"
    ? createArtworksFromImageFiles(userId, imageFiles)
    : createArtworksFromCsvRows(userId, csvRows);
}
