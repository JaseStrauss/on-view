import { getPublicExhibitionUrl } from "@/lib/copy-to-clipboard";
import type { Artwork } from "@/types/artwork";

const INQUIRABLE_STATUSES: ReadonlySet<Artwork["status"]> = new Set([
  "available",
  "reserved",
]);

export function normalizeContactEmail(value: string | null | undefined): string | null {
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

interface BuildArtworkInquiryMailtoOptions {
  contactEmail: string;
  exhibitionTitle: string;
  exhibitionSlug: string;
  artwork: Pick<Artwork, "id" | "title" | "artist" | "year" | "medium">;
}

export function buildArtworkInquiryMailto({
  contactEmail,
  exhibitionTitle,
  exhibitionSlug,
  artwork,
}: BuildArtworkInquiryMailtoOptions): string {
  const email = normalizeContactEmail(contactEmail);
  if (!email) {
    throw new Error("Invalid contact email");
  }

  const showUrl = getPublicExhibitionUrl(exhibitionSlug);
  const artistLine = artwork.artist.trim() || "Unknown artist";
  const yearPart = artwork.year != null ? ` (${artwork.year})` : "";
  const mediumPart = artwork.medium?.trim() ? `\nMedium: ${artwork.medium.trim()}` : "";

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
  if (mediumPart) {
    bodyLines.push(mediumPart.replace(/^\n/, ""));
  }
  bodyLines.push("", "Message:", "", "", `Exhibition: ${showUrl}`);
  const body = bodyLines.join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${email}?${params.toString()}`;
}
