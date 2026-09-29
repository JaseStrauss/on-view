import { DEMO_CATALOGUE_KEYS, SAMPLE_ARTWORKS } from "@/data/sample-artworks";

export interface LandingArtwork {
  title: string;
  artist: string;
  year?: string;
  image: string;
  fallback: string;
  width_cm?: number;
  height_cm?: number;
}

function toLandingArtwork(
  work: (typeof SAMPLE_ARTWORKS)[number],
): LandingArtwork {
  return {
    title: work.title,
    artist: work.artist,
    year: String(work.year),
    image: work.image_path,
    fallback: work.image_path,
    width_cm: work.width_cm,
    height_cm: work.height_cm,
  };
}

const demoCatalogueArtworks = DEMO_CATALOGUE_KEYS.map((key) =>
  SAMPLE_ARTWORKS.find((work) => work.key === key),
).filter(
  (work): work is (typeof SAMPLE_ARTWORKS)[number] => work !== undefined,
);

/** Landing visuals — same works as the public demo catalogue. */
export const LANDING_ARTWORKS: LandingArtwork[] =
  demoCatalogueArtworks.map(toLandingArtwork);

/** Visitor preview mockup — distinct slice from the demo catalogue. */
export const VISITOR_PREVIEW_ARTWORKS: LandingArtwork[] = demoCatalogueArtworks
  .slice(3, 6)
  .map(toLandingArtwork);
