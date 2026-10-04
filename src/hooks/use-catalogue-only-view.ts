import { useEffect, useState } from "react";
import { DEMO_SLUG } from "@/data/demo-exhibition";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const SESSION_KEY_GLOBAL = "on-view-catalogue-only";
const SESSION_KEY_DEMO = "on-view-catalogue-only:demo";

function sessionStorageKey(slug: string | undefined): string {
  return slug === DEMO_SLUG ? SESSION_KEY_DEMO : SESSION_KEY_GLOBAL;
}

function readSessionPreference(slug: string | undefined): boolean | null {
  try {
    const value = sessionStorage.getItem(sessionStorageKey(slug));
    if (value === "1") return true;
    if (value === "0") return false;
    return null;
  } catch {
    return null;
  }
}

function writeSessionPreference(
  catalogueOnly: boolean,
  slug: string | undefined,
): void {
  try {
    sessionStorage.setItem(sessionStorageKey(slug), catalogueOnly ? "1" : "0");
  } catch {
    // ignore
  }
}

function resolveCatalogueOnly({
  slug,
  preferGalleryDefault,
  viewOverride,
  prefersReducedMotion,
}: {
  slug: string | undefined;
  preferGalleryDefault: boolean;
  viewOverride: boolean | null;
  prefersReducedMotion: boolean;
}): boolean {
  if (viewOverride !== null) {
    return viewOverride;
  }

  if (preferGalleryDefault) {
    const savedDemo = readSessionPreference(slug);
    if (savedDemo !== null) return savedDemo;
    return false;
  }

  const saved = readSessionPreference(slug);
  if (saved !== null) return saved;

  return prefersReducedMotion;
}

interface UseCatalogueOnlyViewOptions {
  slug?: string;
  /** Demo show: default 3D; session is stored separately from other exhibitions. */
  preferGalleryDefault?: boolean;
  /** From `?view=`: wins over session; null if absent or unrecognized. */
  viewOverride?: boolean | null;
}

export function useCatalogueOnlyView(
  options: UseCatalogueOnlyViewOptions = {},
) {
  const { slug, preferGalleryDefault = false, viewOverride = null } = options;
  const prefersReducedMotion = usePrefersReducedMotion();

  const [catalogueOnly, setCatalogueOnly] = useState(() =>
    resolveCatalogueOnly({
      slug,
      preferGalleryDefault,
      viewOverride,
      prefersReducedMotion,
    }),
  );

  useEffect(() => {
    setCatalogueOnly(
      resolveCatalogueOnly({
        slug,
        preferGalleryDefault,
        viewOverride,
        prefersReducedMotion,
      }),
    );
  }, [slug, preferGalleryDefault, viewOverride, prefersReducedMotion]);

  function setCatalogueOnlyView(next: boolean) {
    setCatalogueOnly(next);
    writeSessionPreference(next, slug);
  }

  const defaultedToCatalogueOnly =
    viewOverride === null &&
    !preferGalleryDefault &&
    readSessionPreference(slug) === null &&
    prefersReducedMotion;

  return {
    catalogueOnly,
    setCatalogueOnly: setCatalogueOnlyView,
    prefersReducedMotion,
    defaultedToCatalogueOnly,
  };
}
