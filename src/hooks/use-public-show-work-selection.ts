import { useEffect, useMemo, useState } from "react";
import type { PlacementWithArtwork } from "@/types";

interface UsePublicShowWorkSelectionOptions {
  sortedPlacements: PlacementWithArtwork[];
  catalogueOnly: boolean;
  setCatalogueOnly: (catalogueOnly: boolean) => void;
  loading: boolean;
}

export function usePublicShowWorkSelection({
  sortedPlacements,
  catalogueOnly,
  setCatalogueOnly,
  loading,
}: UsePublicShowWorkSelectionOptions) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
    null,
  );

  const selectedPlacement = useMemo(
    () => sortedPlacements.find((p) => p.id === selectedPlacementId) ?? null,
    [sortedPlacements, selectedPlacementId],
  );

  useEffect(() => {
    if (!catalogueOnly || loading || sortedPlacements.length === 0) return;

    requestAnimationFrame(() => {
      document
        .getElementById("catalogue")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [catalogueOnly, loading, sortedPlacements.length]);

  function selectPlacement(placementId: string | null) {
    setSelectedPlacementId(placementId);
  }

  function openLightboxForPlacement(placementId: string) {
    const index = sortedPlacements.findIndex((p) => p.id === placementId);
    if (index >= 0) {
      setSelectedPlacementId(placementId);
      setLightboxIndex(index);
    }
  }

  function focusCatalogueEntry(placementId: string) {
    selectPlacement(placementId);
    document
      .getElementById(`work-${placementId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusVirtualView(placementId: string) {
    if (catalogueOnly) {
      focusCatalogueEntry(placementId);
      return;
    }

    selectPlacement(placementId);
    document
      .getElementById("virtual-view")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCatalogueOnlyChange(next: boolean) {
    setCatalogueOnly(next);
    if (next) {
      selectPlacement(null);
    }
  }

  function handleCatalogueWorkSelect(placementId: string) {
    if (catalogueOnly) {
      focusCatalogueEntry(placementId);
      return;
    }
    focusVirtualView(placementId);
  }

  return {
    lightboxIndex,
    setLightboxIndex,
    selectedPlacementId,
    selectedPlacement,
    selectPlacement,
    openLightboxForPlacement,
    handleCatalogueOnlyChange,
    handleCatalogueWorkSelect,
  };
}
