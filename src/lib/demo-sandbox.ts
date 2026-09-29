import { getDemoPublicShow } from "@/data/demo-exhibition";
import { mergeRoomConfig, type RoomConfig } from "@/rooms/room-config";
import { buildRoomTemplate } from "@/rooms/templates";
import { reclampPlacement } from "@/lib/reclamp-placements";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

/** Public show slug for the in-browser demo builder preview. */
export const DEMO_BUILDER_SLUG = "demo-build";
export const DEMO_BUILDER_PATH = "/studio/demo/build";

/** @deprecated Use DEMO_BUILDER_SLUG */
export const DEMO_SANDBOX_SLUG = DEMO_BUILDER_SLUG;
/** @deprecated Use DEMO_BUILDER_PATH */
export const DEMO_SANDBOX_PATH = DEMO_BUILDER_PATH;

const LEGACY_STORAGE_KEY = "on-view-demo-sandbox-v1";
const STORAGE_KEY = "on-view-demo-sandbox-v2";

/** Bump when demo catalogue / starter hang changes so stale session saves are dropped. */
export const SANDBOX_PERSIST_VERSION = 2;
const SANDBOX_USER_ID = "00000000-0000-0000-0000-000000000099";
export const SANDBOX_EXHIBITION_ID = "00000000-0000-0000-0000-000000000098";

export interface DemoSandboxState {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  catalogueArtworkIds: string[];
  persistVersion?: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDemoSandboxArtworks(): Artwork[] {
  return getDemoPublicShow().catalogueArtworks;
}

function getDemoSandboxCatalogueArtworkIds(): string[] {
  return getDemoSandboxArtworks().map((artwork) => artwork.id);
}

/**
 * Older sandbox saves added artwork ids to the catalogue on each placement, which
 * scoped the palette to only placed works. Restore the full demo catalogue instead.
 */
function repairSandboxCatalogue(state: DemoSandboxState): DemoSandboxState {
  const demoCatalogueIds = getDemoSandboxCatalogueArtworkIds();
  const placedIds = new Set(state.placements.map((p) => p.artwork_id));
  const { catalogueArtworkIds } = state;

  if (catalogueArtworkIds.length === 0) {
    return { ...state, catalogueArtworkIds: demoCatalogueIds };
  }

  const catalogueMatchesPlacedOnly =
    catalogueArtworkIds.length === placedIds.size &&
    catalogueArtworkIds.length > 0 &&
    catalogueArtworkIds.every((id) => placedIds.has(id)) &&
    catalogueArtworkIds.length < demoCatalogueIds.length;

  if (catalogueMatchesPlacedOnly) {
    return { ...state, catalogueArtworkIds: demoCatalogueIds };
  }

  return state;
}

function buildExhibition(
  patch: Partial<Exhibition> & Pick<Exhibition, "title" | "room_template_id">,
): Exhibition {
  const timestamp = nowIso();
  const roomConfig = mergeRoomConfig(
    patch.room_template_id,
    patch.room_config ?? {},
  );

  return {
    id: SANDBOX_EXHIBITION_ID,
    user_id: SANDBOX_USER_ID,
    title: patch.title,
    description: patch.description ?? null,
    featuring_override: patch.featuring_override ?? null,
    slug: DEMO_BUILDER_SLUG,
    room_template_id: patch.room_template_id,
    room_config: roomConfig,
    is_published: patch.is_published ?? false,
    opens_at: patch.opens_at ?? null,
    closes_at: patch.closes_at ?? null,
    created_at: patch.created_at ?? timestamp,
    updated_at: timestamp,
  };
}

export function createEmptySandboxState(
  title: string,
  roomTemplateId: string,
  roomConfig?: RoomConfig,
): DemoSandboxState {
  return {
    exhibition: buildExhibition({
      title: title.trim() || "My demo show",
      room_template_id: roomTemplateId,
      room_config: mergeRoomConfig(roomTemplateId, roomConfig),
    }),
    placements: [],
    catalogueArtworkIds: getDemoSandboxCatalogueArtworkIds(),
    persistVersion: SANDBOX_PERSIST_VERSION,
  };
}

export function createSampleSandboxState(): DemoSandboxState {
  const sample = getDemoPublicShow();
  const exhibition = buildExhibition({
    title: "Sample Exhibition",
    room_template_id: sample.exhibition.room_template_id,
    room_config: sample.exhibition.room_config,
    description:
      "Starter hang from the demo catalogue. Drag works, change the room, then open a preview link.",
  });

  const placements: PlacementWithArtwork[] = sample.placements.map(
    (placement) => ({
      ...placement,
      exhibition_id: SANDBOX_EXHIBITION_ID,
      id: crypto.randomUUID(),
      created_at: nowIso(),
    }),
  );

  const catalogueArtworkIds = sample.catalogueArtworks.map(
    (artwork) => artwork.id,
  );

  return {
    exhibition,
    placements,
    catalogueArtworkIds,
    persistVersion: SANDBOX_PERSIST_VERSION,
  };
}

function hydrateSandboxPlacements(
  placements: PlacementWithArtwork[],
): PlacementWithArtwork[] {
  const catalogueById = new Map(
    getDemoSandboxArtworks().map((artwork) => [artwork.id, artwork]),
  );

  return placements.map((placement) => ({
    ...placement,
    artwork: catalogueById.get(placement.artwork_id) ?? placement.artwork,
  }));
}

export function loadSandboxState(): DemoSandboxState | null {
  if (typeof sessionStorage === "undefined") return null;

  try {
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSandboxState;
    if (!parsed.exhibition?.id) return null;

    if ((parsed.persistVersion ?? 1) < SANDBOX_PERSIST_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return repairSandboxCatalogue({
      exhibition: {
        ...parsed.exhibition,
        room_config: mergeRoomConfig(
          parsed.exhibition.room_template_id,
          parsed.exhibition.room_config ?? {},
        ),
      },
      placements: hydrateSandboxPlacements(
        parsed.placements.map((placement) => ({
          ...placement,
          position_x: Number(placement.position_x),
          position_y: Number(placement.position_y),
          scale: Number(placement.scale) || 1,
          rotation_deg: Number(placement.rotation_deg) || 0,
        })),
      ),
      catalogueArtworkIds: parsed.catalogueArtworkIds ?? [],
      persistVersion: parsed.persistVersion ?? SANDBOX_PERSIST_VERSION,
    });
  } catch {
    return null;
  }
}

export function saveSandboxState(state: DemoSandboxState): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      persistVersion: SANDBOX_PERSIST_VERSION,
      exhibition: {
        ...state.exhibition,
        updated_at: nowIso(),
      },
    }),
  );
}

