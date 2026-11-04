import { describe, expect, it } from "vitest";
import {
  buildArtworkInquiryMailto,
  canInquireAboutArtwork,
  normalizeContactEmail,
} from "@/lib/exhibition/inquiry";

describe("normalizeContactEmail", () => {
  it("accepts a simple address", () => {
    expect(normalizeContactEmail("  studio@example.com ")).toBe(
      "studio@example.com",
    );
  });

  it("rejects invalid values", () => {
    expect(normalizeContactEmail("not-an-email")).toBeNull();
    expect(normalizeContactEmail("")).toBeNull();
  });
});

describe("canInquireAboutArtwork", () => {
  it("allows available and reserved works when contact email is set", () => {
    expect(canInquireAboutArtwork({ status: "available" }, "a@b.co")).toBe(
      true,
    );
    expect(canInquireAboutArtwork({ status: "reserved" }, "a@b.co")).toBe(true);
  });

  it("blocks sold works and missing email", () => {
    expect(canInquireAboutArtwork({ status: "sold" }, "a@b.co")).toBe(false);
    expect(canInquireAboutArtwork({ status: "available" }, null)).toBe(false);
  });
});

describe("buildArtworkInquiryMailto", () => {
  it("includes work id and exhibition context", () => {
    const href = buildArtworkInquiryMailto({
      contactEmail: "curator@gallery.test",
      exhibitionTitle: "Surface Studies",
      exhibitionSlug: "demo",
      artwork: {
        id: "00000000-0000-0000-0000-000000000001",
        title: "Halation",
        artist: "Sample Artist",
        year: 2024,
        medium: "Oil on canvas",
      },
    });

    expect(href.startsWith("mailto:curator@gallery.test?")).toBe(true);
    expect(href).toContain("Surface+Studies");
    expect(href).toContain(
      encodeURIComponent("00000000-0000-0000-0000-000000000001"),
    );
    expect(href).toContain(encodeURIComponent("Halation"));
  });
});
