import { useLayoutEffect } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * Sets OrbitControls look-at when the room preset changes. Avoid passing `target`
 * as a reactive prop on OrbitControls, which resets the camera after user orbit.
 */
export function GalleryOrbitTarget({
  controlsRef,
  cameraTarget,
  roomPresetKey,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  cameraTarget: [number, number, number];
  roomPresetKey: string;
}) {
  useLayoutEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(...cameraTarget);
    controls.update();
  }, [cameraTarget, controlsRef, roomPresetKey]);

  return null;
}
