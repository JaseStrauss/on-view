import { describe, expect, it } from "vitest";
import {
  artworkSizeM,
  clampPlacement,
  clampScale,
  normalizeRotation,
  pixelCenterToWorld,
  snapToGrid,
  worldToFramePixels,
  worldToPixelCenter,
  type WallCanvasRect,
} from "@/lib/wall-coordinates";

const sampleRect: WallCanvasRect = {
  wallWidthM: 4,
  wallHeightM: 3,
  canvasWidthPx: 800,
  canvasHeightPx: 600,
};

describe("clampScale", () => {
  it("clamps below minimum and snaps to scale step", () => {
    expect(clampScale(0.1)).toBe(0.25);
  });

  it("clamps above maximum", () => {
    expect(clampScale(10)).toBe(3);
  });

  it("snaps in-range values", () => {
    expect(clampScale(1.07)).toBe(1.05);
  });
});

describe("normalizeRotation", () => {
  it("wraps large positive angles and snaps to rotation step", () => {
    expect(normalizeRotation(185)).toBe(-175);
  });

  it("snaps negative angles within (-180, 180]", () => {
    expect(normalizeRotation(-47)).toBe(-45);
  });
});

describe("snapToGrid", () => {
  it("snaps to 0.05 m intervals", () => {
    expect(snapToGrid(1.23)).toBe(1.25);
    expect(snapToGrid(1.22)).toBeCloseTo(1.2, 10);
  });
});

describe("artworkSizeM", () => {
  it("uses defaults when dimensions are null", () => {
    expect(artworkSizeM(null, null)).toEqual({ widthM: 0.6, heightM: 0.8 });
  });

  it("applies scale to cm dimensions", () => {
    expect(artworkSizeM(100, 50, 2)).toEqual({ widthM: 2, heightM: 1 });
  });
});

describe("world ↔ pixel conversion", () => {
  it("round-trips a grid-aligned world point", () => {
    const point = { x: 0.5, y: 1.45 };
    const pixel = worldToPixelCenter(point, sampleRect);
    const back = pixelCenterToWorld(pixel.left, pixel.top, sampleRect);
    expect(back.x).toBeCloseTo(point.x, 10);
    expect(back.y).toBeCloseTo(point.y, 10);
  });
});

describe("worldToFramePixels", () => {
  it("centres frame on world point with size in pixels", () => {
    const point = { x: 0, y: 1.5 };
    const sizeM = { widthM: 1, heightM: 0.5 };
    const frame = worldToFramePixels(point, sizeM, sampleRect);

    expect(frame.width).toBe(200);
    expect(frame.height).toBe(100);
    expect(frame.left + frame.width / 2).toBeCloseTo(400, 5);
    expect(frame.top + frame.height / 2).toBeCloseTo(300, 5);
  });
});

describe("clampPlacement", () => {
  it("keeps artwork inside wall bounds", () => {
    const sizeM = { widthM: 1, heightM: 1 };
    const wall = { width: 4, height: 3 };

    const clamped = clampPlacement({ x: 2, y: 2.5 }, sizeM, wall);

    expect(clamped.x).toBe(1.5);
    expect(clamped.y).toBe(2.5);
  });

  it("respects floor and ceiling for vertical position", () => {
    const sizeM = { widthM: 0.4, heightM: 0.8 };
    const wall = { width: 4, height: 3 };

    const clamped = clampPlacement({ x: 0, y: 0.1 }, sizeM, wall);

    expect(clamped.y).toBe(0.4);
  });
});
