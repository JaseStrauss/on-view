import { useState } from "react";
import { Mail } from "lucide-react";
import {
  canInquireAboutArtwork,
  normalizeContactEmail,
} from "@/lib/exhibition/inquiry";
import type { ArtworkInquiryContext } from "@/lib/exhibition/inquiry";
import { ArtworkInquiryDialog } from "@/components/gallery/artwork/artwork-inquiry-dialog";
import type { Artwork } from "@/types/artwork";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type { ArtworkInquiryContext } from "@/lib/exhibition/inquiry";
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
  const [open, setOpen] = useState(false);
  const email = normalizeContactEmail(inquiry.contactEmail);
  if (!email || !canInquireAboutArtwork(artwork, email)) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(fullWidth && "w-full", className)}
        onClick={() => setOpen(true)}
      >
        <Mail className="size-4" />
        Contact about this work
      </Button>

      <ArtworkInquiryDialog
        open={open}
        onOpenChange={setOpen}
        artwork={artwork}
        inquiry={inquiry}
      />
    </>
  );
}
