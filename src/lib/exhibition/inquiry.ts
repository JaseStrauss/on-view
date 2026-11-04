import { getPublicExhibitionUrl } from "@/lib/copy-to-clipboard";
import type { Artwork } from "@/types/artwork";

const INQUIRABLE_STATUSES: ReadonlySet<Artwork["status"]> = new Set([
  "available",
  "reserved",
]);

export interface ArtworkInquiryContext {
  contactEmail: string | null;
  exhibitionTitle: string;
  exhibitionSlug: string;
}

export function normalizeContactEmail(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export function canInquireAboutArtwork(
  artwork: Pick<Artwork, "status">,
  contactEmail: string | null | undefined,
): boolean {
  return (
    Boolean(normalizeContactEmail(contactEmail)) &&
    INQUIRABLE_STATUSES.has(artwork.status)
  );
}

interface BuildArtworkInquiryOptions {
  contactEmail: string;
  exhibitionTitle: string;
  exhibitionSlug: string;
  artwork: Pick<Artwork, "id" | "title" | "artist" | "year" | "medium">;
}

export function buildArtworkInquiryContent({
  contactEmail,
  exhibitionTitle,
  exhibitionSlug,
  artwork,
}: BuildArtworkInquiryOptions): {
  to: string;
  subject: string;
  body: string;
} {
  const email = normalizeContactEmail(contactEmail);
  if (!email) {
    throw new Error("Invalid contact email");
  }

  const showUrl = getPublicExhibitionUrl(exhibitionSlug);
  const artistLine = artwork.artist.trim() || "Unknown artist";
  const yearPart = artwork.year != null ? ` (${artwork.year})` : "";
  const mediumLine = artwork.medium?.trim()
    ? `Medium: ${artwork.medium.trim()}`
    : null;

  const subject = `Inquiry: ${artwork.title} — ${exhibitionTitle}`;
  const bodyLines = [
    "Hello,",
    "",
    `I am interested in the following work from "${exhibitionTitle}":`,
    "",
    `Title: ${artwork.title}${yearPart}`,
    `Artist: ${artistLine}`,
    `Work ID: ${artwork.id}`,
  ];
  if (mediumLine) {
    bodyLines.push(mediumLine);
  }
  bodyLines.push("", "Message:", "", "", `Exhibition: ${showUrl}`);

  return {
    to: email,
    subject,
    body: bodyLines.join("\n"),
  };
}

export function buildArtworkInquiryMailto(
  options: BuildArtworkInquiryOptions,
): string {
  const { to, subject, body } = buildArtworkInquiryContent(options);

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${to}?${params.toString()}`;
}
