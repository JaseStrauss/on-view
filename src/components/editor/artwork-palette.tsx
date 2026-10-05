import { X } from "lucide-react";
import { getArtworkImageUrl } from "@/services/artworks";
import type { Artwork } from "@/types/artwork";
import { cn } from "@/lib/utils";

interface ArtworkPaletteProps {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  placedArtworkIds?: Set<string>;
  onSelectArtwork: (artworkId: string | null) => void;
  onRemoveFromCatalogue?: (artworkId: string) => void;
}

export function ArtworkPalette({
  artworks,
  selectedArtworkId,
  placedArtworkIds,
  onSelectArtwork,
  onRemoveFromCatalogue,
}: ArtworkPaletteProps) {
  if (artworks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No works in this catalogue yet, or none have images.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {artworks.map((artwork) => {
        const imageUrl = getArtworkImageUrl(artwork.image_path);
        const isSelected = selectedArtworkId === artwork.id;
        const isOnWall = placedArtworkIds?.has(artwork.id) ?? false;

        return (
          <li key={artwork.id}>
            <div
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border p-2 transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <button
                type="button"
                draggable={!isOnWall}
                disabled={isOnWall}
                onDragStart={(event) => {
                  if (isOnWall) return;
                  event.dataTransfer.setData("artworkId", artwork.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onSelectArtwork(isSelected ? null : artwork.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 text-left",
                  isOnWall
                    ? "cursor-default opacity-70"
                    : "hover:opacity-90",
                )}
              >
                <div className="size-12 shrink-0 overflow-hidden rounded bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{artwork.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isOnWall
                      ? "On a wall"
                      : artwork.artist || "Drag onto a wall"}
                  </p>
                </div>
              </button>
              {onRemoveFromCatalogue && (
                <button
                  type="button"
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${artwork.title} from catalogue`}
                  onClick={() => onRemoveFromCatalogue(artwork.id)}
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
