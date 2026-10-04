import type { CsvArtworkRow } from "./parse";
import {
  importDemoSandboxCsvRows,
  importDemoSandboxImageFiles,
} from "@/lib/demo/sandbox-artworks";
import {
  createArtworksFromCsvRows,
  createArtworksFromImageFiles,
  type BulkArtworkFailure,
  type BulkImageImportInput,
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
  imageItems: BulkImageImportInput[];
  csvRows: CsvArtworkRow[];
}): Promise<BulkImportResult> {
  const { demoMode, mode, userId, imageItems, csvRows } = options;

  if (demoMode) {
    return mode === "images"
      ? importDemoSandboxImageFiles(imageItems)
      : importDemoSandboxCsvRows(csvRows);
  }

  if (!userId) {
    return {
      artworks: [],
      failures: [{ label: "Import", error: "Sign in to import artwork." }],
    };
  }

  return mode === "images"
    ? createArtworksFromImageFiles(userId, imageItems)
    : createArtworksFromCsvRows(userId, csvRows);
}
