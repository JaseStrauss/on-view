import { SAMPLE_ARTWORKS } from "@/data/sample-artworks";
import {
  deriveExhibitionArtists,
  formatExhibitionDates,
  resolveFeaturingLine,
} from "@/lib/exhibition-details";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

export const SITE_NAME = "On View";
export const DEFAULT_SITE_TITLE = `${SITE_NAME} — Virtual Exhibitions`;
export const DEFAULT_SITE_DESCRIPTION =
  "Catalogue artworks, curate exhibitions, and share them online.";

/** Fallback when an exhibition has no cover image. */
export const DEFAULT_OG_IMAGE = SAMPLE_ARTWORKS[0]?.image_path ?? "";

export interface ExhibitionShareMeta {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  siteName: string;
}

export function resolveArtworkImageUrl(
  imagePath: string | null,
  origin: string,
  supabaseUrl?: string,
): string | null {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${origin}${imagePath}`;
  }

  if (!supabaseUrl) return null;

  return `${supabaseUrl}/storage/v1/object/public/artwork-images/${imagePath}`;
}

export function pickCoverImageUrl(
  placements: PlacementWithArtwork[],
  origin: string,
  supabaseUrl?: string,
): string | null {
  const sorted = [...placements].sort(
    (a, b) =>
      a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );

  for (const placement of sorted) {
    const url = resolveArtworkImageUrl(
      placement.artwork.image_path,
      origin,
      supabaseUrl,
    );
    if (url) return url;
  }

  return null;
}

export function buildExhibitionShareMeta(input: {
  exhibition: Pick<
    Exhibition,
    | "title"
    | "description"
    | "slug"
    | "opens_at"
    | "closes_at"
    | "featuring_override"
  >;
  placements: PlacementWithArtwork[];
  catalogueArtworks?: Artwork[];
  presenterName?: string | null;
  origin: string;
  supabaseUrl?: string;
}): ExhibitionShareMeta {
  const {
    exhibition,
    placements,
    catalogueArtworks = [],
    presenterName,
    origin,
    supabaseUrl,
  } = input;

  const catalogueIsScoped = catalogueArtworks.length > 0;
  const artists = deriveExhibitionArtists(
    catalogueArtworks,
    placements,
    catalogueIsScoped,
  );
  const featuringLine = resolveFeaturingLine(exhibition, artists);
  const dates = formatExhibitionDates(
    exhibition.opens_at,
    exhibition.closes_at,
  );

  const descriptionParts = [
    exhibition.description?.trim(),
    featuringLine,
    presenterName ? `Presented by ${presenterName}` : null,
    dates,
    "Virtual exhibition on On View",
  ].filter(Boolean);

  const description =
    descriptionParts.join(" · ") || `View "${exhibition.title}" on On View`;

  const imageUrl =
    pickCoverImageUrl(placements, origin, supabaseUrl) ?? DEFAULT_OG_IMAGE;

  return {
    title: `${exhibition.title} — ${SITE_NAME}`,
    description,
    imageUrl,
    url: `${origin}/show/${exhibition.slug}`,
    siteName: SITE_NAME,
  };
}

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  const selector =
    attribute === "name" ? `meta[name="${key}"]` : `meta[property="${key}"]`;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export function applyDocumentMeta(meta: ExhibitionShareMeta) {
  document.title = meta.title;
  upsertMeta("name", "description", meta.description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.description);
  upsertMeta("property", "og:url", meta.url);
  upsertMeta("property", "og:image", meta.imageUrl);
  upsertMeta("property", "og:site_name", meta.siteName);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.description);
  upsertMeta("name", "twitter:image", meta.imageUrl);
}

export function resetDocumentMeta() {
  document.title = DEFAULT_SITE_TITLE;
  upsertMeta("name", "description", DEFAULT_SITE_DESCRIPTION);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:title", DEFAULT_SITE_TITLE);
  upsertMeta("property", "og:description", DEFAULT_SITE_DESCRIPTION);
  upsertMeta("property", "og:site_name", SITE_NAME);

  document.head.querySelector('meta[property="og:url"]')?.remove();
  document.head.querySelector('meta[property="og:image"]')?.remove();
  document.head.querySelector('meta[name="twitter:card"]')?.remove();
  document.head.querySelector('meta[name="twitter:title"]')?.remove();
  document.head.querySelector('meta[name="twitter:description"]')?.remove();
  document.head.querySelector('meta[name="twitter:image"]')?.remove();
}

export function renderShareMetaHtml(meta: ExhibitionShareMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(meta.url);
  const imageUrl = escapeHtml(meta.imageUrl);
  const siteName = escapeHtml(meta.siteName);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
