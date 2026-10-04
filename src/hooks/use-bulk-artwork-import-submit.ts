import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AddToExhibitionValue } from "@/components/add-to-exhibition-fields";
import type { CsvArtworkRow } from "@/lib/bulk-import";
import {
  BULK_IMPORT_EMPTY_MESSAGE,
  executeBulkArtworkImport,
  type BulkImportMode,
} from "@/lib/bulk-artwork-import";
import {
  completeBulkArtworkImport,
  completeDemoBulkImport,
} from "@/lib/bulk-artwork-flow";

interface UseBulkArtworkImportSubmitOptions {
  demoMode: boolean;
  mode: BulkImportMode;
  canSubmit: boolean;
  imageFiles: File[];
  csvRows: CsvArtworkRow[];
  addToExhibition: AddToExhibitionValue;
  exhibitionId: string | null;
  userId: string | undefined;
}

export function useBulkArtworkImportSubmit({
  demoMode,
  mode,
  canSubmit,
  imageFiles,
  csvRows,
  addToExhibition,
  exhibitionId,
  userId,
}: UseBulkArtworkImportSubmitOptions) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    if (!demoMode && !userId) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await executeBulkArtworkImport({
        demoMode,
        mode,
        userId,
        imageFiles,
        csvRows,
      });

      if (result.artworks.length === 0 && result.failures.length > 0) {
        setError(BULK_IMPORT_EMPTY_MESSAGE);
        if (!demoMode) {
          toast.error("Import failed", {
            description: result.failures[0]?.error,
          });
        }
        return;
      }

      if (demoMode) {
        completeDemoBulkImport(result, navigate, exhibitionId);
        return;
      }

      await completeBulkArtworkImport(result, addToExhibition, navigate, {
        itemLabel: "work",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    handleSubmit,
    submitting,
    error,
    clearError,
  };
}
