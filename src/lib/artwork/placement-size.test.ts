import { describe, expect, it } from "vitest";
import { placementVisualSizeM } from "@/lib/artwork/placement-size";

describe("placementVisualSizeM", () => {
  it("uses catalogue size when image pixels are unknown", () => {
    expect(placementVisualSizeM(60, 80, 1)).toEqual({
      widthM: 0.6,
      heightM: 0.8,
    });
  });

  it("fits a landscape image inside a portrait catalogue box", () => {
    const size = placementVisualSizeM(60, 80, 1, { width: 1200, height: 800 });
    expect(size.widthM).toBeCloseTo(0.6, 5);
    expect(size.heightM).toBeCloseTo(0.4, 5);
  });
});
