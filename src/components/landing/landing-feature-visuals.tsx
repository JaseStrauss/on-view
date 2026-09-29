import { Copy, Link2, Move } from "lucide-react";
import { LandingArtImage } from "@/components/landing/landing-art-image";
import {
  LANDING_ARTWORKS,
  VISITOR_PREVIEW_ARTWORKS,
  type LandingArtwork,
} from "@/data/landing-artworks";
import { DEMO_EXHIBITION_TITLE, DEMO_SLUG } from "@/data/demo-exhibition";
import { cn } from "@/lib/utils";

function VisualFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background p-2.5 shadow-sm",
        "motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.01]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Studio catalogue: list of works with metadata */
export function CatalogueFeatureVisual() {
  const rows = LANDING_ARTWORKS.slice(0, 3);

  return (
    <VisualFrame className="items-stretch justify-stretch">
      <div className="flex min-h-0 w-full flex-col gap-1">
        <div className="flex shrink-0 items-center justify-between px-0.5">
          <span className="text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground">
            Catalogue
          </span>
          <span className="rounded-full bg-muted px-1.5 py-px text-[0.5rem] text-muted-foreground">
            12 works
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1">
          {rows.map((work, index) => (
            <div
              key={work.title}
              className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card p-1"
            >
              <div className="relative size-7 shrink-0 overflow-hidden rounded bg-muted">
                <LandingArtImage
                  artwork={work}
                  decorative
                  className="absolute inset-0 object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.6rem] font-medium leading-tight">
                  {work.title}
                </p>
                <p className="truncate text-[0.5rem] text-muted-foreground">
                  {work.artist}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-1 py-px text-[0.45rem] leading-none",
                  index === 0
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index === 0 ? "Available" : index === 1 ? "On loan" : "Sold"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

const COMPACT_HANG_HEIGHT_REM = 4.25;
const LARGE_HANG_HEIGHT_REM = 7;
/** Salon hang: flanking works shorter, centre piece tallest. */
const SALON_HEIGHT_SCALE = [0.84, 1, 0.9] as const;

function galleryFrameStyle(
  work: LandingArtwork,
  index: number,
  size: "compact" | "large",
) {
  const scale = SALON_HEIGHT_SCALE[index] ?? 1;

  if (work.width_cm && work.height_cm) {
    const baseHeightRem =
      size === "large" ? LARGE_HANG_HEIGHT_REM : COMPACT_HANG_HEIGHT_REM;

    return {
      aspectRatio: `${work.width_cm} / ${work.height_cm}`,
      height: `${baseHeightRem * scale}rem`,
    } satisfies React.CSSProperties;
  }

  return undefined;
}

/** Gallery space: wall plan with hung works */
export function GallerySpaceFeatureVisual({
  artworks = LANDING_ARTWORKS.slice(0, 3),
  size = "compact",
}: {
  artworks?: LandingArtwork[];
  size?: "compact" | "large";
} = {}) {
  const works = artworks;
  const isLarge = size === "large";

  return (
    <VisualFrame
      className={cn(
        "items-stretch justify-stretch bg-stone-100 dark:bg-stone-900/50",
        isLarge && "rounded-none border-0 p-0 shadow-none",
      )}
    >
      <div className="flex h-full min-h-0 w-full flex-col gap-1">
        <div className="flex shrink-0 gap-1 px-0.5">
          <span className="rounded-md bg-background px-1.5 py-px text-[0.5rem] font-medium shadow-sm">
            North wall
          </span>
          <span className="rounded-md px-1.5 py-px text-[0.5rem] text-muted-foreground">
            East
          </span>
        </div>
        <div
          className={cn(
            "relative flex min-h-0 flex-1 rounded-md border border-stone-300/80 bg-white dark:border-stone-600 dark:bg-stone-50/95",
            isLarge
              ? "items-center justify-center px-6 py-5"
              : "items-center justify-center p-3",
          )}
        >
          <div
            className={cn(
              "flex items-end justify-center",
              isLarge ? "w-full max-w-full gap-[6%]" : "max-w-full gap-2.5",
            )}
          >
            {works.map((work, i) => (
              <div
                key={work.title}
                style={galleryFrameStyle(work, i, size)}
                className={cn(
                  "relative overflow-hidden bg-white p-0.5 shadow-md ring-1 ring-black/10",
                  isLarge
                    ? "max-h-full w-auto max-w-[30%] shrink"
                    : "shrink-0",
                  !work.width_cm &&
                  (i === 1
                    ? "aspect-[4/5] h-[4.25rem]"
                    : "aspect-[3/4] h-[3.5rem]"),
                )}
              >
                <LandingArtImage artwork={work} decorative className="absolute inset-0" />
                {i === 1 && (
                  <span
                    className="absolute right-0.5 top-0.5 flex size-3 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground"
                    aria-hidden
                  >
                    <Move className="size-1.5" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

/** Share link: public exhibition URL preview */
export function ShareLinkFeatureVisual() {
  return (
    <VisualFrame className="items-stretch justify-stretch">
      <div className="flex h-full min-h-0 w-full flex-col gap-1.5">
        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-1">
          <Link2 className="size-2.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate font-mono text-[0.5rem] text-foreground/80">
            onview.app/show/{DEMO_SLUG}
          </span>
          <span className="flex size-4 shrink-0 items-center justify-center rounded bg-background shadow-sm">
            <Copy className="size-2 text-muted-foreground" />
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
          <div className="shrink-0 border-b border-border/50 px-2 py-1">
            <p className="text-[0.45rem] uppercase tracking-widest text-muted-foreground">
              Exhibition
            </p>
            <p className="font-serif text-xs italic leading-tight">
              {DEMO_EXHIBITION_TITLE}
            </p>
            <p className="text-[0.4rem] text-muted-foreground">
              Room + catalogue · one link
            </p>
          </div>
          <div className="flex min-h-0 flex-1 items-center gap-1.5 p-1.5">
            <div className="relative aspect-[4/3] w-[34%] shrink-0 overflow-hidden rounded-sm bg-muted">
              <LandingArtImage
                artwork={VISITOR_PREVIEW_ARTWORKS[0]}
                decorative
                className="absolute inset-0"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <div className="h-1 w-full rounded-full bg-muted" />
              <div className="h-1 w-4/5 rounded-full bg-muted/70" />
              <span className="mt-0.5 inline-flex w-fit rounded-full bg-primary/10 px-1.5 py-px text-[0.4rem] font-medium text-primary">
                Open
              </span>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

export const LANDING_FEATURE_VISUALS = {
  catalogue: CatalogueFeatureVisual,
  gallery: GallerySpaceFeatureVisual,
  share: ShareLinkFeatureVisual,
} as const;
