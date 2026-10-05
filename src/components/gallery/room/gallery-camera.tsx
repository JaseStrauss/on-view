import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { GALLERY_CAMERA_FOV } from "@/components/gallery/room/gallery-viewport";
import {
  getRoomCameraPresetKey,
  getRoomOverviewPreset,
  getViewIntoRoom,
  getWallCameraPresetForPlacements,
} from "@/lib/gallery/wall-camera-presets";
import { catalogSizeForArtwork } from "@/lib/artwork/placement-size";
import { getWallPlacementTransform } from "@/lib/gallery/wall-rotation";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";

interface GalleryCameraProps {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  selectedPlacementId: string | null;
  viewingWallId: string | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  animationCancelRef: React.MutableRefObject<(() => void) | null>;
}

function getArtworkWorldPosition(
  room: RoomTemplate,
  placement: PlacementWithArtwork,
): THREE.Vector3 | null {
  const wall = room.walls.find((w) => w.id === placement.wall_id);
  if (!wall) return null;

  const localY = placement.position_y - wall.height / 2;
  const { position } = getWallPlacementTransform(
    wall,
    placement.position_x,
    localY,
    0.02,
    Number(placement.rotation_deg) || 0,
  );
  return position;
}

function beginPresetAnimation(
  goalPosition: THREE.Vector3,
  goalTarget: THREE.Vector3,
  isAnimating: React.MutableRefObject<boolean>,
  preset: { position: THREE.Vector3; target: THREE.Vector3 },
) {
  goalPosition.copy(preset.position);
  goalTarget.copy(preset.target);
  isAnimating.current = true;
}

export function GalleryCamera({
  room,
  placements,
  selectedPlacementId,
  viewingWallId,
  controlsRef,
  animationCancelRef,
}: GalleryCameraProps) {
  const { camera, size } = useThree();
  const viewportAspect = size.width / Math.max(size.height, 1);
  const cameraFov =
    camera instanceof THREE.PerspectiveCamera
      ? camera.fov
      : GALLERY_CAMERA_FOV;
  const goalPosition = useRef(new THREE.Vector3(...room.cameraPosition));
  const goalTarget = useRef(new THREE.Vector3(...room.cameraTarget));
  const isAnimating = useRef(false);
  const prev = useRef({
    viewingWallId,
    selectedPlacementId,
    roomPresetKey: getRoomCameraPresetKey(room),
  });

  useEffect(() => {
    animationCancelRef.current = () => {
      isAnimating.current = false;
    };
    return () => {
      animationCancelRef.current = null;
    };
  }, [animationCancelRef]);

  useEffect(() => {
    const {
      viewingWallId: prevViewingWallId,
      selectedPlacementId: prevSelectedPlacementId,
      roomPresetKey: prevRoomPresetKey,
    } = prev.current;

    const nextRoomPresetKey = getRoomCameraPresetKey(room);
    const modeChanged =
      prevViewingWallId !== viewingWallId ||
      prevSelectedPlacementId !== selectedPlacementId;
    const wallViewChanged = prevViewingWallId !== viewingWallId;
    const selectionChanged = prevSelectedPlacementId !== selectedPlacementId;
    const roomPresetChanged = prevRoomPresetKey !== nextRoomPresetKey;

    prev.current = {
      viewingWallId,
      selectedPlacementId,
      roomPresetKey: nextRoomPresetKey,
    };

    if (selectedPlacementId) {
      if (!selectionChanged) return;

      const placement = placements.find((p) => p.id === selectedPlacementId);
      if (!placement) return;

      const wall = room.walls.find((w) => w.id === placement.wall_id);
      const artworkPosition = getArtworkWorldPosition(room, placement);
      if (!wall || !artworkPosition) return;

      const intoRoom = getViewIntoRoom(wall.position);
      const viewDistance = 2.2;

      goalTarget.current.copy(artworkPosition);
      goalPosition.current
        .copy(artworkPosition)
        .add(intoRoom.multiplyScalar(viewDistance));
      goalPosition.current.y = THREE.MathUtils.clamp(
        goalPosition.current.y,
        1.35,
        2.2,
      );
      isAnimating.current = true;
      return;
    }

    if (viewingWallId) {
      if (!wallViewChanged) return;

      const wall = room.walls.find((w) => w.id === viewingWallId);
      if (!wall) return;

      const wallPlacements = placements
        .filter((p) => p.wall_id === wall.id)
        .map((p) => {
          const catalog = catalogSizeForArtwork(p.artwork, p.scale);
          return {
            positionX: p.position_x,
            halfWidthM: catalog.widthM / 2,
          };
        });

      const preset = getWallCameraPresetForPlacements(wall, wallPlacements, {
        verticalFovDeg: cameraFov,
        viewportAspect,
      });
      beginPresetAnimation(
        goalPosition.current,
        goalTarget.current,
        isAnimating,
        preset,
      );
      return;
    }

    if (!modeChanged && !roomPresetChanged) return;

    beginPresetAnimation(
      goalPosition.current,
      goalTarget.current,
      isAnimating,
      getRoomOverviewPreset(room),
    );
  }, [
    cameraFov,
    placements,
    room,
    selectedPlacementId,
    viewingWallId,
    viewportAspect,
  ]);

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return;

    const controls = controlsRef.current;
    const positionDone = camera.position.distanceTo(goalPosition.current) < 0.02;
    const targetDone =
      controls.target.distanceTo(goalTarget.current) < 0.02;

    camera.position.lerp(goalPosition.current, 0.1);
    controls.target.lerp(goalTarget.current, 0.12);
    controls.update();

    if (positionDone && targetDone) {
      isAnimating.current = false;
    }
  });

  return null;
}
