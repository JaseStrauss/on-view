import { useEffect } from "react";
import { X } from "lucide-react";
import { ArtworkDetailContent } from "@/components/gallery/artwork/artwork-detail-content";
import type { PlacementWithArtwork } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArtworkDetailBottomSheetProps {
  placement: PlacementWithArtwork | null;
  open: boolean;
  onClose: () => void;
  onExpand?: () => void;
}

export function ArtworkDetailBottomSheet({
  placement,
  open,
  onClose,
  onExpand,
}: ArtworkDetailBottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !placement) return null;

  const { artwork } = placement;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        aria-hidden
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border border-border bg-card shadow-xl md:hidden",
          "animate-in slide-in-from-bottom duration-200",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${artwork.title}`}
      >
        <div className="flex items-center justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Wall label
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close artwork details"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto">
          <ArtworkDetailContent
            placement={placement}
            onExpand={onExpand}
            expandLabel="Tap image for full screen"
          />
        </div>
      </aside>
    </>
  );
}
