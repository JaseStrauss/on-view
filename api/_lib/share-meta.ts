/**
 * Share meta helpers for the Edge show-meta route.
 * Kept in api/ so Vercel does not bundle src/ path aliases.
 */

export const SITE_NAME = "On View";

/** Fallback when an exhibition has no cover image. */
export const DEFAULT_OG_IMAGE = "/demo/vangogh.jpg";

export interface ExhibitionShareMeta {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  siteName: string;
}

interface ShareArtwork {
  artist: string;
  image_path: string | null;
}

interface SharePlacement {
  sort_order: number;
  created_at: string;
  artwork: ShareArtwork;
}

interface ShareExhibition {
  title: string;
  description: string | null;
  slug: string;
  opens_at: string | null;
  closes_at: string | null;
  featuring_override: string | null;
}

function uniqueArtistsFromArtworks(
  artworks: Array<Pick<ShareArtwork, "artist"> | null | undefined>,
): string[] {
  const seen = new Set<string>();
  const artists: string[] = [];

  for (const artwork of artworks) {
    const name = artwork?.artist?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    artists.push(name);
  }

  return artists.sort((a, b) => a.localeCompare(b));
}

function formatArtistList(artists: string[]): string | null {
  if (artists.length === 0) return null;
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return `${artists[0]} and ${artists[1]}`;
  return `${artists.slice(0, -1).join(", ")}, and ${artists[artists.length - 1]}`;
}

function deriveExhibitionArtists(
  catalogueArtworks: ShareArtwork[],
  placements: SharePlacement[],
  catalogueIsScoped: boolean,
): string[] {
  if (catalogueIsScoped) {
    return uniqueArtistsFromArtworks(catalogueArtworks);
  }
  return uniqueArtistsFromArtworks(
    placements.map((placement) => placement.artwork),
  );
}

function resolveFeaturingLine(
  exhibition: Pick<ShareExhibition, "featuring_override">,
  derivedArtists: string[],
): string | null {
  const override = exhibition.featuring_override?.trim();
  if (override) return override;
  const list = formatArtistList(derivedArtists);
  return list ? `Featuring ${list}` : null;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatSingleDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatExhibitionDates(
  opensAt: string | null,
  closesAt: string | null,
): string | null {
  if (opensAt && closesAt) {
    return `${formatSingleDate(opensAt)} – ${formatSingleDate(closesAt)}`;
  }
  if (opensAt) return `Opens ${formatSingleDate(opensAt)}`;
  if (closesAt) return `Until ${formatSingleDate(closesAt)}`;
  return null;
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

function pickCoverImageUrl(
  placements: SharePlacement[],
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
  exhibition: ShareExhibition;
  placements: SharePlacement[];
  catalogueArtworks?: ShareArtwork[];
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
    pickCoverImageUrl(placements, origin, supabaseUrl) ??
    `${origin}${DEFAULT_OG_IMAGE}`;

  return {
    title: `${exhibition.title} — ${SITE_NAME}`,
    description,
    imageUrl,
    url: `${origin}/show/${exhibition.slug}`,
    siteName: SITE_NAME,
  };
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
