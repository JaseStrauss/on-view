import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LandingHeroVisual } from "@/components/landing/landing-hero-visual";
import { LANDING_FEATURE_VISUALS } from "@/components/landing/landing-feature-visuals";
import { LandingTryLive } from "@/components/landing/landing-try-live";
import { LandingUseCases } from "@/components/landing/landing-use-cases";
import { LandingShowcase } from "@/components/landing-showcase";
import { DEMO_SLUG } from "@/data/demo-exhibition";
import { DEMO_STUDIO_PATH, isPublicDemoOnly } from "@/lib/public-demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_SHOW_PATH = `/show/${DEMO_SLUG}`;

const features = [
  {
    id: "catalogue" as const,
    eyebrow: "Catalogue",
    title: "A working catalogue",
    description:
      "Images, titles, dimensions, and availability: the record you maintain for every work in the exhibition.",
  },
  {
    id: "gallery" as const,
    eyebrow: "Installation",
    title: "Preview the hang",
    description:
      "Hang works in a walkable room: plan scale and spacing before install day, or publish the room as the show when you do not have walls yet.",
  },
  {
    id: "share" as const,
    eyebrow: "Publication",
    title: "One exhibition link",
    description:
      "Open the show and share a single URL: virtual room and publication-style catalogue together.",
  },
] as const;

interface LandingTooltipButtonProps {
  tooltip: string;
  children: React.ReactNode;
}

function LandingTooltipButton({
  tooltip,
  children,
}: LandingTooltipButtonProps) {
  return (
    <div className="group/tooltip relative flex">
      <div className="flex">{children}</div>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-2 min-w-56 max-w-xs -translate-x-1/2 rounded-md border border-border/80 bg-background px-2.5 py-1.5 text-center text-xs text-muted-foreground shadow-md",
          "opacity-0 transition-opacity duration-150",
          "group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100",
        )}
      >
        {tooltip}
      </span>
    </div>
  );
}

export function LandingPage() {
  const publicDemoOnly = isPublicDemoOnly();

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
          aria-hidden
        >
          <div className="absolute -right-20 top-0 h-[480px] w-[480px] rounded-full bg-stone-300/50 blur-3xl dark:bg-stone-600/20" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-stone-200/60 blur-3xl dark:bg-stone-700/15" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                For artists, curators & small galleries
              </p>
              <h1 className="mt-5 font-serif text-4xl leading-[1.08] italic sm:text-5xl md:text-6xl">
                Catalogue artworks.
                <span className="block">Curate exhibitions.</span>
                <span className="block text-foreground/80">
                  Share them online.
                </span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                Catalogue works, hang them in a walkable room, and share one
                exhibition link. For artists publishing on their own timeline,
                and for curators and small galleries planning an install or
                running a show without permanent space.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <LandingTooltipButton tooltip="Walk the 3D show your audience receives">
                  <Button size="lg" render={<Link to={DEMO_SHOW_PATH} />}>
                    Walk the demo show
                    <ArrowRight className="size-4" />
                  </Button>
                </LandingTooltipButton>
                {!publicDemoOnly && (
                  <Button
                    variant="outline"
                    size="lg"
                    render={<Link to="/signup" />}
                  >
                    Start your studio
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                {!publicDemoOnly && (
                  <>
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                    {" · "}
                  </>
                )}
                Building a show?{" "}
                <Link
                  to={DEMO_STUDIO_PATH}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Open the demo studio
                </Link>
              </p>
            </div>

            <LandingHeroVisual
              className="shadow-2xl ring-1 ring-black/5 motion-safe:transition-shadow motion-safe:duration-700 motion-safe:hover:shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
            />
          </div>

          <div className="mt-12 lg:mt-16">
            <LandingShowcase />
          </div>
        </div>
      </section>

      <LandingTryLive className="border-b border-border/60 bg-muted/20" />

      <LandingUseCases />

      {/* Product features */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl italic md:text-4xl">
            Catalogue to shareable show
          </h2>
          <p className="mt-4 text-muted-foreground">
            From catalogue to installation preview to a single exhibition link:
            for your audience, your artists, and your install team.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
          {features.map((feature) => {
            const Visual = LANDING_FEATURE_VISUALS[feature.id];
            return (
              <li key={feature.id} className="h-full">
                <article
                  className={cn(
                    "flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
                  )}
                >
                  <div className="aspect-[16/10] shrink-0 overflow-hidden bg-muted/30 p-3 sm:p-4">
                    <Visual />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                      {feature.eyebrow}
                    </p>
                    <h3 className="mt-2 font-serif text-xl italic sm:text-2xl">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center">
          <Link
            to={DEMO_SHOW_PATH}
            className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          >
            See it in the demo show
            <ArrowRight className="size-4" />
          </Link>
        </p>
      </section>

      {/* Closing */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2 className="font-serif text-3xl italic md:text-4xl">
            Put your next show on view.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start with the walkable demo show—visitor room and catalogue, no
            account required.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link to={DEMO_SHOW_PATH} />}>
              Walk the demo show
              <ArrowRight className="size-4" />
            </Button>
          </div>
          {!publicDemoOnly && (
            <p className="mt-6 text-sm text-muted-foreground">
              Ready to publish your own?{" "}
              <Link
                to="/signup"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
