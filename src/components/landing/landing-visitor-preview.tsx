import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LandingArtImage } from "@/components/landing/landing-art-image";
import { VISITOR_PREVIEW_ARTWORKS } from "@/data/landing-artworks";
import { DEMO_EXHIBITION_TITLE, DEMO_SLUG } from "@/data/demo-exhibition";
import { cn } from "@/lib/utils";

interface LandingVisitorPreviewProps {
  className?: string;
}

/** What visitors see: room + catalogue in one page (not another 3D room illustration). */
export function LandingVisitorPreview({ className }: LandingVisitorPreviewProps) {
  const [hero, ...catalogue] = VISITOR_PREVIEW_ARTWORKS;

  return (
    <Link
      to={`/show/${DEMO_SLUG}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:border-border hover:shadow-xl",
        className,
      )}
    >
      <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="mx-auto flex max-w-[280px] items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500/80" />
          <span className="truncate font-mono text-[0.65rem] text-muted-foreground">
            onview.app/show/demo
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-center text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">
          Exhibition
        </p>
        <p className="mt-2 text-center font-serif text-2xl italic">
          {DEMO_EXHIBITION_TITLE}
        </p>

        <div className="relative mt-5 overflow-hidden rounded-xl bg-gradient-to-b from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-950">
          <div className="aspect-[16/10] p-4">
            <div className="flex h-full items-center justify-center gap-3">
              {[hero, catalogue[0]].map((work) => (
                <div
                  key={work.title}
                  className="relative aspect-[3/4] w-[28%] overflow-hidden bg-white p-px shadow-lg ring-1 ring-black/10"
                >
                  <LandingArtImage
                    artwork={work}
                    decorative
                    className="absolute inset-0"
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="border-t border-white/20 py-2 text-center text-[0.6rem] uppercase tracking-widest text-stone-600 dark:text-stone-400">
            Virtual view
          </p>
        </div>

        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Catalogue
          </p>
          <ul className="mt-3 space-y-2">
            {catalogue.map((work, index) => (
              <li
                key={work.title}
                className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5"
              >
                <span className="text-[0.65rem] tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative size-8 shrink-0 overflow-hidden rounded bg-muted">
                  <LandingArtImage
                    artwork={work}
                    decorative
                    className="absolute inset-0"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{work.title}</p>
                  <p className="truncate text-[0.65rem] text-muted-foreground">
                    {work.artist}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-3 text-sm font-medium">
        Open demo exhibition
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
