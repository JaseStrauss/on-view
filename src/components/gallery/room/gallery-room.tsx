import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";
import { useTheme } from "@/contexts/theme-context";
import { getArtworkImageUrl } from "@/services/artworks";
import { catalogSizeForArtwork } from "@/lib/artwork/placement-size";
import type { GalleryRoomProps } from "@/components/gallery/room/gallery-room-types";
import { cn } from "@/lib/utils";
import { ArtworkFrame } from "./artwork-frame";
import { GalleryCamera } from "./gallery-camera";
import { RoomShell } from "./room-shell";
import { WallCameraControls } from "./wall-camera-controls";

export { GALLERY_VIEWPORT_CLASS } from "@/components/gallery/room/gallery-viewport";
export type { GalleryRoomProps } from "@/components/gallery/room/gallery-room-types";

const CANVAS_BACKGROUND = {
  light: "#d6d3d1",
  dark: "#1c1917",
} as const;

function RoomLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
      <directionalLight position={[-4, 6, -2]} intensity={0.35} />
      <hemisphereLight
        intensity={0.35}
        color="#fafaf9"
        groundColor="#44403c"
      />
    </>
  );
}

function ArtworkPlacements({
  room,
  placements,
  onSelectPlacement,
}: {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  onSelectPlacement?: (placementId: string | null) => void;
}) {
  const placementsByWall = useMemo(() => {
    const map = new Map<string, PlacementWithArtwork[]>();
    for (const wall of room.walls) {
      map.set(wall.id, []);
    }
    for (const placement of placements) {
      const list = map.get(placement.wall_id);
      if (list) list.push(placement);
    }
    return map;
  }, [room.walls, placements]);

  return (
    <>
      {room.walls.flatMap((wall) => {
        const wallPlacements = placementsByWall.get(wall.id) ?? [];
        return wallPlacements.map((placement) => {
          const imageUrl = getArtworkImageUrl(placement.artwork.image_path);
          if (!imageUrl) return null;

          const catalog = catalogSizeForArtwork(
            placement.artwork,
            placement.scale,
          );

          return (
            <ArtworkFrame
              key={placement.id}
              wall={wall}
              imageUrl={imageUrl}
              title={placement.artwork.title}
              artist={placement.artwork.artist}
              width={catalog.widthM}
              height={catalog.heightM}
              offsetX={placement.position_x}
              offsetY={placement.position_y}
              rotationDeg={Number(placement.rotation_deg) || 0}
              onSelect={
                onSelectPlacement
                  ? () => onSelectPlacement(placement.id)
                  : undefined
              }
            />
          );
        });
      })}
    </>
  );
}

function OptionalEffects() {
  return (
    <>
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.35}
        scale={20}
        blur={2.5}
        far={8}
      />
      <Environment preset="apartment" />
    </>
  );
}

export function GalleryRoom({
  room,
  placements,
  interactive = true,
  autoRotate = false,
  className = "",
  selectedPlacementId = null,
  onSelectPlacement,
  showWallPresets = false,
  onOrbitInteract,
}: GalleryRoomProps) {
  const { theme } = useTheme();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [viewingWallId, setViewingWallId] = useState<string | null>(null);

  const handleSelectPlacement = useCallback(
    (placementId: string | null) => {
      if (placementId) {
        setViewingWallId(null);
      }
      onSelectPlacement?.(placementId);
    },
    [onSelectPlacement],
  );

  const handleViewWall = useCallback(
    (wallId: string | null) => {
      setViewingWallId(wallId);
      if (wallId) {
        onSelectPlacement?.(null);
      }
    },
    [onSelectPlacement],
  );

  const shellBackground = CANVAS_BACKGROUND[theme];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        className,
      )}
      style={{ backgroundColor: shellBackground }}
    >
      {showWallPresets && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 px-3">
          <div className="pointer-events-auto">
            <WallCameraControls
              walls={room.walls}
              viewingWallId={selectedPlacementId ? null : viewingWallId}
              onViewWall={handleViewWall}
            />
          </div>
        </div>
      )}
      <Canvas
        className="absolute inset-x-0 top-0 bottom-[-1px] block h-[calc(100%+1px)] w-full touch-none"
        shadows
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        camera={{
          position: room.cameraPosition,
          fov: 48,
          near: 0.1,
          far: 100,
        }}
        onPointerMissed={() => handleSelectPlacement(null)}
      >
        <color attach="background" args={[CANVAS_BACKGROUND[theme]]} />
        <RoomLighting />
        <RoomShell room={room} />
        <ArtworkPlacements
          room={room}
          placements={placements}
          onSelectPlacement={handleSelectPlacement}
        />
        {(onSelectPlacement || showWallPresets) && (
          <GalleryCamera
            room={room}
            placements={placements}
            selectedPlacementId={selectedPlacementId}
            viewingWallId={viewingWallId}
            controlsRef={controlsRef}
          />
        )}
        <Suspense fallback={null}>
          <OptionalEffects />
        </Suspense>
        {(interactive || autoRotate) && (
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={room.cameraTarget}
            enablePan={false}
            enableRotate={interactive}
            enableZoom={interactive}
            autoRotate={autoRotate}
            autoRotateSpeed={0.35}
            enableDamping
            dampingFactor={0.08}
            minDistance={1.4}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 4}
            onStart={() => onOrbitInteract?.()}
          />
        )}
      </Canvas>
    </div>
  );
}
