import { useEffect, useMemo, useState } from "react";
import { fetchPublicExhibition } from "@/hooks/use-exhibitions";
import {
  buildExhibitionShareMeta,
  type ExhibitionShareMeta,
} from "@/lib/exhibition/social-meta";
import {
  deriveExhibitionArtists,
  formatExhibitionDates,
  resolveFeaturingLine,
} from "@/lib/exhibition/details";
import { getRoomTemplate } from "@/rooms/templates";
import type { Artwork } from "@/types/artwork";
import type { Exhibition, PlacementWithArtwork } from "@/types";

function sortPlacements(placements: PlacementWithArtwork[]) {
  return [...placements].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.created_at.localeCompare(b.created_at),
  );
}

export function usePublicShowExhibition(slug: string | undefined) {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [placements, setPlacements] = useState<PlacementWithArtwork[]>([]);
  const [catalogueArtworks, setCatalogueArtworks] = useState<Artwork[]>([]);
  const [presenterName, setPresenterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchPublicExhibition(slug).then((result) => {
      if (!result) {
        setNotFound(true);
        setExhibition(null);
      } else {
        setExhibition(result.exhibition);
        setPlacements(result.placements);
        setCatalogueArtworks(result.catalogueArtworks ?? []);
        setPresenterName(result.presenterName ?? null);
      }
      setLoading(false);
    });
  }, [slug]);

  const sortedPlacements = useMemo(
    () => sortPlacements(placements),
    [placements],
  );

  const room = useMemo(
    () => getRoomTemplate(exhibition?.room_template_id ?? "white-cube"),
    [exhibition?.room_template_id],
  );

  const exhibitionDates = exhibition
    ? formatExhibitionDates(exhibition.opens_at, exhibition.closes_at)
    : null;

  const featuringLine = exhibition
    ? resolveFeaturingLine(
        exhibition,
        deriveExhibitionArtists(
          catalogueArtworks,
          placements,
          catalogueArtworks.length > 0,
        ),
      )
    : null;

  const shareMeta = useMemo<ExhibitionShareMeta | null>(() => {
    if (!exhibition) return null;

    return buildExhibitionShareMeta({
      exhibition,
      placements: sortedPlacements,
      catalogueArtworks,
      presenterName,
      origin: window.location.origin,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    });
  }, [exhibition, sortedPlacements, catalogueArtworks, presenterName]);

  return {
    loading,
    notFound,
    exhibition,
    placements,
    catalogueArtworks,
    presenterName,
    sortedPlacements,
    room,
    exhibitionDates,
    featuringLine,
    shareMeta,
  };
}
