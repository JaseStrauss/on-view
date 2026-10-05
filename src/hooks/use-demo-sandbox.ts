import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getAllSandboxArtworks,
  resolveSandboxArtwork,
} from "@/lib/demo/sandbox-artworks";
import {
  applySandboxRoomSettings,
  createEmptySandboxState,
  createSampleSandboxState,
  ensureSandboxState,
  initSandboxState,
  flushSandboxStateSave,
  loadSandboxState,
  scheduleSandboxStateSave,
  type DemoSandboxState,
} from "@/lib/demo/sandbox";
import type { RoomConfig } from "@/rooms/room-config";
import type { Exhibition, Placement } from "@/types";

export type DemoSandboxInit = "default" | "sample" | "preserve";

export function useDemoSandbox(init: DemoSandboxInit = "preserve") {
  const location = useLocation();
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
      next = ensureSandboxState(() => createSampleSandboxState());
    }

    setState(next);
    setLoading(false);
  }, [init]);

  useEffect(() => {
    if (loading) return;
    const stored = loadSandboxState();
    if (stored) setState(stored);
  }, [location.key, loading]);

  useEffect(() => () => flushSandboxStateSave(), []);

  const artworks = useMemo(
    () => (state ? getAllSandboxArtworks(state) : []),
    [state],
  );

  const updateExhibition = useCallback(async (patch: Partial<Exhibition>) => {
    setState((current) => {
      if (!current) return current;
      const next: DemoSandboxState = {
        ...current,
        exhibition: { ...current.exhibition, ...patch },
      };
      scheduleSandboxStateSave(next);
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
        const catalogueArtwork = resolveSandboxArtwork(current, artworkId);

        if (!catalogueArtwork) return current;

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
          placements: [...current.placements, placement],
        };
        scheduleSandboxStateSave(next);
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
        scheduleSandboxStateSave(next);
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
      scheduleSandboxStateSave(next);
      return next;
    });
  }, []);

  const applyRoomSettings = useCallback(
    async (templateId: string, config: RoomConfig) => {
      setState((current) => {
        if (!current) return current;
        const next = applySandboxRoomSettings(current, templateId, config);
        scheduleSandboxStateSave(next);
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
    artworks,
    loading,
    updateExhibition,
    applyRoomSettings,
    addPlacement,
    updatePlacement,
    removePlacement,
    resetSandbox,
  };
}
