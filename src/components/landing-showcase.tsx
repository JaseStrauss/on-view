import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LandingArtImage } from "@/components/landing/landing-art-image";
import { LANDING_ARTWORKS } from "@/data/landing-artworks";
import { DEMO_EXHIBITION_TITLE, DEMO_SLUG } from "@/data/demo-exhibition";
import { cn } from "@/lib/utils";

const showcaseWorks = LANDING_ARTWORKS.slice(0, 3);

interface LandingShowcaseProps {
  className?: string;
}

export function LandingShowcase({ className }: LandingShowcaseProps) {
  const [featured, ...supporting] = showcaseWorks;

  return (
    <Link
      to={`/show/${DEMO_SLUG}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md transition-all hover:border-border hover:shadow-xl",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100/80 via-transparent to-stone-200/40 dark:from-stone-900/50 dark:to-stone-800/30" />

      <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[240px] border-b border-border/60 p-5 sm:min-h-[300px] sm:p-6 lg:min-h-0 lg:border-b-0 lg:border-r">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
            Demo exhibition
          </p>
          <p className="mt-2 font-serif text-2xl italic sm:text-3xl">
            {DEMO_EXHIBITION_TITLE}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            One link · virtual room + catalogue
          </p>

          <div className="mt-6 flex items-end gap-3 sm:mt-8 sm:gap-4">
            <div
              className={cn(
                "relative aspect-[4/5] w-[44%] overflow-hidden bg-white p-[3px] shadow-lg ring-1 ring-black/10",
                "transition-[transform,box-shadow] duration-700 ease-out",
                "motion-safe:group-hover:scale-[1.02] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:shadow-xl",
              )}
            >
              <LandingArtImage
                artwork={featured}
                loading="eager"
                decorative
                className={cn(
                  "absolute inset-0 bg-muted landing-art-breathe motion-reduce:scale-100",
                  "motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-700",
                )}
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {supporting.map((work) => (
                <div
                  key={work.title}
                  className={cn(
                    "relative aspect-[5/4] overflow-hidden bg-white p-px shadow-md ring-1 ring-black/10",
                    "transition-[transform,box-shadow] duration-700 ease-out",
                    "motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:shadow-lg",
                  )}
                >
                  <LandingArtImage
                    artwork={work}
                    decorative
                    className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between p-5 sm:p-6 lg:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The page your audience receives: a walkable gallery room and a
            publication-style catalogue from a single link.
          </p>

          <ol className="my-6 space-y-3 border-y border-border/60 py-5">
            {showcaseWorks.map((work, index) => (
              <li key={work.title} className="flex gap-3">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{work.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {work.artist}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="inline-flex items-center gap-2 text-sm font-medium">
            Walk the demo show
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </Link>
  );
}
