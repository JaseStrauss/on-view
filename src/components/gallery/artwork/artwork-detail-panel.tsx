import { X } from "lucide-react";
import { ArtworkDetailContent } from "@/components/gallery/artwork/artwork-detail-content";
import type { PlacementWithArtwork } from "@/types";
import { Button } from "@/components/ui/button";

interface ArtworkDetailPanelProps {
  placement: PlacementWithArtwork | null;
  onClose: () => void;
  onExpand?: () => void;
}

export function ArtworkDetailPanel({
  placement,
  onClose,
  onExpand,
}: ArtworkDetailPanelProps) {
  if (!placement) return null;

  const { artwork } = placement;

  return (
    <aside
      className="hidden w-full shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-card md:flex md:w-80 md:self-stretch"
      role="complementary"
      aria-label={`Details for ${artwork.title}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Wall label
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close artwork details"
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      <ArtworkDetailContent placement={placement} onExpand={onExpand} />
    </aside>
  );
}