export function clearSandboxState(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function ensureSandboxState(
  factory: () => DemoSandboxState,
): DemoSandboxState {
  const existing = loadSandboxState();
  if (existing) return existing;
  const created = factory();
  saveSandboxState(created);
  return created;
}

export function initSandboxState(state: DemoSandboxState): DemoSandboxState {
  saveSandboxState(state);
  return state;
}

export function getDemoSandboxPublicShow(): {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  catalogueArtworks: Artwork[];
  presenterName: string;
} | null {
  const state = loadSandboxState();
  if (!state || !state.exhibition.is_published) return null;

  const artworks = getDemoSandboxArtworks();
  const catalogueIds = new Set(state.catalogueArtworkIds);
  const useScoped = catalogueIds.size > 0;
  const placedIds = new Set(state.placements.map((p) => p.artwork_id));

  const catalogueArtworks = artworks.filter((artwork) => {
    if (placedIds.has(artwork.id)) return true;
    if (useScoped) return catalogueIds.has(artwork.id);
    return true;
  });

  return {
    exhibition: state.exhibition,
    placements: state.placements,
    catalogueArtworks,
    presenterName: "Demo builder",
  };
}

export function applySandboxRoomSettings(
  state: DemoSandboxState,
  templateId: string,
  config: RoomConfig,
): DemoSandboxState {
  const merged = mergeRoomConfig(templateId, config);
  const room = buildRoomTemplate(templateId, merged);
  const validWallIds = new Set(room.walls.map((wall) => wall.id));

  const placements = state.placements
    .filter((placement) => validWallIds.has(placement.wall_id))
    .map((placement) => ({
      ...placement,
      ...reclampPlacement(placement, room),
    }));

  return {
    ...state,
    exhibition: buildExhibition({
      ...state.exhibition,
      title: state.exhibition.title,
      room_template_id: templateId,
      room_config: merged,
      description: state.exhibition.description,
      is_published: state.exhibition.is_published,
      opens_at: state.exhibition.opens_at,
      closes_at: state.exhibition.closes_at,
      featuring_override: state.exhibition.featuring_override,
      created_at: state.exhibition.created_at,
    }),
    placements,
  };
}
