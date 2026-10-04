import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import type { Artwork } from "@/types/artwork";
import type { PlacementWithArtwork, RoomTemplate, WallDefinition } from "@/types";
import {
  clampScale,
  DEFAULT_HANG_HEIGHT_M,
  MAX_PLACEMENT_SCALE,
  MIN_PLACEMENT_SCALE,
  normalizeRotation,
  type WallPoint,
} from "@/lib/wall-coordinates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArtworkPalette } from "./artwork-palette";
import { WallCanvas, type PlacementPatch } from "./wall-canvas";
import { cn } from "@/lib/utils";

const WALL_EDITOR_HINT_KEY = "on-view-wall-editor-hint-dismissed";

function isWallEditorHintDismissed(): boolean {
  return localStorage.getItem(WALL_EDITOR_HINT_KEY) === "1";
}

function dismissWallEditorHint(): void {
  localStorage.setItem(WALL_EDITOR_HINT_KEY, "1");
}

interface WallEditorProps {
  room: RoomTemplate;
  exhibitionId?: string;
  placements: PlacementWithArtwork[];
  availableArtworks: Artwork[];
  onPlacementAdd: (
    artworkId: string,
    wallId: string,
    position_x: number,
    position_y: number,
  ) => void | Promise<void>;
  onPlacementUpdate: (
    placementId: string,
    patch: PlacementPatch,
  ) => void | Promise<void>;
  onPlacementRemove: (placementId: string) => void | Promise<void>;
  /** Studio root for catalogue links (e.g. `/studio/demo` in the demo builder). */
  studioBasePath?: string;
}

