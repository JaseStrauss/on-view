import { describe, expect, it } from "vitest";
import {
  buildExhibitionEmbedIframeHtml,
  parseEmbedQuery,
} from "@/lib/exhibition/embed";

describe("parseEmbedQuery", () => {
  it("recognizes truthy embed values", () => {
    expect(parseEmbedQuery("1")).toBe(true);
    expect(parseEmbedQuery("true")).toBe(true);
    expect(parseEmbedQuery("yes")).toBe(true);
  });

  it("rejects other values", () => {
    expect(parseEmbedQuery(null)).toBe(false);
    expect(parseEmbedQuery("0")).toBe(false);
    expect(parseEmbedQuery("gallery")).toBe(false);
  });
});

describe("buildExhibitionEmbedIframeHtml", () => {
  it("includes embed query and exhibition title", () => {
    const html = buildExhibitionEmbedIframeHtml("my-show", 'Works "Now"');
    expect(html).toContain("embed=1");
    expect(html).toContain("/show/my-show");
    expect(html).toContain('title="Works &quot;Now&quot; on On View"');
  });

  it("supports vh height presets", () => {
    const html = buildExhibitionEmbedIframeHtml("demo", "Demo", {
      height: "90vh",
    });
    expect(html).toContain('height="90vh"');
  });
});
