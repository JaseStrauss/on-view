import { useMemo } from "react";
import * as THREE from "three";
import { getWallPlacementTransform } from "@/lib/wall-rotation";
import type { WallDefinition } from "@/types";

interface ArtworkFrameProps {
  wall: WallDefinition;
  imageUrl: string;
  title: string;
  artist: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  rotationDeg?: number;
  onSelect?: () => void;
}

export function ArtworkFrame({
  wall,
  imageUrl,
  width,
  height,
  offsetX,
  offsetY,
  rotationDeg = 0,
  onSelect,
}: ArtworkFrameProps) {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tex = loader.load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  const frameDepth = 0.04;
  const frameBorder = 0.06;
  const localX = offsetX;
  // position_y is the artwork centre measured from the floor (matches 2D wall plan).
  const localY = offsetY - wall.height / 2;
  const degrees = Number(rotationDeg) || 0;

  const { position, quaternion } = useMemo(
    () => getWallPlacementTransform(wall, localX, localY, 0.02, degrees),
    [wall, localX, localY, degrees],
  );

  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0, -frameDepth / 2]}>
        <boxGeometry
          args={[width + frameBorder, height + frameBorder, frameDepth]}
        />
        <meshStandardMaterial color="#1c1917" roughness={0.6} />
      </mesh>
      <mesh
        position={[0, 0, 0.001]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (onSelect) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>
    </group>
  );
}
