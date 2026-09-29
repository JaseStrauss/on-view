import { getArtworkImageUrl } from "@/services/artworks";
import type { Artwork } from "@/types/artwork";
import { cn } from "@/lib/utils";

interface ArtworkPaletteProps {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (artworkId: string | null) => void;
}

export function ArtworkPalette({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
}: ArtworkPaletteProps) {
  if (artworks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All catalogue works are placed, or none have images yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {artworks.map((artwork) => {
        const imageUrl = getArtworkImageUrl(artwork.image_path);
        const isSelected = selectedArtworkId === artwork.id;

        return (
          <li key={artwork.id}>
            <button
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("artworkId", artwork.id);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => onSelectArtwork(isSelected ? null : artwork.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50",
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
                  {artwork.artist}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
