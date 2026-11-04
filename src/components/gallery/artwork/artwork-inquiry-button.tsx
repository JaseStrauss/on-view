import { Mail } from "lucide-react";
import {
  buildArtworkInquiryMailto,
  canInquireAboutArtwork,
  normalizeContactEmail,
} from "@/lib/exhibition/inquiry";
import type { Artwork } from "@/types/artwork";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ArtworkInquiryContext {
  contactEmail: string | null;
  exhibitionTitle: string;
  exhibitionSlug: string;
}

interface ArtworkInquiryButtonProps {
  artwork: Artwork;
  inquiry: ArtworkInquiryContext;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

export function ArtworkInquiryButton({
  artwork,
  inquiry,
  className,
  variant = "outline",
  size = "default",
  fullWidth = false,
}: ArtworkInquiryButtonProps) {
  const email = normalizeContactEmail(inquiry.contactEmail);
  if (!email || !canInquireAboutArtwork(artwork, email)) {
    return null;
  }

  const href = buildArtworkInquiryMailto({
    contactEmail: email,
    exhibitionTitle: inquiry.exhibitionTitle,
    exhibitionSlug: inquiry.exhibitionSlug,
    artwork,
  });

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(fullWidth && "w-full", className)}
      render={<a href={href} />}
    >
      <Mail className="size-4" />
      Contact about this work
    </Button>
  );
}
