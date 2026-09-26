import { createClient } from "@supabase/supabase-js";
import { DEMO_EXHIBITION_TITLE } from "../../src/data/demo-exhibition";
import {
  buildExhibitionShareMeta,
  DEFAULT_OG_IMAGE,
  renderShareMetaHtml,
  type ExhibitionShareMeta,
} from "../../src/lib/exhibition-social-meta";
import type { Artwork } from "../../src/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "../../src/types";

const DEMO_SLUG = "demo";
const DEMO_DESCRIPTION =
  "A sample contemporary hang. Explore the 3D gallery, then build your own.";

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  return { url, key };
}

function getSupabaseClient() {
  const { url, key } = getSupabaseEnv();

  if (!url || !key) return null;
  return createClient(url, key);
}

function demoShareMeta(origin: string): ExhibitionShareMeta {
  return {
    title: `${DEMO_EXHIBITION_TITLE} — On View`,
    description: `${DEMO_DESCRIPTION} · Virtual exhibition on On View`,
    imageUrl: DEFAULT_OG_IMAGE,
    url: `${origin}/show/${DEMO_SLUG}`,
    siteName: "On View",
  };
}

export async function fetchShowShareMeta(
  slug: string,
  origin: string,
): Promise<ExhibitionShareMeta | null> {
  if (slug === DEMO_SLUG) {
    return demoShareMeta(origin);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const supabaseUrl = getSupabaseEnv().url ?? "";

  const { data: exhibition, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !exhibition) return null;

  const [{ data: placements }, { data: catalogueRows }, profileResult] =
    await Promise.all([
      supabase
        .from("placements")
        .select("*, artwork:artworks(*)")
        .eq("exhibition_id", exhibition.id)
        .order("sort_order"),
      supabase
        .from("exhibition_catalogue")
        .select("artwork:artworks(*)")
        .eq("exhibition_id", exhibition.id)
        .order("sort_order"),
      supabase
        .from("profiles")
        .select("studio_name, display_name")
        .eq("id", exhibition.user_id)
        .maybeSingle(),
    ]);

  const catalogueArtworks = (catalogueRows ?? [])
    .map((row) => {
      const artwork = row.artwork;
      if (!artwork || Array.isArray(artwork)) return null;
      return artwork as Artwork;
    })
    .filter((artwork): artwork is Artwork => artwork !== null);

  const presenterName =
    profileResult.data?.studio_name?.trim() ||
    profileResult.data?.display_name?.trim() ||
    null;

  return buildExhibitionShareMeta({
    exhibition: exhibition as Exhibition,
    placements: (placements ?? []) as PlacementWithArtwork[],
    catalogueArtworks,
    presenterName,
    origin,
    supabaseUrl,
  });
}

export async function renderShowMetaHtml(
  slug: string,
  origin: string,
): Promise<string | null> {
  const meta = await fetchShowShareMeta(slug, origin);
  if (!meta) return null;
  return renderShareMetaHtml(meta);
}
