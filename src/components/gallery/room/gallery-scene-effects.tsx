import { Suspense, useEffect, useMemo } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { GalleryRenderQuality } from "@/components/gallery/room/gallery-room-types";
import type { PlacementWithArtwork } from "@/types";

function GalleryEnvironment() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return <Environment preset="apartment" />;
}

export function GallerySceneEffects({
  quality,
}: {
  quality: GalleryRenderQuality;
}) {
  return (
    <Suspense fallback={null}>
      <GalleryEnvironment />
      {quality === "full" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.35}
          scale={20}
          blur={2.5}
          far={8}
        />
      )}
    </Suspense>
  );
}

export function PreviewSceneInvalidator({
  placements,
}: {
  placements: PlacementWithArtwork[];
}) {
  const invalidate = useThree((state) => state.invalidate);
  const placementSignature = useMemo(
    () =>
      placements
        .map(
          (p) =>
            `${p.id}:${p.wall_id}:${p.position_x}:${p.position_y}:${p.scale}:${p.rotation_deg}`,
        )
        .join("|"),
    [placements],
  );

  useEffect(() => {
    invalidate();
  }, [invalidate, placementSignature]);

  return null;
}