export function WallEditor({
  room,
  exhibitionId,
  placements,
  availableArtworks,
  onPlacementAdd,
  onPlacementUpdate,
  onPlacementRemove,
  studioBasePath = "/studio",
}: WallEditorProps) {
  const [activeWallId, setActiveWallId] = useState(room.walls[0]?.id ?? "");
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
    null,
  );
  const [pendingArtworkId, setPendingArtworkId] = useState<string | null>(null);
  const [crossWallHoverId, setCrossWallHoverId] = useState<string | null>(null);
  const [catalogDropHover, setCatalogDropHover] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(isWallEditorHintDismissed);
  const wallTabRefs = useRef(new Map<string, HTMLButtonElement>());
  const catalogDropRef = useRef<HTMLDivElement>(null);

  const showFirstTimeHint =
    !hintDismissed && placements.length === 0 && availableArtworks.length > 0;

  useEffect(() => {
    if (placements.length > 0 && !hintDismissed) {
      dismissWallEditorHint();
      setHintDismissed(true);
    }
  }, [placements.length, hintDismissed]);

  const resolveWallAtPointer = useCallback((clientX: number, clientY: number) => {
    for (const wall of room.walls) {
      const element = wallTabRefs.current.get(wall.id);
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return wall.id;
      }
    }
    return null;
  }, [room.walls]);

  const handleMovedToWall = useCallback(
    (_placementId: string, wallId: string) => {
      setActiveWallId(wallId);
    },
    [],
  );

  const resolveCatalogAtPointer = useCallback((clientX: number, clientY: number) => {
    const element = catalogDropRef.current;
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }, []);

  const handlePlacementRemove = useCallback(
    async (placementId: string) => {
      await onPlacementRemove(placementId);
      setSelectedPlacementId((current) =>
        current === placementId ? null : current,
      );
    },
    [onPlacementRemove],
  );

  const activeWall = useMemo(
    () => room.walls.find((w) => w.id === activeWallId) ?? room.walls[0],
    [room.walls, activeWallId],
  );

  const wallPlacementCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const wall of room.walls) {
      counts.set(
        wall.id,
        placements.filter((p) => p.wall_id === wall.id).length,
      );
    }
    return counts;
  }, [placements, room.walls]);

  const selectedPlacement = placements.find((p) => p.id === selectedPlacementId);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedPlacementId &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        void handlePlacementRemove(selectedPlacementId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlacementRemove, selectedPlacementId]);

  async function handlePlacementAdd(artworkId: string, position: WallPoint) {
    if (!activeWall) return;
    await onPlacementAdd(
      artworkId,
      activeWall.id,
      position.x,
      position.y,
    );
    setPendingArtworkId(null);
  }

  function updateSelected(patch: PlacementPatch) {
    if (!selectedPlacement) return;
    void onPlacementUpdate(selectedPlacement.id, patch);
  }

  if (!activeWall) {
    return null;
  }

  function handleDismissHint() {
    dismissWallEditorHint();
    setHintDismissed(true);
  }

  return (
    <div className="relative grid gap-6 lg:grid-cols-[1fr_280px]">
      {showFirstTimeHint && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/85 p-6 backdrop-blur-[1px]"
          role="status"
        >
          <div className="max-w-md rounded-xl border bg-card px-5 py-4 text-center shadow-lg">
            <p className="text-sm leading-relaxed">
              Drag artworks from the palette onto a wall to hang your show.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={handleDismissHint}
            >
              Got it
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3"
            onClick={handleDismissHint}
            aria-label="Dismiss hint"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {room.walls.map((wall: WallDefinition) => (
            <button
              key={wall.id}
              ref={(element) => {
                if (element) {
                  wallTabRefs.current.set(wall.id, element);
                } else {
                  wallTabRefs.current.delete(wall.id);
                }
              }}
              type="button"
              onClick={() => {
                setActiveWallId(wall.id);
                setSelectedPlacementId(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setCrossWallHoverId(wall.id);
              }}
              onDragLeave={() => {
                setCrossWallHoverId((current) =>
                  current === wall.id ? null : current,
                );
              }}
              onDrop={(event) => {
                event.preventDefault();
                const artworkId = event.dataTransfer.getData("artworkId");
                if (artworkId) {
                  setActiveWallId(wall.id);
                  void onPlacementAdd(
                    artworkId,
                    wall.id,
                    0,
                    DEFAULT_HANG_HEIGHT_M,
                  );
                  setPendingArtworkId(null);
                }
                setCrossWallHoverId(null);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                activeWallId === wall.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
                crossWallHoverId === wall.id &&
                crossWallHoverId !== activeWallId &&
                "ring-2 ring-primary ring-offset-2",
              )}
            >
              {wall.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({wallPlacementCounts.get(wall.id) ?? 0})
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Drag a work onto another wall tab to move it between walls.
        </p>

        <WallCanvas
          wall={activeWall}
          walls={room.walls}
          placements={placements}
          selectedPlacementId={selectedPlacementId}
          pendingArtworkId={pendingArtworkId}
          onSelectPlacement={setSelectedPlacementId}
          onPlacementUpdate={onPlacementUpdate}
          onPlacementAdd={handlePlacementAdd}
          resolveWallAtPointer={resolveWallAtPointer}
          onCrossWallHover={setCrossWallHoverId}
          onMovedToWall={handleMovedToWall}
          resolveCatalogAtPointer={resolveCatalogAtPointer}
          onCatalogHoverChange={setCatalogDropHover}
          onPlacementRemove={handlePlacementRemove}
        />

        {selectedPlacement && (
          <div className="space-y-4 rounded-lg border bg-muted/40 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {selectedPlacement.artwork.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {room.walls.find((w) => w.id === selectedPlacement.wall_id)
                    ?.label ?? activeWall.label}{" "}
                  · drag to catalogue to remove · drag onto another wall tab to
                  move · drag handles to resize or rotate
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void handlePlacementRemove(selectedPlacement.id);
                }}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placement-scale">
                  Scale ({Math.round(selectedPlacement.scale * 100)}%)
                </Label>
                <input
                  id="placement-scale"
                  type="range"
                  min={MIN_PLACEMENT_SCALE}
                  max={MAX_PLACEMENT_SCALE}
                  step={0.05}
                  value={selectedPlacement.scale}
                  onChange={(event) =>
                    updateSelected({
                      scale: clampScale(parseFloat(event.target.value)),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placement-rotation">
                  Rotation ({selectedPlacement.rotation_deg ?? 0}°)
                </Label>
                <input
                  id="placement-rotation"
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={selectedPlacement.rotation_deg ?? 0}
                  onChange={(event) =>
                    updateSelected({
                      rotation_deg: normalizeRotation(
                        parseFloat(event.target.value),
                      ),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Card
        ref={catalogDropRef}
        className={cn(
          "h-fit transition-colors",
          catalogDropHover &&
          "border-destructive/60 bg-destructive/5 ring-2 ring-destructive/30",
        )}
      >
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
          <CardDescription>
            Drag works onto the wall to place them. Drag placed works back here
            to remove, or select and press Delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {catalogDropHover && (
            <p className="mb-3 rounded-md border border-dashed border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              Release to remove from wall
            </p>
          )}
          <ArtworkPalette
            artworks={availableArtworks}
            selectedArtworkId={pendingArtworkId}
            onSelectArtwork={setPendingArtworkId}
          />
          {availableArtworks.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              All catalogue works are on walls. Drag a work here to return it, or{" "}
              <Link
                to={
                  exhibitionId
                    ? `${studioBasePath}/artworks/new?exhibition=${exhibitionId}`
                    : `${studioBasePath}/artworks/new`
                }
                className="underline"
              >
                add artworks
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
