import * as THREE from "three";
import { catalogSizeForArtwork } from "@/lib/artwork/placement-size";
import type { PlacementWithArtwork, WallDefinition } from "@/types";

const DEFAULT_WALL_VIEW_DISTANCE = 3.2;
const MIN_WALL_VIEW_DISTANCE = DEFAULT_WALL_VIEW_DISTANCE;

export interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Horizontal direction from wall centre into the room. */
export function getViewIntoRoom(
  wallPosition: [number, number, number],
): THREE.Vector3 {
  const [px, , pz] = wallPosition;
  const horizontal = new THREE.Vector3(-px, 0, -pz);
  if (horizontal.lengthSq() < 1e-6) {
    return new THREE.Vector3(0, 0, 1);
  }
  return horizontal.normalize();
}

export function horizontalFovRadians(
  verticalFovDeg: number,
  aspect: number,
): number {
  const vFov = THREE.MathUtils.degToRad(verticalFovDeg);
  return 2 * Math.atan(Math.tan(vFov / 2) * Math.max(aspect, 0.25));
}

/** Camera distance needed to fit a horizontal span in the viewport. */
export function viewDistanceForHorizontalSpan(
  spanM: number,
  verticalFovDeg: number,
  aspect: number,
  padding = 1.18,
): number {
  if (spanM <= 0) return MIN_WALL_VIEW_DISTANCE;
  const hFov = horizontalFovRadians(verticalFovDeg, aspect);
  const halfVisible = (spanM * padding) / 2;
  return halfVisible / Math.tan(hFov / 2);
}

export interface WallPlacementFocus {
  positionX: number;
  halfWidthM: number;
}

export function wallPlacementFocusList(
  placements: PlacementWithArtwork[],
  wallId: string,
): WallPlacementFocus[] {
  return placements
    .filter((p) => p.wall_id === wallId)
    .map((p) => {
      const catalog = catalogSizeForArtwork(p.artwork, p.scale);
      return {
        positionX: p.position_x,
        halfWidthM: catalog.widthM / 2,
      };
    });
}

function wallTangent(wall: WallDefinition): THREE.Vector3 {
  const [rx, ry, rz] = wall.rotation;
  const wallQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(rx, ry, rz, "XYZ"),
  );
  return new THREE.Vector3(1, 0, 0).applyQuaternion(wallQuat).normalize();
}

export function getWallCameraPreset(
  wall: WallDefinition,
  options?: {
    viewDistance?: number;
    focalHeight?: number;
    eyeHeight?: number;
    focusLocalX?: number;
    verticalFovDeg?: number;
    viewportAspect?: number;
    horizontalSpanM?: number;
  },
): CameraPreset {
  const focalHeight = options?.focalHeight ?? 1.45;
  const eyeHeight = options?.eyeHeight ?? 1.55;
  const focusLocalX = options?.focusLocalX ?? 0;
  const spanM = options?.horizontalSpanM ?? wall.width;

  let viewDistance = options?.viewDistance ?? DEFAULT_WALL_VIEW_DISTANCE;
  if (options?.verticalFovDeg != null && options.viewportAspect != null) {
    viewDistance = Math.max(
      viewDistance,
      viewDistanceForHorizontalSpan(
        spanM,
        options.verticalFovDeg,
        options.viewportAspect,
      ),
    );
  }

  const [px, , pz] = wall.position;
  const tangent = wallTangent(wall);
  const target = new THREE.Vector3(px, focalHeight, pz).add(
    tangent.multiplyScalar(focusLocalX),
  );
  const intoRoom = getViewIntoRoom(wall.position);
  const position = target.clone().add(intoRoom.multiplyScalar(viewDistance));
  position.y = eyeHeight;

  return { position, target };
}

export function getWallCameraPresetForPlacements(
  wall: WallDefinition,
  placements: WallPlacementFocus[],
  options?: {
    verticalFovDeg?: number;
    viewportAspect?: number;
    focalHeight?: number;
    eyeHeight?: number;
  },
): CameraPreset {
  if (placements.length === 0) {
    return getWallCameraPreset(wall, {
      ...options,
      horizontalSpanM: wall.width,
    });
  }

  let minX = Infinity;
  let maxX = -Infinity;
  for (const placement of placements) {
    minX = Math.min(minX, placement.positionX - placement.halfWidthM);
    maxX = Math.max(maxX, placement.positionX + placement.halfWidthM);
  }

  const focusLocalX = (minX + maxX) / 2;
  const placementSpan = Math.max(maxX - minX, 0.4);
  const horizontalSpanM = Math.min(
    wall.width,
    Math.max(placementSpan, wall.width * 0.35),
  );

  return getWallCameraPreset(wall, {
    ...options,
    focusLocalX,
    horizontalSpanM,
  });
}

export function getGalleryOrbitDistanceLimits(room: {
  floorSize: [number, number];
}): { minDistance: number; maxDistance: number } {
  const roomExtent = Math.max(room.floorSize[0], room.floorSize[1]);
  return {
    minDistance: 1.4,
    maxDistance: Math.max(14, roomExtent * 1.4),
  };
}

export function getRoomCameraPresetKey(room: {
  id: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}): string {
  return `${room.id}|${room.cameraPosition.join(",")}|${room.cameraTarget.join(",")}`;
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
