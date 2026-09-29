import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteArtwork } from "@/services/artworks";
import type { Artwork } from "@/types/artwork";

interface DeleteArtworkControlProps {
  artwork: Artwork;
  onDeleted?: (artworkId: string) => void;
  variant?: "icon" | "section";
  className?: string;
}

export function DeleteArtworkControl({
  artwork,
  onDeleted,
  variant = "section",
  className,
}: DeleteArtworkControlProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteArtwork(artwork);
      toast.success(`"${artwork.title}" removed from catalogue`);
      onDeleted?.(artwork.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete artwork",
      );
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (variant === "icon") {
    if (confirming) {
      return (
        <div
          className={cn(
            "flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm",
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="px-1 text-xs text-muted-foreground">Delete?</span>
          <Button
            type="button"
            variant="destructive"
            size="xs"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "…" : "Yes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={deleting}
            onClick={() => setConfirming(false)}
          >
            No
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          "bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-destructive",
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
          setConfirming(true);
        }}
        aria-label={`Delete ${artwork.title}`}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-destructive/20 bg-destructive/5 p-5",
        className,
      )}
    >
      <h2 className="font-medium text-destructive">Delete artwork</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Remove <span className="font-medium text-foreground">{artwork.title}</span>{" "}
        from your catalogue? This also removes it from any exhibitions.
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Confirm delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-4 text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-4" />
          Delete artwork
        </Button>
      )}
    </section>
  );
}
