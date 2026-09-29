import { Maximize2 } from "lucide-react";
import { ArtworkCaption } from "@/components/gallery/artwork-caption";
import { getArtworkImageUrl } from "@/services/artworks";
import type { PlacementWithArtwork } from "@/types";
import { Button } from "@/components/ui/button";

interface ArtworkDetailContentProps {
  placement: PlacementWithArtwork;
  onExpand?: () => void;
  expandLabel?: string;
}

export function ArtworkDetailContent({
  placement,
  onExpand,
  expandLabel = "Click image for full screen",
}: ArtworkDetailContentProps) {
  const { artwork } = placement;
  const imageUrl = getArtworkImageUrl(artwork.image_path);

  return (
    <>
      {imageUrl && (
        <button
          type="button"
          onClick={onExpand}
          className="group border-b border-border bg-muted/30 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          disabled={!onExpand}
        >
          <img
            src={imageUrl}
            alt={artwork.title}
            className="mx-auto max-h-56 w-auto max-w-full object-contain transition-transform group-hover:scale-[1.02]"
          />
          {onExpand && (
            <p className="mt-3 text-center text-xs text-muted-foreground group-hover:text-foreground">
              {expandLabel}
            </p>
          )}
        </button>
      )}

      <div className="flex flex-1 flex-col gap-5 p-5">
        <ArtworkCaption artwork={artwork} variant="wall-label" />

        {onExpand && (
          <Button variant="outline" className="w-full" onClick={onExpand}>
            <Maximize2 className="size-4" />
            View full screen
          </Button>
        )}
      </div>
    </>
  );
}
