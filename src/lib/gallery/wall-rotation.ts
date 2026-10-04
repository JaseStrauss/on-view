import * as THREE from "three";
import type { WallDefinition } from "@/types";

/**
 * Convert hang rotation (degrees, clockwise on the 2D wall plan) to radians
 * for Three.js rotation around the wall normal.
 */
export function hangRotationDegToRad(degrees: number): number {
  return THREE.MathUtils.degToRad(-degrees);
}

export function getWallPlacementTransform(
  wall: WallDefinition,
  localX: number,
  localY: number,
  zOffset: number,
  rotationDeg: number,
): { position: THREE.Vector3; quaternion: THREE.Quaternion } {
  const [px, py, pz] = wall.position;
  const [rx, ry, rz] = wall.rotation;

  const wallQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(rx, ry, rz, "XYZ"),
  );

  const worldNormal = new THREE.Vector3(0, 0, 1)
    .applyQuaternion(wallQuat)
    .normalize();

  // Ensure we spin around the axis pointing into the room, not out of it.
  const toRoom = new THREE.Vector3(-px, -py, -pz).normalize();
  const spinAxis =
    worldNormal.dot(toRoom) < 0 ? worldNormal.clone().negate() : worldNormal;

  const spinQuat = new THREE.Quaternion().setFromAxisAngle(
    spinAxis,
    hangRotationDegToRad(rotationDeg),
  );

  const localOffset = new THREE.Vector3(
    localX,
    localY,
    zOffset,
  ).applyQuaternion(wallQuat);
  const position = new THREE.Vector3(px, py, pz).add(localOffset);
  const quaternion = spinQuat.multiply(wallQuat);

  return { position, quaternion };
}
