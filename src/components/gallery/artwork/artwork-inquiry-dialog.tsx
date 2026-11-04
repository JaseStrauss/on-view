import { useEffect, useRef } from "react";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  buildArtworkInquiryContent,
  buildArtworkInquiryMailto,
  canInquireAboutArtwork,
  normalizeContactEmail,
} from "@/lib/exhibition/inquiry";
import type { Artwork } from "@/types/artwork";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ArtworkInquiryContext } from "@/lib/exhibition/inquiry";

interface ArtworkInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork;
  inquiry: ArtworkInquiryContext;
}

export function ArtworkInquiryDialog({
  open,
  onOpenChange,
  artwork,
  inquiry,
}: ArtworkInquiryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const email = normalizeContactEmail(inquiry.contactEmail);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !email) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, email]);

  if (!email || !canInquireAboutArtwork(artwork, email)) {
    return null;
  }

  const content = buildArtworkInquiryContent({
    contactEmail: email,
    exhibitionTitle: inquiry.exhibitionTitle,
    exhibitionSlug: inquiry.exhibitionSlug,
    artwork,
  });
  const mailtoHref = buildArtworkInquiryMailto({
    contactEmail: email,
    exhibitionTitle: inquiry.exhibitionTitle,
    exhibitionSlug: inquiry.exhibitionSlug,
    artwork,
  });

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Could not copy. Select the text and copy manually.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50",
      )}
      onClose={() => onOpenChange(false)}
      aria-labelledby="artwork-inquiry-title"
    >
      <form method="dialog" className="flex max-h-[min(85vh,560px)] flex-col">
        <div className="border-b border-border px-5 py-4">
          <h2 id="artwork-inquiry-title" className="font-serif text-lg italic">
            Contact about this work
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send via your email app, or copy the message if mailto is not
            available on your device.
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <p className="text-sm">
            <span className="text-muted-foreground">To: </span>
            <span className="font-medium">{content.to}</span>
          </p>

          <textarea
            readOnly
            rows={8}
            value={content.body}
            aria-label="Inquiry message"
            className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm leading-relaxed"
            onFocus={(event) => event.target.select()}
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="sm:flex-1"
            render={
              <a href={mailtoHref} target="_blank" rel="noopener noreferrer" />
            }
          >
            <Mail className="size-4" />
            Open in email
          </Button>
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() =>
              void copyText(
                `${content.subject}\n\n${content.body}`,
                "Inquiry copied",
              )
            }
          >
            <Copy className="size-4" />
            Copy message
          </Button>
          <Button type="submit" variant="ghost" className="sm:ml-auto">
            Close
          </Button>
        </div>
      </form>
    </dialog>
  );
}
