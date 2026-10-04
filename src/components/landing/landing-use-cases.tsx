import { Building2, Palette, PencilRuler } from "lucide-react";
import { cn } from "@/lib/utils";

const useCases = [
  {
    id: "artists",
    eyebrow: "Artists",
    title: "Publish before the venue is booked",
    description:
      "When a brick-and-mortar slot is not lined up yet, you can still hang the work, build the catalogue, and send one link that reads like a real show.",
    icon: Palette,
  },
  {
    id: "curators",
    eyebrow: "Curators & small galleries",
    title: "A room when walls are scarce",
    description:
      "Pop-ups, project spaces, and lean programmes: run a complete exhibition online when you do not have permanent space, or alongside a physical partner venue.",
    icon: Building2,
  },
  {
    id: "install",
    eyebrow: "Before install day",
    title: "Plan the hang, then build it",
    description:
      "Walk the layout in 3D, check scale and spacing on the walls, and share the preview with artists and installers before anyone touches a nail.",
    icon: PencilRuler,
  },
] as const;

interface LandingUseCasesProps {
  className?: string;
}

export function LandingUseCases({ className }: LandingUseCasesProps) {
  return (
    <section
      className={cn(
        "border-b border-border/60 bg-muted/10",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl italic md:text-4xl">
            With a venue or without
          </h2>
          <p className="mt-4 text-muted-foreground">
            The same tool for publishing a show online and for rehearsing the
            hang before install. Artists, curators, and small galleries use it
            both ways.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="h-full">
                <article
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
                      {item.eyebrow}
                    </p>
                    <div
                      className="shrink-0 rounded-xl border border-border/60 bg-muted/40 p-2.5 text-muted-foreground"
                      aria-hidden
                    >
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-serif text-xl italic sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
