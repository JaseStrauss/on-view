import { LANDING_ARTWORK_KEYS, SAMPLE_ARTWORKS } from "@/data/sample-artworks";

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

const landingArtworkDefinitions = LANDING_ARTWORK_KEYS.map((key) =>
  SAMPLE_ARTWORKS.find((work) => work.key === key),
).filter(
  (work): work is (typeof SAMPLE_ARTWORKS)[number] => work !== undefined,
);

/** Landing visuals: curated subset of the public demo hang. */
export const LANDING_ARTWORKS: LandingArtwork[] =
  landingArtworkDefinitions.map(toLandingArtwork);

/** Visitor preview mockup: middle slice of landing picks. */
export const VISITOR_PREVIEW_ARTWORKS: LandingArtwork[] =
  landingArtworkDefinitions.slice(2, 5).map(toLandingArtwork);
