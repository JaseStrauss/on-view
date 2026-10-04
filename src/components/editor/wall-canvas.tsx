import { useCallback, useEffect, useRef, useState } from "react";
import type { WallDefinition } from "@/types";
import type { PlacementWithArtwork } from "@/types";
import {
  artworkSizeM,
  clampPlacement,
  clampScale,
  DEFAULT_HANG_HEIGHT_M,
  normalizeRotation,
  pointerToWorld,
  type WallPoint,
} from "@/lib/gallery/wall-coordinates";
import {
  PlacementFrame,
  type PlacementTransform,
} from "./placement-frame";

export type PlacementPatch = Partial<{
  wall_id: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation_deg: number;
}>;

interface WallCanvasProps {
  wall: WallDefinition;
  walls: WallDefinition[];
  placements: PlacementWithArtwork[];
  selectedPlacementId: string | null;
  pendingArtworkId: string | null;
  onSelectPlacement: (placementId: string | null) => void;
  onPlacementUpdate: (
    placementId: string,
    patch: PlacementPatch,
  ) => void | Promise<void>;
  onPlacementAdd: (
    artworkId: string,
    position: WallPoint,
  ) => void | Promise<void>;
  resolveWallAtPointer?: (clientX: number, clientY: number) => string | null;
  onCrossWallHover?: (wallId: string | null) => void;
  onMovedToWall?: (placementId: string, wallId: string) => void;
  resolveCatalogAtPointer?: (clientX: number, clientY: number) => boolean;
  onCatalogHoverChange?: (isOver: boolean) => void;
  onPlacementRemove?: (placementId: string) => void | Promise<void>;
}

type DragState =
  | {
    mode: "move";
    placementId: string;
    offset: WallPoint;
  }
  | {
    mode: "resize";
    placementId: string;
    startScale: number;
    startDistance: number;
    centerX: number;
    centerY: number;
  }
  | {
    mode: "rotate";
    placementId: string;
    startRotation: number;
    startAngle: number;
    centerX: number;
    centerY: number;
  };

function getPlacementTransform(
  placement: PlacementWithArtwork,
  preview?: Partial<PlacementTransform>,
): PlacementTransform {
  return {
    position: preview?.position ?? {
      x: placement.position_x,
      y: placement.position_y,
    },
    scale: preview?.scale ?? placement.scale,
    rotation_deg: preview?.rotation_deg ?? placement.rotation_deg ?? 0,
  };
}

