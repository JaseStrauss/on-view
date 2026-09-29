import { useCallback, useRef, useState } from "react";
import { LANDING_ARTWORKS } from "@/data/landing-artworks";
import { LandingArtImage } from "@/components/landing/landing-art-image";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

interface LandingRoomSceneProps {
  className?: string;
  /** [sideWall, backLeft, backCenter, backRight] — each index must be unique */
  artworkIndices?: [number, number, number, number];
  /** Ambient drift on light and focal work */
  motion?: boolean;
  /** Subtle pointer tilt — use on the hero scene only */
  interactive?: boolean;
}

function ArtFrame({
  artwork,
  className,
  eager,
  featured = false,
}: {
  artwork: (typeof LANDING_ARTWORKS)[number];
  className?: string;
  eager?: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/frame relative overflow-hidden bg-white p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-black/10",
        "transition-[transform,box-shadow] duration-700 ease-out",
        "motion-safe:hover:scale-[1.04] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_14px_32px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <LandingArtImage
        artwork={artwork}
        loading={eager ? "eager" : "lazy"}
        decorative
        className={cn(
          "absolute inset-0 bg-stone-200 transition-transform duration-700 ease-out",
          "motion-safe:group-hover/frame:scale-[1.03]",
          featured && "landing-art-breathe motion-reduce:scale-100",
        )}
      />
    </div>
  );
}

export function LandingRoomScene({
  className,
  artworkIndices = [3, 0, 1, 2],
  motion = true,
  interactive = false,
}: LandingRoomSceneProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [side, left, center, right] = artworkIndices.map(
    (i) => LANDING_ARTWORKS[i],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || prefersReducedMotion || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      setTilt({
        x: py * -4,
        y: px * 5,
      });
    },
    [interactive, prefersReducedMotion],
  );

  const resetTilt = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const enableTilt = interactive && !prefersReducedMotion;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[5/4] overflow-hidden rounded-2xl sm:aspect-[16/11]",
        enableTilt && "cursor-default",
        className,
      )}
      aria-hidden
      onPointerMove={enableTilt ? handlePointerMove : undefined}
      onPointerLeave={enableTilt ? resetTilt : undefined}
    >
      <div
        className="h-full w-full transition-transform duration-500 ease-out will-change-transform motion-reduce:transform-none"
        style={
          enableTilt
            ? {
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }
            : undefined
        }
      >
        {/* Room atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-stone-200 to-stone-300 dark:from-stone-900 dark:via-stone-800 dark:to-stone-950" />
        <div
          className={cn(
            "absolute inset-0 motion-reduce:opacity-60",
            motion && "landing-room-light",
          )}
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.9), transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-stone-400/50 to-transparent dark:from-stone-950/80" />

        {/* Perspective floor */}
        <div
          className="absolute inset-x-[6%] bottom-[6%] h-[22%] origin-bottom bg-stone-300/70 dark:bg-stone-800/60"
          style={{ transform: "perspective(800px) rotateX(52deg)" }}
        />

        {/* Left wall */}
        <div
          className="absolute bottom-[18%] left-[3%] top-[14%] w-[12%] overflow-hidden bg-gradient-to-r from-stone-300 to-stone-100 dark:from-stone-800 dark:to-stone-200/90"
          style={{
            transform: "perspective(600px) rotateY(28deg)",
            transformOrigin: "left center",
          }}
        >
          <ArtFrame
            artwork={side}
            className="absolute left-[22%] top-[28%] aspect-[3/4] w-[58%]"
          />
        </div>

        {/* Back wall */}
        <div className="absolute inset-x-[14%] bottom-[20%] top-[14%] bg-white shadow-[inset_0_0_60px_rgba(0,0,0,0.06)] dark:bg-stone-50/95">
          <div className="flex h-full items-center justify-center gap-[3%] px-[5%] pb-[2%] pt-[4%]">
            <ArtFrame artwork={left} className="aspect-[3/4] w-[26%]" eager />
            <ArtFrame
              artwork={center}
              className="aspect-[4/5] w-[32%] -translate-y-[2%]"
              eager
              featured={motion}
            />
            <ArtFrame artwork={right} className="aspect-[3/4] w-[26%]" eager />
          </div>
        </div>

        {/* Right wall */}
        <div
          className="absolute bottom-[18%] right-0 top-[14%] w-[14%] bg-gradient-to-l from-stone-300 to-stone-100 dark:from-stone-800 dark:to-stone-200/90"
          style={{
            transform: "perspective(600px) rotateY(-28deg)",
            transformOrigin: "right center",
          }}
        />

        {/* Baseboard / depth cue */}
        <div className="absolute inset-x-[14%] bottom-[18%] h-1 bg-stone-300/80 dark:bg-stone-600/50" />
      </div>
    </div>
  );
}
