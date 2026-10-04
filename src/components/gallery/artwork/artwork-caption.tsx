import { cn } from "@/lib/utils";
import {
  formatMediumLine,
  formatTitleLine,
} from "@/lib/artwork/caption";
import type { Artwork } from "@/types/artwork";

interface ArtworkCaptionProps {
  artwork: Artwork;
  /** Wall label on a plinth; catalogue entry; compact inline */
  variant?: "wall-label" | "catalogue" | "compact";
  className?: string;
  align?: "left" | "center";
}

export function ArtworkCaption({
  artwork,
  variant = "catalogue",
  className,
  align = "left",
}: ArtworkCaptionProps) {
  const mediumLine = formatMediumLine(artwork);
  const alignClass = align === "center" ? "text-center" : "text-left";

  if (variant === "compact") {
    return (
      <p className={cn("text-sm text-muted-foreground", alignClass, className)}>
        <span className="text-foreground">{artwork.artist}</span>
        {", "}
        <span className="italic">{formatTitleLine(artwork)}</span>
        {mediumLine ? `. ${mediumLine}` : null}
      </p>
    );
  }

  return (
    <figcaption
      className={cn(
        "max-w-md space-y-1",
        alignClass,
        variant === "wall-label" && "border-l-2 border-foreground/15 pl-4",
        variant === "catalogue" && "pt-6",
        className,
      )}
    >
      <p
        className={cn(
          "font-sans tracking-wide text-foreground",
          variant === "wall-label"
            ? "text-sm font-medium"
            : "text-base font-medium",
        )}
      >
        {artwork.artist}
      </p>
      <p
        className={cn(
          "font-serif italic leading-snug text-foreground",
          variant === "wall-label" ? "text-base" : "text-xl md:text-2xl",
        )}
      >
        {formatTitleLine(artwork)}
      </p>
      {mediumLine && (
        <p
          className={cn(
            "font-sans text-muted-foreground",
            variant === "wall-label" ? "text-xs" : "text-sm",
          )}
        >
          {mediumLine}
        </p>
      )}
      {artwork.description?.trim() && (
        <p
          className={cn(
            "font-sans leading-relaxed text-muted-foreground",
            variant === "wall-label" ? "text-xs" : "text-sm",
            variant === "catalogue" && "max-w-2xl pt-2",
          )}
        >
          {artwork.description.trim()}
        </p>
      )}
    </figcaption>
  );
}
