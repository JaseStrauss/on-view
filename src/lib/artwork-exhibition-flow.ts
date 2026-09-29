import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import type { Artwork } from "@/types/artwork";
import type { AddToExhibitionValue } from "@/components/add-to-exhibition-fields";
import { addArtworkToExhibitionCatalogue } from "@/services/exhibition-catalogue";

interface FinishArtworkOptions {
  successMessage?: string;
}

export async function finishArtworkWithOptionalCatalogue(
  artwork: Artwork,
  addToExhibition: AddToExhibitionValue,
  navigate: NavigateFunction,
  options?: FinishArtworkOptions,
): Promise<void> {
  if (addToExhibition.enabled && addToExhibition.exhibitionId) {
    await addArtworkToExhibitionCatalogue(
      addToExhibition.exhibitionId,
      artwork.id,
    );
    toast.success(
      options?.successMessage ?? `"${artwork.title}" added to your exhibition`,
    );
    navigate(`/studio/exhibitions/${addToExhibition.exhibitionId}`);
    return;
  }

  toast.success(
    options?.successMessage ?? `"${artwork.title}" added to your catalogue`,
  );
  navigate("/studio");
}
