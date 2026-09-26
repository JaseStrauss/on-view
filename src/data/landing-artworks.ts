import { SAMPLE_ARTWORKS } from "@/data/sample-artworks";

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

/** Landing visuals — subset of the sample demo artworks. */
export const LANDING_ARTWORKS: LandingArtwork[] = SAMPLE_ARTWORKS.slice(
  0,
  5,
).map(toLandingArtwork);

/** Visitor preview mockup — distinct from hero/showcase/catalogue cards. */
export const VISITOR_PREVIEW_ARTWORKS: LandingArtwork[] = SAMPLE_ARTWORKS.slice(
  4,
  7,
).map(toLandingArtwork);
