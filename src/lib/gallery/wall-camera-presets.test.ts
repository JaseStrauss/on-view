import { describe, expect, it } from "vitest";
import type { WallDefinition } from "@/types";
import {
  getGalleryOrbitDistanceLimits,
  getWallCameraPreset,
  getWallCameraPresetForPlacements,
  viewDistanceForHorizontalSpan,
  wallPlacementFocusList,
} from "@/lib/gallery/wall-camera-presets";
import type { PlacementWithArtwork } from "@/types";

const northWall: WallDefinition = {
  id: "north",
  label: "North wall",
  width: 8,
  height: 3.5,
  position: [0, 1.75, -4],
  rotation: [0, 0, 0],
};

describe("viewDistanceForHorizontalSpan", () => {
  it("grows with span and shrinks with wider viewport", () => {
    const narrow = viewDistanceForHorizontalSpan(8, 48, 1.2);
    const wide = viewDistanceForHorizontalSpan(8, 48, 2);
    expect(narrow).toBeGreaterThan(wide);
    expect(narrow).toBeGreaterThan(3.2);
  });
});

describe("getGalleryOrbitDistanceLimits", () => {
  it("allows zooming out for large rooms", () => {
    const limits = getGalleryOrbitDistanceLimits({ floorSize: [18, 18] });
    expect(limits.maxDistance).toBeGreaterThan(14);
  });
});

describe("wallPlacementFocusList", () => {
  it("includes half-width from catalogue size for each placement on the wall", () => {
    const placements = [
      {
        wall_id: "north",
        position_x: 1,
        scale: 1,
        artwork: { width_cm: 100, height_cm: 80 },
      },
    ] as PlacementWithArtwork[];

    const focus = wallPlacementFocusList(placements, "north");
    expect(focus).toEqual([{ positionX: 1, halfWidthM: 0.5 }]);
  });
});

describe("getWallCameraPresetForPlacements", () => {
  const framing = { verticalFovDeg: 48, viewportAspect: 1.6 };

  it("shifts look-at toward off-center hangs on the wall", () => {
    const centered = getWallCameraPresetForPlacements(
      northWall,
      [{ positionX: 0, halfWidthM: 0.4 }],
      framing,
    );
    const offCenter = getWallCameraPresetForPlacements(
      northWall,
      [{ positionX: -2.5, halfWidthM: 0.5 }],
      framing,
    );

    expect(offCenter.target.x).toBeLessThan(centered.target.x);
    expect(offCenter.target.z).toBeCloseTo(centered.target.z, 5);
  });

  it("backs the camera away for a wider spread of works", () => {
    const single = getWallCameraPresetForPlacements(
      northWall,
      [{ positionX: 0, halfWidthM: 0.3 }],
      framing,
    );
    const spread = getWallCameraPresetForPlacements(
      northWall,
      [
        { positionX: -2.8, halfWidthM: 0.4 },
        { positionX: 2.5, halfWidthM: 0.45 },
      ],
      framing,
    );

    const singleDistance = single.position.distanceTo(single.target);
    const spreadDistance = spread.position.distanceTo(spread.target);
    expect(spreadDistance).toBeGreaterThan(singleDistance);
  });

  it("matches the bare wall preset when there are no placements", () => {
    const empty = getWallCameraPresetForPlacements(northWall, [], framing);
    const wallOnly = getWallCameraPreset(northWall, {
      ...framing,
      horizontalSpanM: northWall.width,
    });

    expect(empty.position.distanceTo(empty.target)).toBeCloseTo(
      wallOnly.position.distanceTo(wallOnly.target),
      5,
    );
  });
});
