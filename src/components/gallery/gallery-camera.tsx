import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  getRoomOverviewPreset,
  getViewIntoRoom,
  getWallCameraPreset,
} from "@/lib/wall-camera-presets";
import { getWallPlacementTransform } from "@/lib/wall-rotation";
import type { PlacementWithArtwork, RoomTemplate } from "@/types";

interface GalleryCameraProps {
  room: RoomTemplate;
  placements: PlacementWithArtwork[];
  selectedPlacementId: string | null;
  viewingWallId: string | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
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

export function GalleryCamera({
  room,
  placements,
  selectedPlacementId,
  viewingWallId,
  controlsRef,
}: GalleryCameraProps) {
  const { camera } = useThree();
  const goalPosition = useRef(new THREE.Vector3(...room.cameraPosition));
  const goalTarget = useRef(new THREE.Vector3(...room.cameraTarget));
  const isAnimating = useRef(false);
  const hasInteracted = useRef(false);

  useEffect(() => {
    if (!selectedPlacementId && !viewingWallId) {
      if (!hasInteracted.current) return;

      const overview = getRoomOverviewPreset(room);
      goalPosition.current.copy(overview.position);
      goalTarget.current.copy(overview.target);
      isAnimating.current = true;
      return;
    }

    hasInteracted.current = true;

    if (selectedPlacementId) {
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
      const wall = room.walls.find((w) => w.id === viewingWallId);
      if (!wall) return;

      const preset = getWallCameraPreset(wall);
      goalPosition.current.copy(preset.position);
      goalTarget.current.copy(preset.target);
      isAnimating.current = true;
    }
  }, [placements, room, selectedPlacementId, viewingWallId]);

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
