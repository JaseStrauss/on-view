import { Suspense, useEffect, useRef, useState } from "react";
import { LandingGalleryLoop } from "@/components/landing/landing-gallery-loop";
import { LandingRoomScene } from "@/components/landing/landing-room-scene";
import { useLowEndDevice } from "@/hooks/use-low-end-device";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

interface LandingHeroVisualProps {
  className?: string;
}

/**
 * Hero preview: lazy 3D orbit on capable devices, CSS catalogue scene otherwise.
 */
export function LandingHeroVisual({ className }: LandingHeroVisualProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lowEnd = useLowEndDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [use3d, setUse3d] = useState(false);

  const canUse3d = !reducedMotion && !lowEnd;

  useEffect(() => {
    if (!canUse3d) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [canUse3d]);

  useEffect(() => {
    if (inView && canUse3d) {
      setUse3d(true);
    }
  }, [inView, canUse3d]);

  const catalogueScene = (
    <LandingRoomScene
      motion={canUse3d}
      interactive={canUse3d}
      className="h-full w-full rounded-none"
    />
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[5/4] overflow-hidden rounded-2xl sm:aspect-[16/11]",
        className,
      )}
    >
      {use3d ? (
        <Suspense fallback={catalogueScene}>
          <LandingGalleryLoop className="h-full w-full rounded-none border-0" />
        </Suspense>
      ) : (
        catalogueScene
      )}
    </div>
  );
}
