import { ExpandImageButton } from "@/components/gallery/artwork-lightbox";
import { getArtworkImageUrl } from "@/services/artworks";
import type { PlacementWithArtwork } from "@/types";
import { cn } from "@/lib/utils";

interface CatalogueWorkGridProps {
  placements: PlacementWithArtwork[];
  selectedPlacementId: string | null;
  onSelect: (placementId: string) => void;
  onExpand: (placementId: string) => void;
}

export function CatalogueWorkGrid({
  placements,
  selectedPlacementId,
  onSelect,
  onExpand,
}: CatalogueWorkGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {placements.map((placement, index) => {
        const { artwork } = placement;
        const imageUrl = getArtworkImageUrl(artwork.image_path);
        const isSelected = selectedPlacementId === placement.id;

        return (
          <article
            key={placement.id}
            id={`work-${placement.id}`}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-colors",
              "hover:border-foreground/20",
              isSelected && "ring-1 ring-ring",
            )}
          >
            <div className="relative aspect-[4/5] bg-muted/40">
              {imageUrl ? (
                <>
                  <ExpandImageButton onClick={() => onExpand(placement.id)} />
                  <button
                    type="button"
                    onClick={() => onSelect(placement.id)}
                    className={cn(
                      "block h-full w-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-3"
                    />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(placement.id)}
                  className="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
                >
                  No image
                </button>
              )}
              <span
                className="pointer-events-none absolute top-3 left-3 font-sans text-[0.65rem] tabular-nums text-muted-foreground"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(placement.id)}
              className={cn(
                "w-full space-y-1 p-5 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              )}
            >
              <p className="font-medium leading-snug">{artwork.title}</p>
              {(artwork.artist || artwork.year) && (
                <p className="text-sm text-muted-foreground">
                  {[artwork.artist, artwork.year?.toString()]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </button>
          </article>
        );
      })}
    </div>
  );
}
