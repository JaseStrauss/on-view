import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { artworkPlaneSizeM } from "@/lib/artwork-plane-size";
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
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    let active = true;
    let loadedTexture: THREE.Texture | null = null;

    loader.load(imageUrl, (tex) => {
      if (!active) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      loadedTexture = tex;
      setTexture(tex);
      setImageSize({
        width: tex.image.width,
        height: tex.image.height,
      });
    });

    return () => {
      active = false;
      loadedTexture?.dispose();
      setTexture(null);
      setImageSize(null);
    };
  }, [imageUrl]);

  const planeSize = useMemo(() => {
    if (!imageSize) {
      return { width, height };
    }
    return artworkPlaneSizeM(
      width,
      height,
      imageSize.width,
      imageSize.height,
    );
  }, [width, height, imageSize]);

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

  if (!texture) {
    return null;
  }

  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0, -frameDepth / 2]}>
        <boxGeometry
          args={[
            planeSize.width + frameBorder,
            planeSize.height + frameBorder,
            frameDepth,
          ]}
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
        <planeGeometry args={[planeSize.width, planeSize.height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
