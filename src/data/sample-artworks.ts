/**
 * Fictional sample works for the public demo show and landing visuals.
 * Photos are vendored under public/demo/samples/ (Unsplash License).
 * Catalogue titles and artists are fictional, not real inventory.
 */

export interface SampleArtwork {
  key: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  width_cm: number;
  height_cm: number;
  /** Static path or hosted image URL */
  image_path: string;
  description: string;
  attribution: string;
  isSample: true;
}

const SAMPLE_IMAGE_DIR = "/demo/samples";

function sampleImagePath(key: string): string {
  return `${SAMPLE_IMAGE_DIR}/${key}.jpg`;
}

const FICTIONAL_CATALOGUE_NOTE =
  "Fictional catalogue entry, not real inventory.";

const SAMPLE_ATTRIBUTION = `Demo placeholder photo (Unsplash License). ${FICTIONAL_CATALOGUE_NOTE}`;

const CHROMATIC_DRIFT_ATTRIBUTION = `Photo: Jene Stephaniuk, "Cityscape" (Unsplash License). ${FICTIONAL_CATALOGUE_NOTE}`;

const CITYSCAPE_ATTRIBUTION = `Photo: Jene Stephaniuk, "Cityscape" (Unsplash License). Sample work; artist and title match the photographed painting.`;

const COLOR_BLOCK_MURAL_ATTRIBUTION = `Photo: Robert Keane (Unsplash License). ${FICTIONAL_CATALOGUE_NOTE}`;

const CHROMATIC_PATCHWORK_ATTRIBUTION = `Photo: Chase Clark, "Abstract painting" (Unsplash License). ${FICTIONAL_CATALOGUE_NOTE}`;

export const SAMPLE_ARTWORKS: SampleArtwork[] = [
  {
    key: "chromatic-drift",
    title: "Chromatic Drift",
    artist: "Mara Okonkwo",
    year: 2024,
    medium: "Acrylic and resin on linen",
    width_cm: 140,
    height_cm: 110,
    image_path: sampleImagePath("chromatic-drift"),
    description:
      "Layered resin and acrylic let color shift with the viewer's angle, turning the surface into a slow-moving field of hue.",
    attribution: CHROMATIC_DRIFT_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "negative-space-vii",
    title: "Negative Space VII",
    artist: "Elias Chen",
    year: 2022,
    medium: "Oil and graphite on canvas",
    width_cm: 120,
    height_cm: 160,
    image_path: sampleImagePath("negative-space-vii"),
    description:
      "Graphite halos frame a restrained oil field, withholding the center so the edges carry the emotional weight.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "portfolio-red",
    title: "Portfolio (Red)",
    artist: "Sofia Laurent",
    year: 2021,
    medium: "Mixed media on cotton duck",
    width_cm: 100,
    height_cm: 130,
    image_path: sampleImagePath("portfolio-red"),
    description:
      "A saturated red ground anchors layered marks that read as both collage and painting.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "halation",
    title: "Halation",
    artist: "Jonas Meier",
    year: 2023,
    medium: "Watercolor and ink on paper",
    width_cm: 76,
    height_cm: 56,
    image_path: sampleImagePath("halation"),
    description:
      "Transparent washes bleed into ink lines, suggesting backlight without depicting a light source.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "blue-grid",
    title: "Blue Grid",
    artist: "Elena Varga",
    year: 2023,
    medium: "Acrylic on canvas",
    width_cm: 100,
    height_cm: 80,
    image_path: sampleImagePath("blue-grid"),
    description:
      "A measured grid of blue tones tests repetition and variation across a square format.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "harvest-table",
    title: "Harvest Table",
    artist: "Luca Ferraro",
    year: 1924,
    medium: "Oil on canvas",
    width_cm: 76,
    height_cm: 61,
    image_path: sampleImagePath("harvest-table"),
    description:
      "Warm earth tones and flattened perspective recall domestic still life while keeping the composition deliberately modern.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "primary-interval",
    title: "Primary Interval",
    artist: "Amira Hassan",
    year: 2018,
    medium: "Acrylic on canvas",
    width_cm: 150,
    height_cm: 100,
    image_path: sampleImagePath("primary-interval"),
    description:
      "Three bands of pure color negotiate rhythm and rest, echoing post-war abstraction with contemporary restraint.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "soft-vertex",
    title: "Soft Vertex",
    artist: "Renée Dubois",
    year: 2020,
    medium: "Pastel and charcoal on paper",
    width_cm: 90,
    height_cm: 70,
    image_path: sampleImagePath("soft-vertex"),
    description:
      "Charcoal edges soften into pastel fields, suggesting volume without fully resolving into form.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "terracotta-arch",
    title: "Terracotta Arch",
    artist: "Tomás Álvarez",
    year: 2019,
    medium: "Oil on linen",
    width_cm: 120,
    height_cm: 95,
    image_path: sampleImagePath("terracotta-arch"),
    description:
      "Warm mineral pigments and a single curved motif anchor an otherwise open field of muted tone.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "cityscape",
    title: "Cityscape",
    artist: "Jene Stephaniuk",
    year: 2020,
    medium: "Acrylic on canvas",
    width_cm: 140,
    height_cm: 110,
    image_path: sampleImagePath("cityscape"),
    description:
      "Thick impasto and stacked color fields read as an abstract horizon, with knife and brush marks catching light across the surface.",
    attribution: CITYSCAPE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "color-block-mural",
    title: "Primary Fault",
    artist: "Devon Ellis",
    year: 2022,
    medium: "Acrylic mural on masonry",
    width_cm: 120,
    height_cm: 180,
    image_path: sampleImagePath("color-block-mural"),
    description:
      "Hard-edged geometry and saturated primaries collide across a textured wall plane, with black spikes and a single yellow disc anchoring the composition.",
    attribution: COLOR_BLOCK_MURAL_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "chromatic-patchwork",
    title: "Chromatic Patchwork",
    artist: "Nadia Okoro",
    year: 2021,
    medium: "Acrylic on canvas",
    width_cm: 120,
    height_cm: 90,
    image_path: sampleImagePath("chromatic-patchwork"),
    description:
      "Interlocking color blocks and drawn contours turn the surface into a map of gesture, with warm pinks and sharp primaries held in balance.",
    attribution: CHROMATIC_PATCHWORK_ATTRIBUTION,
    isSample: true,
  },
];

/** Full sample inventory (studio seed, browse catalogue). */
export const DEMO_STUDIO_POOL_KEYS = [
  "chromatic-drift",
  "negative-space-vii",
  "portfolio-red",
  "halation",
  "blue-grid",
  "harvest-table",
  "primary-interval",
  "soft-vertex",
  "terracotta-arch",
  "cityscape",
  "color-block-mural",
  "chromatic-patchwork",
] as const;

/** Works hung in the public /show/demo exhibition ("Surface Studies"). */
export const DEMO_CATALOGUE_KEYS = [
  "negative-space-vii",
  "portfolio-red",
  "halation",
  "blue-grid",
  "primary-interval",
  "soft-vertex",
  "terracotta-arch",
  "cityscape",
  "chromatic-patchwork",
] as const;

/** Landing page visuals (subset of the public demo hang). */
export const LANDING_ARTWORK_KEYS = [
  "negative-space-vii",
  "portfolio-red",
  "halation",
  "cityscape",
  "blue-grid",
  "primary-interval",
] as const;
