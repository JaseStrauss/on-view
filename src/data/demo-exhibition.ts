import {
  DEMO_CATALOGUE_KEYS,
  SAMPLE_ARTWORKS,
  type SampleArtwork,
} from "@/data/sample-artworks";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

export const DEMO_SLUG = "demo";

export const DEMO_EXHIBITION_TITLE = "Surface Studies";

export type DemoArtworkDefinition = SampleArtwork;

export const DEMO_ARTWORK_DEFINITIONS: DemoArtworkDefinition[] =
  SAMPLE_ARTWORKS.filter((work) =>
    (DEMO_CATALOGUE_KEYS as readonly string[]).includes(work.key),
  );

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
    artworkKey: "chromatic-drift",
    wall_id: "north",
    position_x: -2,
    position_y: 1.4,
    scale: 1,
    sort_order: 0,
  },
  {
    artworkKey: "negative-space-vii",
    wall_id: "north",
    position_x: 2,
    position_y: 1.4,
    scale: 1,
    sort_order: 1,
  },
  {
    artworkKey: "harvest-table",
    wall_id: "east",
    position_x: 0,
    position_y: 1.5,
    scale: 1,
    sort_order: 2,
  },
  {
    artworkKey: "halation",
    wall_id: "south",
    position_x: -1.2,
    position_y: 1.35,
    scale: 1,
    sort_order: 3,
  },
  {
    artworkKey: "primary-interval",
    wall_id: "west",
    position_x: 1,
    position_y: 1.4,
    scale: 1,
    sort_order: 4,
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
      "A sample contemporary hang.\nExplore the 3D gallery, then build your own.",
    slug: DEMO_SLUG,
    room_template_id: "white-cube",
    room_config: {},
    is_published: true,
    featuring_override: null,
    opens_at: "2026-03-01",
    closes_at: "2026-05-31",
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
  const { exhibition, catalogueArtworks } = getDemoPublicShow();

  return {
    exhibitions: [
      {
        ...exhibition,
        id: DEMO_STUDIO_EXHIBITION_ID,
        title: "Sample Exhibition",
        description:
          "A starter show with sample works. Preview the hang in the demo exhibition.",
        is_published: false,
        slug: "sample-demo-draft",
      },
    ],
    artworks: catalogueArtworks,
  };
}
