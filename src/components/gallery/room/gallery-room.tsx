import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";
import { useTheme } from "@/contexts/theme-context";
import { getArtworkImageUrl } from "@/services/artworks";
import { catalogSizeForArtwork } from "@/lib/artwork/placement-size";
import type { GalleryRoomProps } from "@/components/gallery/room/gallery-room-types";
import {
  getGalleryOrbitDistanceLimits,
  getRoomCameraPresetKey,
} from "@/lib/gallery/wall-camera-presets";
import { cn } from "@/lib/utils";
import { ArtworkFrame } from "./artwork-frame";
import { GalleryCamera } from "./gallery-camera";
import { GalleryOrbitControls } from "./gallery-orbit-controls";
import { GalleryOrbitTarget } from "./gallery-orbit-target";
import {
  GallerySceneEffects,
  PreviewSceneInvalidator,
} from "./gallery-scene-effects";
import { GALLERY_CAMERA_FOV } from "@/components/gallery/room/gallery-viewport";
import { RoomShell } from "./room-shell";
import { WallCameraControls } from "./wall-camera-controls";

export {
  GALLERY_CAMERA_FOV,
  GALLERY_VIEWPORT_CLASS,
} from "@/components/gallery/room/gallery-viewport";
export type {
  GalleryRenderQuality,
  GalleryRoomProps,
} from "@/components/gallery/room/gallery-room-types";

const CANVAS_BACKGROUND = {
  light: "#d6d3d1",
  dark: "#1c1917",
} as const;

function RoomLighting({ castShadow }: { castShadow: boolean }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        castShadow={castShadow}
      />
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

export const GalleryRoom = memo(function GalleryRoom({
  room,
  placements,
  quality = "full",
  interactive = true,
  autoRotate = false,
  className = "",
  selectedPlacementId = null,
  onSelectPlacement,
  showWallPresets = false,
  onOrbitInteract,
}: GalleryRoomProps) {
  const isPreviewQuality = quality === "preview";
  const { theme } = useTheme();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const animationCancelRef = useRef<(() => void) | null>(null);
  const [viewingWallId, setViewingWallId] = useState<string | null>(null);
  const [viewFrameRequest, setViewFrameRequest] = useState(0);
  const orbitLimits = useMemo(
    () => getGalleryOrbitDistanceLimits(room),
    [room],
  );
  const canvasCamera = useMemo(
    () => ({
      position: room.cameraPosition,
      fov: GALLERY_CAMERA_FOV,
      near: 0.1,
      far: 100,
    }),
    [room.cameraPosition],
  );
  const roomPresetKey = useMemo(() => getRoomCameraPresetKey(room), [room]);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element || !interactive) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      animationCancelRef.current?.();
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [interactive]);

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
      setViewFrameRequest((count) => count + 1);
      if (wallId) {
        onSelectPlacement?.(null);
      }
    },
    [onSelectPlacement],
  );

  const shellBackground = CANVAS_BACKGROUND[theme];

  return (
    <div
      ref={viewportRef}
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
        shadows={!isPreviewQuality}
        frameloop={isPreviewQuality ? "demand" : "always"}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        camera={canvasCamera}
        onPointerMissed={() => handleSelectPlacement(null)}
      >
        <color attach="background" args={[CANVAS_BACKGROUND[theme]]} />
        <RoomLighting castShadow={!isPreviewQuality} />
        <RoomShell room={room} />
        {isPreviewQuality && (
          <PreviewSceneInvalidator placements={placements} />
        )}
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
            viewFrameRequest={viewFrameRequest}
            quality={quality}
            controlsRef={controlsRef}
            animationCancelRef={animationCancelRef}
          />
        )}
        <GallerySceneEffects quality={quality} />
        {(interactive || autoRotate) && (
          <>
            <GalleryOrbitControls
              controlsRef={controlsRef}
              quality={quality}
              interactive={interactive}
              autoRotate={autoRotate}
              orbitLimits={orbitLimits}
              animationCancelRef={animationCancelRef}
              onOrbitInteract={onOrbitInteract}
            />
            <GalleryOrbitTarget
              controlsRef={controlsRef}
              cameraTarget={room.cameraTarget}
              roomPresetKey={roomPresetKey}
            />
          </>
        )}
      </Canvas>
    </div>
  );
});
