import { useEffect, useMemo, useState } from "react";
import type { ImageDimensionsPx } from "@/lib/artwork/placement-size";
import { getArtworkImageUrl } from "@/services/artworks";

interface ArtworkImageSource {
  id: string;
  image_path: string | null;
}

export function useArtworkImageDimensions(
  artworks: ArtworkImageSource[],
): Map<string, ImageDimensionsPx> {
  const [dimensionsByArtworkId, setDimensionsByArtworkId] = useState<
    Map<string, ImageDimensionsPx>
  >(() => new Map());

  const sourceSignature = useMemo(
    () =>
      artworks
        .map((artwork) => `${artwork.id}:${artwork.image_path ?? ""}`)
        .join("|"),
    [artworks],
  );

  useEffect(() => {
    let cancelled = false;
    const sources = artworks.filter((artwork) => artwork.image_path);

    void (async () => {
      const entries = await Promise.all(
        sources.map(async (artwork) => {
          const url = getArtworkImageUrl(artwork.image_path);
          if (!url) return null;
          const dimensions = await loadImageDimensions(url);
          if (!dimensions) return null;
          return [artwork.id, dimensions] as const;
        }),
      );

      if (cancelled) return;

      setDimensionsByArtworkId((current) => {
        const next = new Map(current);
        for (const entry of entries) {
          if (!entry) continue;
          next.set(entry[0], entry[1]);
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceSignature, artworks]);

  return dimensionsByArtworkId;
}

function loadImageDimensions(src: string): Promise<ImageDimensionsPx | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => resolve(null);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
