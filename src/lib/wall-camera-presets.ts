import * as THREE from "three";
import type { WallDefinition } from "@/types";

export interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Horizontal direction from wall centre into the room. */
export function getViewIntoRoom(wallPosition: [number, number, number]): THREE.Vector3 {
  const [px, , pz] = wallPosition;
  const horizontal = new THREE.Vector3(-px, 0, -pz);
  if (horizontal.lengthSq() < 1e-6) {
    return new THREE.Vector3(0, 0, 1);
  }
  return horizontal.normalize();
}

export function getWallCameraPreset(
  wall: WallDefinition,
  options?: {
    viewDistance?: number;
    focalHeight?: number;
    eyeHeight?: number;
  },
): CameraPreset {
  const viewDistance = options?.viewDistance ?? 3.2;
  const focalHeight = options?.focalHeight ?? 1.45;
  const eyeHeight = options?.eyeHeight ?? 1.55;

  const [px, , pz] = wall.position;
  const target = new THREE.Vector3(px, focalHeight, pz);
  const intoRoom = getViewIntoRoom(wall.position);
  const position = target.clone().add(intoRoom.multiplyScalar(viewDistance));
  position.y = eyeHeight;

  return { position, target };
}

export function getRoomOverviewPreset(room: {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}): CameraPreset {
  return {
    position: new THREE.Vector3(...room.cameraPosition),
    target: new THREE.Vector3(...room.cameraTarget),
  };
}
