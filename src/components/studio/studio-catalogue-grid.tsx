import { DeleteArtworkControl } from "@/components/studio/delete-artwork-control";
import { ARTWORK_STATUS_LABELS } from "@/lib/artwork/form";
import { cn } from "@/lib/utils";
import { getArtworkImageUrl } from "@/services/artworks";
import type { Artwork } from "@/types/artwork";

interface StudioCatalogueGridProps {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelect: (artwork: Artwork) => void;
  onDeleted: (artworkId: string) => void;
  readOnly?: boolean;
}

export function StudioCatalogueGrid({
  artworks,
  selectedArtworkId,
  onSelect,
  onDeleted,
  readOnly = false,
}: StudioCatalogueGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork) => {
        const imageUrl = getArtworkImageUrl(artwork.image_path);

        return (
          <article
            key={artwork.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card text-left transition-colors",
              "hover:border-foreground/20 hover:bg-card/80",
              selectedArtworkId === artwork.id && "ring-1 ring-ring",
            )}
          >
            <div
              className={cn(
                "absolute top-3 right-3 z-10 transition-opacity",
                !readOnly &&
                  "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
              )}
            >
              {!readOnly && (
                <DeleteArtworkControl
                  variant="icon"
                  artwork={artwork}
                  onDeleted={onDeleted}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect(artwork)}
              className={cn(
                "block w-full text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <div className="aspect-[4/5] bg-muted">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={artwork.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-5">
                <p className="font-medium leading-snug">{artwork.title}</p>
                {(artwork.artist || artwork.year) && (
                  <p className="text-sm text-muted-foreground">
                    {[artwork.artist, artwork.year?.toString()]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {ARTWORK_STATUS_LABELS[artwork.status]}
                </p>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
