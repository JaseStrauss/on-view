import { toast } from "sonner";

export function getPublicExhibitionUrl(slug: string): string {
  const path = `/show/${slug}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

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
