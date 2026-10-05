import { describe, expect, it } from "vitest";
import {
  getGalleryOrbitDistanceLimits,
  viewDistanceForHorizontalSpan,
} from "@/lib/gallery/wall-camera-presets";

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
