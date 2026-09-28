import { useCallback, useEffect, useState } from "react";
import {
  applySandboxRoomSettings,
  createEmptySandboxState,
  createSampleSandboxState,
  ensureSandboxState,
  getDemoSandboxArtworks,
  initSandboxState,
  saveSandboxState,
  type DemoSandboxState,
} from "@/lib/demo-sandbox";
import type { RoomConfig } from "@/rooms/room-config";
import type { Exhibition, Placement } from "@/types";

export type DemoSandboxInit = "default" | "sample" | "preserve";

export function useDemoSandbox(init: DemoSandboxInit = "preserve") {
  const [state, setState] = useState<DemoSandboxState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let next: DemoSandboxState;

    if (init === "sample") {
      next = initSandboxState(createSampleSandboxState());
    } else if (init === "default") {
      next = initSandboxState(
        createEmptySandboxState("My demo show", "white-cube"),
      );
    } else {
      next = ensureSandboxState(() =>
        createEmptySandboxState("My demo show", "white-cube"),
      );
    }

    setState(next);
    setLoading(false);
  }, [init]);

  const updateExhibition = useCallback(async (patch: Partial<Exhibition>) => {
    setState((current) => {
      if (!current) return current;
      const next: DemoSandboxState = {
        ...current,
        exhibition: { ...current.exhibition, ...patch },
      };
      saveSandboxState(next);
      return next;
    });
  }, []);

  const addPlacement = useCallback(
    async (
      artworkId: string,
      wallId: string,
      positionX = 0,
      positionY = 1.45,
    ) => {
      setState((current) => {
        if (!current) return current;
        const catalogueArtwork =
          current.placements.find((p) => p.artwork_id === artworkId)?.artwork ??
          getDemoSandboxArtworks().find((artwork) => artwork.id === artworkId);

        if (!catalogueArtwork) return current;

        const catalogueArtworkIds = current.catalogueArtworkIds.includes(
          artworkId,
        )
          ? current.catalogueArtworkIds
          : [...current.catalogueArtworkIds, artworkId];

        const placement = {
          id: crypto.randomUUID(),
          exhibition_id: current.exhibition.id,
          artwork_id: artworkId,
          wall_id: wallId,
          position_x: positionX,
          position_y: positionY,
          scale: 1,
          rotation_deg: 0,
          sort_order: current.placements.length,
          created_at: new Date().toISOString(),
          artwork: catalogueArtwork,
        };

        const next: DemoSandboxState = {
          ...current,
          catalogueArtworkIds,
          placements: [...current.placements, placement],
        };
        saveSandboxState(next);
        return next;
      });
    },
    [],
  );

  const updatePlacement = useCallback(
    async (
      placementId: string,
      patch: Partial<
        Pick<
          Placement,
          "wall_id" | "position_x" | "position_y" | "scale" | "rotation_deg"
        >
      >,
    ) => {
      setState((current) => {
        if (!current) return current;
        const next: DemoSandboxState = {
          ...current,
          placements: current.placements.map((placement) => {
            if (placement.id !== placementId) return placement;
            const updated = { ...placement, ...patch };
            if (patch.rotation_deg !== undefined) {
              updated.rotation_deg = Number(patch.rotation_deg);
            }
            if (patch.scale !== undefined) {
              updated.scale = Number(patch.scale);
            }
            return updated;
          }),
        };
        saveSandboxState(next);
        return next;
      });
    },
    [],
  );

  const removePlacement = useCallback(async (placementId: string) => {
    setState((current) => {
      if (!current) return current;
      const next: DemoSandboxState = {
        ...current,
        placements: current.placements.filter(
          (placement) => placement.id !== placementId,
        ),
      };
      saveSandboxState(next);
      return next;
    });
  }, []);

  const applyRoomSettings = useCallback(
    async (templateId: string, config: RoomConfig) => {
      setState((current) => {
        if (!current) return current;
        const next = applySandboxRoomSettings(current, templateId, config);
        saveSandboxState(next);
        return next;
      });
    },
    [],
  );

  const resetSandbox = useCallback((factory: () => DemoSandboxState) => {
    const next = initSandboxState(factory());
    setState(next);
  }, []);

  return {
    exhibition: state?.exhibition ?? null,
    placements: state?.placements ?? [],
    catalogueArtworkIds: state?.catalogueArtworkIds ?? [],
    loading,
    updateExhibition,
    applyRoomSettings,
    addPlacement,
    updatePlacement,
    removePlacement,
    resetSandbox,
  };
}
