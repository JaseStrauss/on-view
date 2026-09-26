import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LandingArtwork } from "@/data/landing-artworks";

interface LandingArtImageProps {
  artwork: Pick<LandingArtwork, "image" | "fallback" | "title">;
  className?: string;
  loading?: "lazy" | "eager";
  /** Decorative frames in mockups should not expose alt text when images fail */
  decorative?: boolean;
}

export function LandingArtImage({
  artwork,
  className,
  loading = "lazy",
  decorative = false,
}: LandingArtImageProps) {
  const [src, setSrc] = useState(artwork.image);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "h-full w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 dark:from-stone-800 dark:via-stone-700 dark:to-stone-900",
          className,
        )}
        aria-hidden={decorative}
      />
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? "" : artwork.title}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("block h-full w-full object-cover", className)}
      onError={() => {
        if (src !== artwork.fallback) {
          setSrc(artwork.fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
