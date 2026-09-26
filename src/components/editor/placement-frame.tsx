import { X } from "lucide-react";
import { getArtworkImageUrl } from "@/services/artworks";
import {
  artworkSizeM,
  worldToFramePixels,
  worldToPixelCenter,
  type WallCanvasRect,
  type WallPoint,
} from "@/lib/wall-coordinates";
import type { PlacementWithArtwork } from "@/types";
import { cn } from "@/lib/utils";

export interface PlacementTransform {
  position: WallPoint;
  scale: number;
  rotation_deg: number;
}

interface PlacementFrameProps {
  placement: PlacementWithArtwork;
  canvasRect: WallCanvasRect;
  transform: PlacementTransform;
  isSelected: boolean;
  onSelect: () => void;
  onMoveStart: (event: React.PointerEvent) => void;
  onResizeStart: (event: React.PointerEvent) => void;
  onRotateStart: (event: React.PointerEvent) => void;
  onRemove?: () => void;
}

export function PlacementFrame({
  placement,
  canvasRect,
  transform,
  isSelected,
  onSelect,
  onMoveStart,
  onResizeStart,
  onRotateStart,
  onRemove,
}: PlacementFrameProps) {
  const sizeM = artworkSizeM(
    placement.artwork.width_cm,
    placement.artwork.height_cm,
    transform.scale,
  );
  const frame = worldToFramePixels(transform.position, sizeM, canvasRect);
  const centre = worldToPixelCenter(transform.position, canvasRect);
  const imageUrl = getArtworkImageUrl(placement.artwork.image_path);

  return (
    <div
      className="absolute touch-none"
      style={{
        left: centre.left,
        top: centre.top,
        width: frame.width,
        height: frame.height,
        transform: `translate(-50%, -50%) rotate(${transform.rotation_deg}deg)`,
      }}
    >
      <button
        type="button"
        className={cn(
          "relative h-full w-full overflow-hidden rounded-sm border-2 bg-stone-800 shadow-md transition-shadow",
          isSelected
            ? "border-primary ring-2 ring-primary/30"
            : "border-stone-900 hover:border-stone-600",
        )}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).dataset.handle) return;
          event.stopPropagation();
          onSelect();
          onMoveStart(event);
        }}
        title={`${placement.artwork.title}: drag to reposition`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={placement.artwork.title}
            className="pointer-events-none h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-1 text-[10px] text-stone-400">
            No image
          </span>
        )}
      </button>

      {isSelected && onRemove && (
        <button
          type="button"
          className="absolute -right-2 -top-2 z-20 flex size-5 items-center justify-center rounded-full border border-border bg-background text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
          title="Remove from wall"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <X className="size-3" />
        </button>
      )}

      {isSelected && (
        <>
          <div
            className="pointer-events-none absolute -top-5 left-1/2 h-4 w-px -translate-x-1/2 bg-primary"
            aria-hidden
          />
          <button
            type="button"
            data-handle="rotate"
            className="absolute -top-7 left-1/2 z-10 size-3.5 -translate-x-1/2 rounded-full border-2 border-primary bg-white shadow"
            title="Drag to rotate"
            onPointerDown={(event) => {
              event.stopPropagation();
              onRotateStart(event);
            }}
          />
          <button
            type="button"
            data-handle="resize"
            className="absolute -bottom-1.5 -right-1.5 z-10 size-3.5 rounded-full border-2 border-primary bg-white shadow"
            title="Drag to resize"
            onPointerDown={(event) => {
              event.stopPropagation();
              onResizeStart(event);
            }}
          />
        </>
      )}
    </div>
  );
}
