import { describe, expect, it } from "vitest";
import {
  catalogSizeForArtwork,
  placementVisualSizeForArtwork,
} from "@/lib/artwork/placement-size";

const sampleArtwork = { width_cm: 60, height_cm: 80 };

describe("catalogSizeForArtwork", () => {
  it("converts cm and scale to metres", () => {
    expect(catalogSizeForArtwork(sampleArtwork, 1)).toEqual({
      widthM: 0.6,
      heightM: 0.8,
    });
  });
});

describe("placementVisualSizeForArtwork", () => {
  it("uses catalogue size when image pixels are unknown", () => {
    expect(placementVisualSizeForArtwork(sampleArtwork, 1)).toEqual({
      widthM: 0.6,
      heightM: 0.8,
    });
  });

  it("fits a landscape image inside a portrait catalogue box", () => {
    const size = placementVisualSizeForArtwork(sampleArtwork, 1, {
      width: 1200,
      height: 800,
    });
    expect(size.widthM).toBeCloseTo(0.6, 5);
    expect(size.heightM).toBeCloseTo(0.4, 5);
  });
});
