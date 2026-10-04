import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import type { AddToExhibitionValue } from "@/components/add-to-exhibition-fields";
import { DEMO_BUILDER_PATH } from "@/lib/demo/sandbox";
import type { BulkImportResult } from "./artwork-import";
import { DEMO_STUDIO_PATH } from "@/lib/demo/public-demo";
import { addArtworksToExhibitionCatalogue } from "@/services/exhibition-catalogue";
import type { BulkArtworkFailure } from "@/services/artworks";

const FAILURE_PREVIEW_LIMIT = 3;

interface CompleteBulkArtworkImportOptions {
  itemLabel?: string;
}

export function notifyBulkImportFailures(failures: BulkArtworkFailure[]): void {
  if (failures.length === 0) return;

  const preview = failures
    .slice(0, FAILURE_PREVIEW_LIMIT)
    .map((failure) => `${failure.label}: ${failure.error}`)
    .join("; ");

  toast.error(
    `${failures.length} ${failures.length === 1 ? "item" : "items"} could not be imported`,
    {
      description:
        failures.length > FAILURE_PREVIEW_LIMIT
          ? `${preview}…`
          : preview || undefined,
    },
  );
}

export function completeDemoBulkImport(
  result: BulkImportResult,
  navigate: NavigateFunction,
  exhibitionId: string | null,
): void {
  const count = result.artworks.length;

  if (count > 0) {
    toast.success(
      `${count} ${count === 1 ? "work" : "works"} added to your demo catalogue`,
    );
  }

  notifyBulkImportFailures(result.failures);

  if (count > 0) {
    navigate(exhibitionId ? DEMO_BUILDER_PATH : DEMO_STUDIO_PATH);
  }
}

export async function completeBulkArtworkImport(
  result: BulkImportResult,
  addToExhibition: AddToExhibitionValue,
  navigate: NavigateFunction,
  options?: CompleteBulkArtworkImportOptions,
): Promise<void> {
  const { artworks, failures } = result;
  const itemLabel = options?.itemLabel ?? "work";
  const pluralLabel = artworks.length === 1 ? itemLabel : `${itemLabel}s`;

  if (artworks.length > 0) {
    if (addToExhibition.enabled && addToExhibition.exhibitionId) {
      await addArtworksToExhibitionCatalogue(
        addToExhibition.exhibitionId,
        artworks.map((artwork) => artwork.id),
      );
    }

    const successMessage =
      addToExhibition.enabled && addToExhibition.exhibitionId
        ? `${artworks.length} ${pluralLabel} added to your exhibition`
        : `${artworks.length} ${pluralLabel} added to your catalogue`;

    toast.success(successMessage);
  }

  notifyBulkImportFailures(failures);

  if (artworks.length === 0) return;

  if (addToExhibition.enabled && addToExhibition.exhibitionId) {
    navigate(`/studio/exhibitions/${addToExhibition.exhibitionId}`);
    return;
  }

  navigate("/studio");
}
