import { useEffect, useState } from "react";

export type PublicCatalogueLayout = "list" | "grid";

const STORAGE_KEY = "on-view-public-catalogue-layout";

function readLayoutPreference(): PublicCatalogueLayout {
  try {
    return localStorage.getItem(STORAGE_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

export function usePublicCatalogueLayout() {
  const [layout, setLayout] =
    useState<PublicCatalogueLayout>(readLayoutPreference);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, layout);
    } catch {
      // Ignore storage errors.
    }
  }, [layout]);

  return { layout, setLayout };
}
