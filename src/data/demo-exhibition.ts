import {
  DEMO_CATALOGUE_KEYS,
  DEMO_STUDIO_POOL_KEYS,
  SAMPLE_ARTWORKS,
  type SampleArtwork,
} from "@/data/sample-artworks";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

export const DEMO_SLUG = "demo";

/** Landing hero still (`public/demo/surface-studies-hero.png`). */
export const DEMO_HERO_SNAPSHOT_SRC = "/demo/surface-studies-hero.png";

export const DEMO_EXHIBITION_TITLE = "Surface Studies";

export const DEMO_BUILDER_SAMPLE_TITLE = "Sample Exhibition";

/** Curatorial copy for the builder sample hang (public page and PDF, not UI hints). */
export const DEMO_BUILDER_SAMPLE_DESCRIPTION =
  "Nine painters share one room in this study of surface, grid, and saturated color. The hang pairs works on the east and west walls with a north-wall triptych, letting scale and interval carry the walk through the space.";

export const DEMO_BUILDER_SAMPLE_OPENS_AT = "2026-03-01";
export const DEMO_BUILDER_SAMPLE_CLOSES_AT = "2026-05-31";

export type DemoArtworkDefinition = SampleArtwork;

function definitionsForKeys(keys: readonly string[]): DemoArtworkDefinition[] {
  return keys
    .map((key) => SAMPLE_ARTWORKS.find((work) => work.key === key))
    .filter((work): work is DemoArtworkDefinition => work !== undefined);
}

/** Works on the walls and in the public demo catalogue. */
export const DEMO_ARTWORK_DEFINITIONS: DemoArtworkDefinition[] =
  definitionsForKeys(DEMO_CATALOGUE_KEYS);

/** Full sample inventory for studio seed and browse demos. */
export const DEMO_STUDIO_ARTWORK_DEFINITIONS: DemoArtworkDefinition[] =
  definitionsForKeys(DEMO_STUDIO_POOL_KEYS);

export interface DemoPlacementSpec {
  artworkKey: string;
  wall_id: string;
  position_x: number;
  position_y: number;
  scale: number;
  sort_order: number;
}

export const DEMO_PLACEMENT_SPECS: DemoPlacementSpec[] = [
  {
    artworkKey: "negative-space-vii",
    wall_id: "north",
    position_x: -1.85,
    position_y: 1.4,
    scale: 0.82,
    sort_order: 0,
  },
  {
    artworkKey: "chromatic-patchwork",
    wall_id: "north",
    position_x: 0,
    position_y: 1.4,
    scale: 0.82,
    sort_order: 1,
  },
  {
    artworkKey: "portfolio-red",
    wall_id: "north",
    position_x: 1.85,
    position_y: 1.4,
    scale: 0.82,
    sort_order: 2,
  },
  {
    artworkKey: "soft-vertex",
    wall_id: "east",
    position_x: 1.5,
    position_y: 1.35,
    scale: 1,
    sort_order: 3,
  },
  {
    artworkKey: "cityscape",
    wall_id: "east",
    position_x: -1.5,
    position_y: 1.45,
    scale: 0.92,
    sort_order: 4,
  },
  {
    artworkKey: "halation",
    wall_id: "south",
    position_x: -2,
    position_y: 1.35,
    scale: 1,
    sort_order: 5,
  },
  {
    artworkKey: "terracotta-arch",
    wall_id: "south",
    position_x: 1.8,
    position_y: 1.4,
    scale: 1,
    sort_order: 6,
  },
  {
    artworkKey: "blue-grid",
    wall_id: "west",
    position_x: -1.2,
    position_y: 1.35,
    scale: 1,
    sort_order: 7,
  },
  {
    artworkKey: "primary-interval",
    wall_id: "west",
    position_x: 1.2,
    position_y: 1.4,
    scale: 1,
    sort_order: 8,
  },
];

const DEMO_NOW = "2024-01-01T00:00:00.000Z";

function buildDemoArtwork(
  definition: DemoArtworkDefinition,
  id: string,
  userId: string,
): Artwork {
  return {
    id,
    user_id: userId,
    title: definition.title,
    artist: definition.artist,
    year: definition.year,
    medium: definition.medium,
    width_cm: definition.width_cm,
    height_cm: definition.height_cm,
    status: "available",
    description: definition.description,
    condition_notes: definition.attribution,
    image_path: definition.image_path,
    created_at: DEMO_NOW,
    updated_at: DEMO_NOW,
  };
}

export function getDemoPublicShow(): {
  exhibition: Exhibition;
  placements: PlacementWithArtwork[];
  catalogueArtworks: Artwork[];
  presenterName: string;
} {
  const userId = "00000000-0000-0000-0000-000000000001";
  const exhibitionId = "00000000-0000-0000-0000-000000000010";

  const artworksByKey = new Map(
    DEMO_ARTWORK_DEFINITIONS.map((definition, index) => [
      definition.key,
      buildDemoArtwork(
        definition,
        `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
        userId,
      ),
    ]),
  );

  const exhibition: Exhibition = {
    id: exhibitionId,
    user_id: userId,
    title: DEMO_EXHIBITION_TITLE,
    description:
      "A curated hang of contemporary surfaces and color, from geometric restraint to full-chroma gesture. Works are grouped to slow the walk and keep sightlines open across the room.",
    slug: DEMO_SLUG,
    room_template_id: "white-cube",
    room_config: {},
    is_published: true,
    featuring_override: null,
    opens_at: DEMO_BUILDER_SAMPLE_OPENS_AT,
    closes_at: DEMO_BUILDER_SAMPLE_CLOSES_AT,
    created_at: DEMO_NOW,
    updated_at: DEMO_NOW,
  };

  const placements: PlacementWithArtwork[] = DEMO_PLACEMENT_SPECS.map(
    (spec, index) => {
      const artwork = artworksByKey.get(spec.artworkKey)!;
      return {
        id: `00000000-0000-0000-0001-${String(index + 1).padStart(12, "0")}`,
        exhibition_id: exhibitionId,
        artwork_id: artwork.id,
        wall_id: spec.wall_id,
        position_x: spec.position_x,
        position_y: spec.position_y,
        scale: spec.scale,
        rotation_deg: 0,
        sort_order: spec.sort_order,
        created_at: DEMO_NOW,
        artwork,
      };
    },
  );

  const catalogueArtworks = DEMO_ARTWORK_DEFINITIONS.map((definition, index) =>
    buildDemoArtwork(
      definition,
      `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
      userId,
    ),
  );

  return {
    exhibition,
    placements,
    catalogueArtworks,
    presenterName: "On View",
  };
}

/** Stable id for the browse-only demo studio exhibition row. */
export const DEMO_STUDIO_EXHIBITION_ID = "00000000-0000-0000-0000-000000000010";

export function getDemoStudioData(): {
  exhibitions: Exhibition[];
  artworks: Artwork[];
} {
  const { exhibition } = getDemoPublicShow();
  const userId = "00000000-0000-0000-0000-000000000001";

  const artworks = DEMO_STUDIO_ARTWORK_DEFINITIONS.map((definition, index) =>
    buildDemoArtwork(
      definition,
      `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
      userId,
    ),
  );

  return {
    exhibitions: [
      {
        ...exhibition,
        id: DEMO_STUDIO_EXHIBITION_ID,
        title: "Sample Exhibition",
        description:
          "Starter inventory with sample works. Preview the curated hang in the demo exhibition.",
        is_published: false,
        slug: "sample-demo-draft",
      },
    ],
    artworks,
  };
}
