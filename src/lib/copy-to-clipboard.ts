import { toast } from "sonner";
import { getPublicExhibitionUrl } from "@/lib/public-site-url";

export { getPublicExhibitionUrl } from "@/lib/public-site-url";

export async function copyPublicExhibitionLink(
  slug: string,
  successMessage = "Link copied to clipboard",
): Promise<boolean> {
  const url = getPublicExhibitionUrl(slug);

  try {
    await navigator.clipboard.writeText(url);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error("Could not copy link. Try again or copy the URL manually.");
    return false;
  }
}
