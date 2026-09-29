import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import type { AddToExhibitionValue } from "@/components/add-to-exhibition-fields";
import { addArtworksToExhibitionCatalogue } from "@/services/exhibition-catalogue";
import type { Artwork } from "@/types/artwork";
import type { BulkArtworkFailure } from "@/services/artworks";

interface FinishBulkArtworksOptions {
  itemLabel?: string;
}

export async function finishBulkArtworksWithOptionalCatalogue(
  artworks: Artwork[],
  failures: BulkArtworkFailure[],
  addToExhibition: AddToExhibitionValue,
  navigate: NavigateFunction,
  options?: FinishBulkArtworksOptions,
): Promise<void> {
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

  if (failures.length > 0) {
    const preview = failures
      .slice(0, 3)
      .map((failure) => `${failure.label}: ${failure.error}`)
      .join("; ");

    toast.error(
      `${failures.length} ${failures.length === 1 ? "item" : "items"} could not be imported`,
      {
        description:
          failures.length > 3 ? `${preview}…` : preview || undefined,
      },
    );
  }

  if (artworks.length === 0) return;

  if (addToExhibition.enabled && addToExhibition.exhibitionId) {
    navigate(`/studio/exhibitions/${addToExhibition.exhibitionId}`);
    return;
  }

  navigate("/studio");
}
