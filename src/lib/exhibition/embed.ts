import { getPublicExhibitionUrl } from "@/lib/copy-to-clipboard";

export function parseEmbedQuery(value: string | null | undefined): boolean {
  if (value == null || value === "") return false;

  const normalized = value.toLowerCase().trim();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function getPublicExhibitionEmbedUrl(
  slug: string,
  options?: { view?: "catalogue" | "gallery" },
): string {
  const base = getPublicExhibitionUrl(slug);
  if (typeof window === "undefined") {
    const params = new URLSearchParams({ embed: "1" });
    if (options?.view === "catalogue") params.set("view", "catalogue");
    if (options?.view === "gallery") params.set("view", "gallery");
    return `/show/${slug}?${params.toString()}`;
  }

  const url = new URL(base);
  url.searchParams.set("embed", "1");
  if (options?.view === "catalogue") {
    url.searchParams.set("view", "catalogue");
  } else if (options?.view === "gallery") {
    url.searchParams.set("view", "gallery");
  }
  return url.toString();
}

export const EMBED_IFRAME_HEIGHT_PRESETS = [
  { label: "Compact (600px)", value: "600" },
  { label: "Default (720px)", value: "720" },
  { label: "Tall (900px)", value: "900" },
  { label: "Responsive (90vh)", value: "90vh" },
] as const;

export type EmbedIframeHeightPreset =
  (typeof EMBED_IFRAME_HEIGHT_PRESETS)[number]["value"];

export function buildExhibitionEmbedIframeHtml(
  slug: string,
  exhibitionTitle: string,
  options?: { view?: "catalogue" | "gallery"; height?: number | string },
): string {
  const src = getPublicExhibitionEmbedUrl(slug, { view: options?.view });
  const height = options?.height ?? 720;
  const heightAttr =
    typeof height === "number" ? String(height) : height.trim() || "720";
  const title = exhibitionTitle.replace(/"/g, "&quot;");

  return `<iframe src="${src}" title="${title} on On View" width="100%" height="${heightAttr}" style="border:0;max-width:100%;" loading="lazy" allow="fullscreen"></iframe>`;
}
