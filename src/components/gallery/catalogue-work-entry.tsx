import { ExpandImageButton } from "@/components/gallery/artwork-lightbox";
import { ArtworkCaption } from "@/components/gallery/artwork-caption";
import { getArtworkImageUrl } from "@/services/artworks";
import type { PlacementWithArtwork } from "@/types";
import { cn } from "@/lib/utils";

interface CatalogueWorkEntryProps {
  placement: PlacementWithArtwork;
  index: number;
  isSelected?: boolean;
  onSelect: () => void;
  onExpand: () => void;
}

export function CatalogueWorkEntry({
  placement,
  index,
  isSelected = false,
  onSelect,
  onExpand,
}: CatalogueWorkEntryProps) {
  const { artwork } = placement;
  const imageUrl = getArtworkImageUrl(artwork.image_path);

  const entryLabel = String(index + 1).padStart(2, "0");

  return (
    <article
      className={cn(
        "group border-b border-border/60 pt-12 pb-16 first:pt-0 last:border-b-0 last:pb-0 md:pb-24",
        isSelected && "rounded-lg ring-1 ring-foreground/10",
      )}
      aria-labelledby={`work-${placement.id}-label`}
    >
      <div className="relative mx-auto w-full max-w-4xl">
        {imageUrl ? (
          <div className="relative flex min-h-[280px] items-center justify-center bg-muted/40 px-6 py-10 md:min-h-[420px] md:px-12 md:py-16">
            <ExpandImageButton onClick={onExpand} />
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                "block w-full cursor-pointer text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              )}
            >
              <img
                src={imageUrl}
                alt={artwork.title}
                loading="lazy"
                decoding="async"
                className="mx-auto max-h-[min(65vh,720px)] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "flex min-h-[200px] w-full items-center justify-center bg-muted/40 text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
            )}
          >
            No image
          </button>
        )}
      </div>

      <div className="mx-auto mt-0 max-w-4xl px-2 md:px-6">
        <div className="flex gap-5 md:gap-8">
          <p
            id={`work-${placement.id}-label`}
            className="w-7 shrink-0 pt-6 font-sans text-xs tabular-nums text-muted-foreground md:w-8"
          >
            {entryLabel}
          </p>
          <div className="min-w-0 flex-1">
            <ArtworkCaption artwork={artwork} variant="catalogue" />
          </div>
        </div>
      </div>
    </article>
  );
}
