import { LandingDemoSnapshot } from "@/components/landing/landing-demo-snapshot";
import { cn } from "@/lib/utils";

interface LandingHeroVisualProps {
  className?: string;
}

/** Hero preview: still frame of the demo exhibition hang. */
export function LandingHeroVisual({ className }: LandingHeroVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#d6d3d1] sm:aspect-[16/11] dark:bg-[#1c1917]",
        className,
      )}
    >
      <LandingDemoSnapshot priority className="absolute inset-0 rounded-none" />
    </div>
  );
}
