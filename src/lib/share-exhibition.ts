import { toast } from "sonner";
import { copyPublicExhibitionLink, getPublicExhibitionUrl } from "@/lib/copy-to-clipboard";

interface ShareExhibitionOptions {
  slug: string;
  title: string;
  preferNativeShare?: boolean;
}

export async function shareExhibition({
  slug,
  title,
  preferNativeShare = false,
}: ShareExhibitionOptions): Promise<void> {
  const url = getPublicExhibitionUrl(slug);
  const shareData: ShareData = {
    title,
    text: `View "${title}" on On View`,
    url,
  };

  if (
    preferNativeShare &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  await copyPublicExhibitionLink(slug);
}

export async function shareExhibitionWithFeedback(
  options: ShareExhibitionOptions,
): Promise<void> {
  try {
    await shareExhibition(options);
  } catch {
    toast.error("Could not share this exhibition.");
  }
}
