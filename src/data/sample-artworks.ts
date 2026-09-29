import { unsplashImageUrl } from "@/lib/unsplash-image";

/**
 * Fictional sample works for the public demo show and landing visuals.
 * Images via Unsplash License — not real inventory.
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

const SAMPLE_ATTRIBUTION =
  "Demo placeholder via Unsplash. Fictional catalogue entry, not real inventory.";

export const SAMPLE_ARTWORKS: SampleArtwork[] = [
  {
    key: "chromatic-drift",
    title: "Chromatic Drift",
    artist: "Mara Okonkwo",
    year: 2024,
    medium: "Acrylic and resin on linen",
    width_cm: 140,
    height_cm: 110,
    image_path: unsplashImageUrl("1745355918854-f22165edab57"),
    description:
      "Layered resin and acrylic let color shift with the viewer's angle, turning the surface into a slow-moving field of hue.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
  {
    key: "negative-space-vii",
    title: "Negative Space VII",
    artist: "Elias Chen",
    year: 2022,
    medium: "Oil and graphite on canvas",
    width_cm: 160,
    height_cm: 120,
    image_path: unsplashImageUrl("1622542796254-5b9c46ab0d2f"),
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
    image_path: unsplashImageUrl("1533157950006-c38844053d55"),
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
    image_path: unsplashImageUrl("1760292343687-670782e53dd3"),
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
    image_path: unsplashImageUrl("1676200832719-35b267832b04"),
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
    image_path: unsplashImageUrl("1701979397910-a711c541f622"),
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
    image_path: unsplashImageUrl("1532949293134-3eb646d213f1"),
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
    image_path: unsplashImageUrl("1551554781-c46200ea959d"),
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
    image_path: unsplashImageUrl("1541961017774-22349e4a1262"),
    description:
      "Warm mineral pigments and a single curved motif anchor an otherwise open field of muted tone.",
    attribution: SAMPLE_ATTRIBUTION,
    isSample: true,
  },
];

/** Works used in the public /show/demo exhibition */
export const DEMO_CATALOGUE_KEYS = [
  "chromatic-drift",
  "negative-space-vii",
  "portfolio-red",
  "halation",
  "blue-grid",
  "harvest-table",
  "primary-interval",
  "soft-vertex",
  "terracotta-arch",
] as const;