export function WallCanvas({
  wall,
  walls,
  placements,
  selectedPlacementId,
  pendingArtworkId,
  onSelectPlacement,
  onPlacementUpdate,
  onPlacementAdd,
  resolveWallAtPointer,
  onCrossWallHover,
  onMovedToWall,
  resolveCatalogAtPointer,
  onCatalogHoverChange,
  onPlacementRemove,
}: WallCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const placementsRef = useRef(placements);
  const onPlacementUpdateRef = useRef(onPlacementUpdate);
  const wallRef = useRef(wall);
  const wallsRef = useRef(walls);
  const resolveWallAtPointerRef = useRef(resolveWallAtPointer);
  const onCrossWallHoverRef = useRef(onCrossWallHover);
  const onMovedToWallRef = useRef(onMovedToWall);
  const resolveCatalogAtPointerRef = useRef(resolveCatalogAtPointer);
  const onCatalogHoverChangeRef = useRef(onCatalogHoverChange);
  const onPlacementRemoveRef = useRef(onPlacementRemove);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const dragListenersRef = useRef<{
    move: (event: PointerEvent) => void;
    up: () => void;
  } | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [transformPreview, setTransformPreview] = useState<
    Record<string, Partial<PlacementTransform>>
  >({});
  const transformPreviewRef = useRef(transformPreview);

  placementsRef.current = placements;
  onPlacementUpdateRef.current = onPlacementUpdate;
  transformPreviewRef.current = transformPreview;
  wallRef.current = wall;
  wallsRef.current = walls;
  resolveWallAtPointerRef.current = resolveWallAtPointer;
  onCrossWallHoverRef.current = onCrossWallHover;
  onMovedToWallRef.current = onMovedToWall;
  resolveCatalogAtPointerRef.current = resolveCatalogAtPointer;
  onCatalogHoverChangeRef.current = onCatalogHoverChange;
  onPlacementRemoveRef.current = onPlacementRemove;

  const wallPlacements = placements.filter((p) => p.wall_id === wall.id);

  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    setCanvasSize({ width, height });
  }, []);

  useEffect(() => {
    updateCanvasSize();
    const element = canvasRef.current;
    if (!element) return;

    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateCanvasSize, wall.id]);

  const detachDragListeners = useCallback(() => {
    const listeners = dragListenersRef.current;
    if (!listeners) return;

    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.up);
    dragListenersRef.current = null;
  }, []);

  const attachDragListeners = useCallback(() => {
    if (dragListenersRef.current) return;

    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;
      const canvas = canvasRef.current;
      const currentWall = wallRef.current;
      if (!dragState || !canvas) return;

      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      const placement = placementsRef.current.find(
        (p) => p.id === dragState.placementId,
      );
      if (!placement) return;

      if (dragState.mode === "move") {
        const hoverWallId =
          resolveWallAtPointerRef.current?.(
            event.clientX,
            event.clientY,
          ) ?? null;
        onCrossWallHoverRef.current?.(hoverWallId);

        const overCatalog =
          resolveCatalogAtPointerRef.current?.(
            event.clientX,
            event.clientY,
          ) ?? false;
        onCatalogHoverChangeRef.current?.(overCatalog);

        const point = pointerToWorld(
          event.clientX,
          event.clientY,
          canvas,
          currentWall,
        );
        const preview = transformPreviewRef.current[dragState.placementId];
        const scale = preview?.scale ?? placement.scale;
        const sizeM = artworkSizeM(
          placement.artwork.width_cm,
          placement.artwork.height_cm,
          scale,
        );
        const next = clampPlacement(
          {
            x: point.x - dragState.offset.x,
            y: point.y - dragState.offset.y,
          },
          sizeM,
          currentWall,
        );

        setTransformPreview((prev) => ({
          ...prev,
          [dragState.placementId]: { ...prev[dragState.placementId], position: next },
        }));
        return;
      }

      if (dragState.mode === "resize") {
        const distance = Math.hypot(
          event.clientX - dragState.centerX,
          event.clientY - dragState.centerY,
        );
        const ratio =
          dragState.startDistance > 0
            ? distance / dragState.startDistance
            : 1;
        const nextScale = clampScale(dragState.startScale * ratio);

        setTransformPreview((prev) => ({
          ...prev,
          [dragState.placementId]: { ...prev[dragState.placementId], scale: nextScale },
        }));
        return;
      }

      if (dragState.mode === "rotate") {
        const angle = Math.atan2(
          event.clientY - dragState.centerY,
          event.clientX - dragState.centerX,
        );
        const deltaDeg =
          (angle - dragState.startAngle) * (180 / Math.PI);
        const nextRotation = normalizeRotation(
          dragState.startRotation + deltaDeg,
        );

        setTransformPreview((prev) => ({
          ...prev,
          [dragState.placementId]: {
            ...prev[dragState.placementId],
            rotation_deg: nextRotation,
          },
        }));
      }
    }

    function handlePointerUp() {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const placementId = dragState.placementId;
      const placement = placementsRef.current.find((p) => p.id === placementId);
      const currentWall = wallRef.current;
      dragStateRef.current = null;
      detachDragListeners();
      onCrossWallHoverRef.current?.(null);
      onCatalogHoverChangeRef.current?.(false);

      const droppedOnCatalog =
        dragState.mode === "move" &&
        (resolveCatalogAtPointerRef.current?.(
          lastPointerRef.current.x,
          lastPointerRef.current.y,
        ) ?? false);

      if (droppedOnCatalog) {
        void onPlacementRemoveRef.current?.(placementId);
        setTransformPreview((prev) => {
          const copy = { ...prev };
          delete copy[placementId];
          return copy;
        });
        return;
      }

      setTransformPreview((prev) => {
        const preview = prev[placementId];
        const patch: PlacementPatch = {};

        if (preview?.position) {
          patch.position_x = preview.position.x;
          patch.position_y = preview.position.y;
        }
        if (preview?.scale !== undefined) {
          patch.scale = preview.scale;
        }
        if (preview?.rotation_deg !== undefined) {
          patch.rotation_deg = preview.rotation_deg;
        }

        if (dragState.mode === "move" && placement) {
          const targetWallId = resolveWallAtPointerRef.current?.(
            lastPointerRef.current.x,
            lastPointerRef.current.y,
          );
          if (targetWallId && targetWallId !== currentWall.id) {
            const targetWall = wallsRef.current.find(
              (w) => w.id === targetWallId,
            );
            if (targetWall) {
              const scale = preview?.scale ?? placement.scale;
              const sizeM = artworkSizeM(
                placement.artwork.width_cm,
                placement.artwork.height_cm,
                scale,
              );
              const position = clampPlacement(
                preview?.position ?? {
                  x: placement.position_x,
                  y: placement.position_y,
                },
                sizeM,
                targetWall,
              );
              patch.wall_id = targetWallId;
              patch.position_x = position.x;
              patch.position_y = position.y;
              onMovedToWallRef.current?.(placementId, targetWallId);
            }
          }
        }

        if (Object.keys(patch).length > 0) {
          void onPlacementUpdateRef.current(placementId, patch);
        }

        const copy = { ...prev };
        delete copy[placementId];
        return copy;
      });
    }

    dragListenersRef.current = {
      move: handlePointerMove,
      up: handlePointerUp,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }, [detachDragListeners]);

  useEffect(() => () => detachDragListeners(), [detachDragListeners]);

  const canvasRect =
    canvasSize.width > 0
      ? {
        wallWidthM: wall.width,
        wallHeightM: wall.height,
        canvasWidthPx: canvasSize.width,
        canvasHeightPx: canvasSize.height,
      }
      : null;

  function resolveDropPosition(clientX: number, clientY: number): WallPoint {
    if (!canvasRef.current) {
      return { x: 0, y: DEFAULT_HANG_HEIGHT_M };
    }

    const point = pointerToWorld(
      clientX,
      clientY,
      canvasRef.current,
      wall,
    );
    const sizeM = artworkSizeM(null, null, 1);
    return clampPlacement(point, sizeM, wall);
  }

  function getFrameCenterOnScreen(placement: PlacementWithArtwork) {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const transform = getPlacementTransform(
      placement,
      transformPreview[placement.id],
    );
    const centreX =
      ((transform.position.x + wall.width / 2) / wall.width) * rect.width;
    const centreY =
      (1 - transform.position.y / wall.height) * rect.height;
    return {
      x: rect.left + centreX,
      y: rect.top + centreY,
    };
  }

  function startMove(placement: PlacementWithArtwork, event: React.PointerEvent) {
    if (!canvasRef.current) return;

    const transform = getPlacementTransform(
      placement,
      transformPreview[placement.id],
    );
    const pointer = pointerToWorld(
      event.clientX,
      event.clientY,
      canvasRef.current,
      wall,
    );

    dragStateRef.current = {
      mode: "move",
      placementId: placement.id,
      offset: {
        x: pointer.x - transform.position.x,
        y: pointer.y - transform.position.y,
      },
    };
    attachDragListeners();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function startResize(placement: PlacementWithArtwork, event: React.PointerEvent) {
    const center = getFrameCenterOnScreen(placement);
    if (!center) return;

    const transform = getPlacementTransform(
      placement,
      transformPreview[placement.id],
    );
    const startDistance = Math.hypot(
      event.clientX - center.x,
      event.clientY - center.y,
    );

    dragStateRef.current = {
      mode: "resize",
      placementId: placement.id,
      startScale: transform.scale,
      startDistance: Math.max(startDistance, 24),
      centerX: center.x,
      centerY: center.y,
    };
    attachDragListeners();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function startRotate(placement: PlacementWithArtwork, event: React.PointerEvent) {
    const center = getFrameCenterOnScreen(placement);
    if (!center) return;

    const transform = getPlacementTransform(
      placement,
      transformPreview[placement.id],
    );
    const startAngle = Math.atan2(
      event.clientY - center.y,
      event.clientX - center.x,
    );

    dragStateRef.current = {
      mode: "rotate",
      placementId: placement.id,
      startRotation: transform.rotation_deg,
      startAngle,
      centerX: center.x,
      centerY: center.y,
    };
    attachDragListeners();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  async function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    const artworkId =
      event.dataTransfer.getData("artworkId") || pendingArtworkId;
    if (!artworkId) return;

    const position = resolveDropPosition(event.clientX, event.clientY);
    await onPlacementAdd(artworkId, position);
  }

  async function handleCanvasClick(event: React.MouseEvent) {
    if (!pendingArtworkId || !canvasRef.current) return;
    if ((event.target as HTMLElement).closest("[data-placement-frame]")) return;

    const position = resolveDropPosition(event.clientX, event.clientY);
    await onPlacementAdd(pendingArtworkId, position);
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full cursor-crosshair overflow-hidden rounded-lg border border-stone-300 bg-stone-100 shadow-inner"
      style={{ aspectRatio: `${wall.width} / ${wall.height}` }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed border-stone-400"
        aria-hidden
      />
      <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] uppercase tracking-wider text-stone-400">
        Floor
      </p>

      {canvasRect &&
        wallPlacements.map((placement) => (
          <div key={placement.id} data-placement-frame>
            <PlacementFrame
              placement={placement}
              canvasRect={canvasRect}
              transform={getPlacementTransform(
                placement,
                transformPreview[placement.id],
              )}
              isSelected={selectedPlacementId === placement.id}
              onSelect={() => onSelectPlacement(placement.id)}
              onMoveStart={(event) => startMove(placement, event)}
              onResizeStart={(event) => startResize(placement, event)}
              onRotateStart={(event) => startRotate(placement, event)}
              onRemove={() => {
                void onPlacementRemove?.(placement.id);
                onSelectPlacement(null);
              }}
            />
          </div>
        ))}

      {pendingArtworkId && (
        <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs text-muted-foreground">
          Click the wall or drag an artwork here to place it
        </p>
      )}
    </div>
  );
}
