import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_SITE_ORIGIN,
  getPublicExhibitionUrl,
  normalizePublicSiteOrigin,
  resolvePublicSiteOrigin,
} from "@/lib/public-site-url";

describe("normalizePublicSiteOrigin", () => {
  it("accepts https URLs and returns origin", () => {
    expect(normalizePublicSiteOrigin("https://on-view-seven.vercel.app/")).toBe(
      "https://on-view-seven.vercel.app",
    );
  });

  it("adds https when scheme is omitted", () => {
    expect(normalizePublicSiteOrigin("gallery.example.com")).toBe(
      "https://gallery.example.com",
    );
  });

  it("rejects invalid values", () => {
    expect(normalizePublicSiteOrigin("")).toBeNull();
    expect(normalizePublicSiteOrigin("not a url!!!")).toBeNull();
  });
});

describe("resolvePublicSiteOrigin", () => {
  it("prefers env over window origin", () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: "https://on-view-seven.vercel.app",
        windowOrigin: "http://localhost:5173",
      }),
    ).toBe("https://on-view-seven.vercel.app");
  });

  it("uses hosted default on localhost during dev when env is unset", () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: "",
        windowOrigin: "http://localhost:5173",
      }),
    ).toBe(DEFAULT_PUBLIC_SITE_ORIGIN);
  });

  it("falls back to a non-local window origin when env is invalid", () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: "not a url!!!",
        windowOrigin: "https://live.test",
      }),
    ).toBe("https://live.test");
  });

  it("allows forcing localhost links via env during dev", () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: "http://localhost:5173",
        windowOrigin: "http://localhost:5173",
      }),
    ).toBe("http://localhost:5173");
  });
});

describe("getPublicExhibitionUrl", () => {
  it("builds a path-only URL when no origin is available", () => {
    expect(getPublicExhibitionUrl("surface-studies")).toMatch(
      /\/show\/surface-studies$/,
    );
  });
});
