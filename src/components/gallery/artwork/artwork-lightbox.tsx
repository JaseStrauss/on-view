import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { ArtworkCaption } from "@/components/gallery/artwork/artwork-caption";
import { getArtworkImageUrl } from "@/services/artworks";
import type { PlacementWithArtwork } from "@/types";
import { cn } from "@/lib/utils";

interface ArtworkLightboxProps {
  placements: PlacementWithArtwork[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ArtworkLightbox({
  placements,
  index,
  onClose,
  onIndexChange,
}: ArtworkLightboxProps) {
  const open = index !== null && index >= 0 && index < placements.length;
  const placement = open ? placements[index] : null;
  const imageUrl = placement
    ? getArtworkImageUrl(placement.artwork.image_path)
    : null;

  const goPrev = useCallback(() => {
    if (index === null || placements.length === 0) return;
    onIndexChange((index - 1 + placements.length) % placements.length);
  }, [index, onIndexChange, placements.length]);

  const goNext = useCallback(() => {
    if (index === null || placements.length === 0) return;
    onIndexChange((index + 1) % placements.length);
  }, [index, onIndexChange, placements.length]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !placement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950/98 text-neutral-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${placement.artwork.title}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 md:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
          {index + 1} / {placements.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-4 md:px-12">
        {placements.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white md:left-6"
              aria-label="Previous work"
            >
              <ChevronLeft className="size-8" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white md:right-6"
              aria-label="Next work"
            >
              <ChevronRight className="size-8" />
            </button>
          </>
        )}

        <div className="flex max-h-full w-full max-w-6xl flex-col items-center gap-8 md:gap-10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={placement.artwork.title}
              className="max-h-[min(62vh,900px)] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex h-64 w-full max-w-lg items-center justify-center border border-neutral-800 text-neutral-500">
              Image unavailable
            </div>
          )}

          <ArtworkCaption
            artwork={placement.artwork}
            variant="catalogue"
            align="center"
            className="mx-auto max-w-lg [&_p]:text-neutral-100 [&_.text-muted-foreground]:text-neutral-400"
          />
        </div>
      </div>
    </div>
  );
}

interface ExpandImageButtonProps {
  onClick: () => void;
  className?: string;
}

export function ExpandImageButton({ onClick, className }: ExpandImageButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus:opacity-100",
        className,
      )}
      aria-label="View full screen"
    >
      <Maximize2 className="size-4" />
    </button>
  );
}
