import { useCallback } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { GalleryRenderQuality } from "@/components/gallery/room/gallery-room-types";

export interface GalleryOrbitControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  quality: GalleryRenderQuality;
  interactive: boolean;
  autoRotate: boolean;
  orbitLimits: { minDistance: number; maxDistance: number };
  animationCancelRef: React.MutableRefObject<(() => void) | null>;
  onOrbitInteract?: () => void;
}

export function GalleryOrbitControls({
  controlsRef,
  quality,
  interactive,
  autoRotate,
  orbitLimits,
  animationCancelRef,
  onOrbitInteract,
}: GalleryOrbitControlsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const requestFrame = useCallback(() => {
    if (quality === "preview") {
      invalidate();
    }
  }, [invalidate, quality]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableRotate={interactive}
      enableZoom={interactive}
      autoRotate={autoRotate}
      autoRotateSpeed={0.35}
      enableDamping
      dampingFactor={quality === "preview" ? 0.12 : 0.08}
      minDistance={orbitLimits.minDistance}
      maxDistance={orbitLimits.maxDistance}
      maxPolarAngle={Math.PI / 2.05}
      minPolarAngle={Math.PI / 4}
      onChange={requestFrame}
      onStart={() => {
        requestFrame();
        animationCancelRef.current?.();
        onOrbitInteract?.();
      }}
    />
  );
}
