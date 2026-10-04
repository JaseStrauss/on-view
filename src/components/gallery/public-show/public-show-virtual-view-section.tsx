import { useEffect } from "react";
import { ArtworkDetailPanel } from "@/components/gallery/artwork/artwork-detail-panel";
import {
  GALLERY_VIEWPORT_CLASS,
  LazyGalleryRoom,
} from "@/components/gallery/room/lazy-gallery-room";
import {
  PublicShowOrbitHint,
  PublicShowTapHint,
  usePublicShowOrbitHint,
  usePublicShowTapHint,
} from "@/components/gallery/public-show/public-show-tap-hint";
import { cn } from "@/lib/utils";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";

interface PublicShowVirtualViewSectionProps {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  selectedPlacement: PlacementWithArtwork | null;
  selectedPlacementId: string | null;
  isMobile: boolean;
  onSelectPlacement: (placementId: string | null) => void;
  onExpandPlacement: (placementId: string) => void;
}

export function PublicShowVirtualViewSection({
  room,
  placements,
  selectedPlacement,
  selectedPlacementId,
  isMobile,
  onSelectPlacement,
  onExpandPlacement,
}: PublicShowVirtualViewSectionProps) {
  const galleryHasPlacements = placements.length > 0;
  const { showOrbitHint, dismissOrbitHint } =
    usePublicShowOrbitHint(galleryHasPlacements);
  const { showTapHint, dismissTapHint } = usePublicShowTapHint(
    galleryHasPlacements && !showOrbitHint,
  );

  useEffect(() => {
    if (selectedPlacementId) {
      dismissTapHint();
    }
  }, [selectedPlacementId, dismissTapHint]);

  return (
    <section
      id="virtual-view"
      className="border-b border-border/60 bg-muted/20 px-6 py-14 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Virtual view
          </h2>
          <p className="mt-3 font-sans text-sm text-muted-foreground">
            <span className="md:hidden">Tap a work for details</span>
            <span className="hidden md:inline">
              Click a work for details in the side panel · expand the image for
              full screen
            </span>
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            selectedPlacement && "md:flex-row md:items-stretch",
          )}
        >
          <div className="relative w-full min-w-0">
            <LazyGalleryRoom
              room={room}
              placements={placements}
              className={cn("w-full", GALLERY_VIEWPORT_CLASS)}
              selectedPlacementId={selectedPlacementId}
              onSelectPlacement={onSelectPlacement}
              showWallPresets
              onOrbitInteract={dismissOrbitHint}
            />
            <PublicShowOrbitHint
              visible={showOrbitHint && !selectedPlacementId}
              isMobile={isMobile}
              onDismiss={dismissOrbitHint}
            />
            <PublicShowTapHint
              visible={showTapHint && !selectedPlacementId}
              onDismiss={dismissTapHint}
            />
          </div>
          <ArtworkDetailPanel
            placement={selectedPlacement}
            onClose={() => onSelectPlacement(null)}
            onExpand={
              selectedPlacement
                ? () => onExpandPlacement(selectedPlacement.id)
                : undefined
            }
          />
        </div>
      </div>
    </section>
  );
}
