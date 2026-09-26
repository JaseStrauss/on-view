import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, ScanEye } from "lucide-react";
import { DEMO_SLUG } from "@/data/demo-exhibition";
import { DEMO_STUDIO_PATH } from "@/lib/public-demo";
import { cn } from "@/lib/utils";

const demos = [
  {
    id: "exhibition",
    title: "Demo exhibition",
    subtitle: "What your audience sees",
    description:
      "Walk a 3D gallery room and browse a publication-style catalogue: the shareable show link.",
    href: `/show/${DEMO_SLUG}`,
    icon: ScanEye,
    cta: "Open demo exhibition",
  },
  {
    id: "studio",
    title: "Demo studio",
    subtitle: "What you use to build a show",
    description:
      "Browse exhibitions and your catalogue: search, filter, and explore the curator workflow.",
    href: DEMO_STUDIO_PATH,
    icon: LayoutGrid,
    cta: "Open demo studio",
  },
] as const;

interface LandingTryLiveProps {
  className?: string;
}

export function LandingTryLive({ className }: LandingTryLiveProps) {
  return (
    <section className={cn("mx-auto max-w-6xl px-6 py-20 md:py-24", className)}>
      <div className="max-w-2xl">
        <h2 className="font-serif text-3xl italic md:text-4xl">Try it live</h2>
        <p className="mt-4 text-muted-foreground">
          Two demos, no account. Explore the visitor experience and the curator
          studio side by side.
        </p>
      </div>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <li key={demo.id}>
              <Link
                to={demo.href}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm",
                  "transition-all hover:border-border hover:shadow-lg",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                      {demo.subtitle}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl italic">
                      {demo.title}
                    </h3>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5 text-muted-foreground transition-colors group-hover:text-foreground">
                    <Icon className="size-5" aria-hidden />
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {demo.description}
                </p>

                <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  {demo.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Browse-only on the live site. Full save and publish is in the{" "}
        <a
          href="https://github.com/JaseStrauss/on-view"
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          GitHub repo
        </a>
        .
      </p>
    </section>
  );
}
