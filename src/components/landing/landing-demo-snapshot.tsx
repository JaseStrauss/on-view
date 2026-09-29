import { DEMO_HERO_SNAPSHOT_SRC } from "@/data/demo-exhibition";
import { cn } from "@/lib/utils";

interface LandingDemoSnapshotProps {
  className?: string;
  /** Eager load for above-the-fold hero */
  priority?: boolean;
}

/** Static frame of the demo hang (`public/demo/surface-studies-hero.png`). */
export function LandingDemoSnapshot({
  className,
  priority = false,
}: LandingDemoSnapshotProps) {
  return (
    <img
      src={DEMO_HERO_SNAPSHOT_SRC}
      alt=""
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "block h-full min-h-[calc(100%+2px)] w-full min-w-full object-cover object-center",
        className,
      )}
    />
  );
}
